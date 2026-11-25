import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { InteractionManager, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, ProgressBar, SectionLabel, TextField, Txt } from '@/components/ui';
import {
  getCurriculumProgress,
  getStats,
  getTasks,
  requestAiCoachTask,
  updateCurriculumProgress,
} from '@/lib/api';
import { CacheKeys, removeCachedData } from '@/lib/cache';
import { useErrorDialog } from '@/lib/error-dialog';
import {
  deriveSubjectCurriculumState,
  foldTurkish,
  getCurriculumSubjectsForGrade,
  getFlatTopicsForSubject,
  gradeTopicPerformance,
  loadExtraCompletedTopics,
  mergeExtraIntoCurriculumProgress,
  saveExtraCompletedTopics,
  searchSubjectUnits,
  type CurriculumProgressMap,
  type ExtraCompletedTopicsMap,
  type TopicPerformanceGrade,
} from '@/lib/maarif-curriculum';
import { useSession } from '@/lib/session';
import type { Student } from '@/lib/types';
import {
  Accent,
  Border,
  DetailAccent,
  Palette,
  Radius,
  Space,
  pillRadius,
  softOf,
} from '@/theme/tokens';

type TopicSolvedStats = {
  subject: string;
  topic: string;
  solved: number;
  correct: number;
  wrong: number;
  blank: number;
  studyCompleted: number;
  gradeInfo: TopicPerformanceGrade;
};

type FilterMode = 'all' | 'completed' | 'weak';

export default function SubjectsScreen() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, backgroundColor: Palette.bg }} />
      </Screen>
    );
  }

  if (!user || user.role !== 'student') {
    return <Redirect href="/login" />;
  }

  return <SubjectsScreenContent student={user} />;
}

function SubjectsScreenContent({ student }: { student: Student }) {
  const { setUser } = useSession();
  const { showError } = useErrorDialog();
  const router = useRouter();

  const gradeLabel = student.grade ?? '8. Sınıf';
  const subjects = useMemo(() => getCurriculumSubjectsForGrade(gradeLabel), [gradeLabel]);

  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(() => subjects[0]?.name ?? 'Matematik');
  const [progressMap, setProgressMap] = useState<CurriculumProgressMap>({});
  const [extraCompletedMap, setExtraCompletedMap] = useState<ExtraCompletedTopicsMap>({});
  const [topicStatsMap, setTopicStatsMap] = useState<Record<string, TopicSolvedStats>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [assigningTopicKey, setAssigningTopicKey] = useState<string | null>(null);
  const [assignedKeys, setAssignedKeys] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [savedProg, savedExtra, statsRes, dayTasks] = await Promise.all([
        getCurriculumProgress(student),
        loadExtraCompletedTopics(student.id),
        getStats().catch(() => null),
        getTasks('day').catch(() => []),
      ]);

      const effectiveProg = mergeExtraIntoCurriculumProgress(gradeLabel, savedProg, savedExtra);
      setProgressMap(effectiveProg);
      setExtraCompletedMap(savedExtra);

      const map: Record<string, TopicSolvedStats> = {};

      if (statsRes?.subjects) {
        for (const subj of statsRes.subjects) {
          for (const t of subj.topics) {
            const key = `${foldTurkish(subj.subject)}::${foldTurkish(t.topic)}`;
            map[key] = {
              subject: subj.subject,
              topic: t.topic,
              solved: t.solved,
              correct: t.correct,
              wrong: t.wrong,
              blank: t.blank,
              studyCompleted: t.studyCompleted,
              gradeInfo: gradeTopicPerformance(t.correct, t.wrong, t.blank),
            };
          }
        }
      }

      // Günlük görevlerde tamamlanmış veya çözülmüş varsa yerel olarak birleştir
      const localAgg: Record<
        string,
        { subject: string; topic: string; correct: number; wrong: number; blank: number; study: number }
      > = {};

      for (const task of dayTasks) {
        if (!task.completedAt && (task.correctCount || 0) === 0 && (task.wrongCount || 0) === 0) continue;
        const subj = task.subject || 'Matematik';
        const top = task.topic || task.title;
        const key = `${foldTurkish(subj)}::${foldTurkish(top)}`;
        if (!localAgg[key]) {
          localAgg[key] = { subject: subj, topic: top, correct: 0, wrong: 0, blank: 0, study: 0 };
        }
        if (task.category === 'topic') {
          if (task.completedAt) localAgg[key].study += 1;
        } else if (task.category === 'question') {
          const c = task.correctCount || 0;
          const w = task.wrongCount || 0;
          const b = task.completedAt && task.target > c + w ? Math.max(0, task.target - c - w) : 0;
          localAgg[key].correct += c;
          localAgg[key].wrong += w;
          localAgg[key].blank += b;
        }
      }

      for (const [key, agg] of Object.entries(localAgg)) {
        const existing = map[key];
        const correct = Math.max(existing?.correct ?? 0, agg.correct);
        const wrong = Math.max(existing?.wrong ?? 0, agg.wrong);
        const blank = Math.max(existing?.blank ?? 0, agg.blank);
        const solved = correct + wrong + blank;
        const studyCompleted = Math.max(existing?.studyCompleted ?? 0, agg.study);
        map[key] = {
          subject: existing?.subject ?? agg.subject,
          topic: existing?.topic ?? agg.topic,
          solved,
          correct,
          wrong,
          blank,
          studyCompleted,
          gradeInfo: gradeTopicPerformance(correct, wrong, blank),
        };
      }

      setTopicStatsMap(map);
    } catch (err) {
      showError(err, { title: 'Dersler yüklenemedi', code: 'SUBJECTS_LOAD' });
    }
  }, [student, gradeLabel, showError]);

  useFocusEffect(
    useCallback(() => {
      // Ekran açılış geçiş animasyonunun takılmaması için ağır yüklemeyi animasyon sonrasına ertele
      const task = InteractionManager.runAfterInteractions(() => {
        loadData();
      });
      return () => {
        task.cancel();
      };
    }, [loadData])
  );

  // Ekstra tamamlanan konular için O(1) erişimli küme
  const extraCompletedSet = useMemo(() => {
    const set = new Set<string>();
    for (const [subj, topics] of Object.entries(extraCompletedMap)) {
      const fSubj = foldTurkish(subj);
      for (const t of topics) {
        set.add(`${fSubj}::${foldTurkish(t)}`);
      }
    }
    return set;
  }, [extraCompletedMap]);

  // Bir konunun tamamlanmış (yeşil tikli) olup olmadığını O(1) kontrol eder:
  const isTopicCompleted = useCallback(
    (subjectName: string, topicName: string, orderIdx: number, schoolCurrentIdx: number): boolean => {
      if (orderIdx !== -1 && orderIdx <= schoolCurrentIdx) return true;
      const key = `${foldTurkish(subjectName)}::${foldTurkish(topicName)}`;
      if (extraCompletedSet.has(key)) return true;
      const st = topicStatsMap[key];
      if (st && (st.studyCompleted > 0 || st.solved > 0)) return true;
      return false;
    },
    [extraCompletedSet, topicStatsMap]
  );

  const handleToggleTopicCheck = useCallback(
    async (subjectName: string, topicName: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      const flatTopics = getFlatTopicsForSubject(gradeLabel, subjectName).map((f) => f.topic);
      const orderIdx = flatTopics.findIndex((t) => foldTurkish(t) === foldTurkish(topicName));
      const currState = deriveSubjectCurriculumState(gradeLabel, subjectName, progressMap[subjectName]);
      const wasCompleted = isTopicCompleted(subjectName, topicName, orderIdx, currState.currentIndex);

      const currentExtraList = extraCompletedMap[subjectName] ?? [];
      let nextExtraList: string[];
      let nextProgressTopic = progressMap[subjectName];

      if (!wasCompleted) {
        // Konuyu tamamlandı olarak işaretle ve en son gelinen konuyu ilerlet
        const exists = currentExtraList.some((t) => foldTurkish(t) === foldTurkish(topicName));
        nextExtraList = exists ? currentExtraList : [...currentExtraList, topicName];
        if (orderIdx >= currState.currentIndex && orderIdx !== -1) {
          nextProgressTopic = topicName;
        }
      } else {
        // Konu işaretini kaldır
        nextExtraList = currentExtraList.filter((t) => {
          const idx = flatTopics.findIndex((ft) => foldTurkish(ft) === foldTurkish(t));
          if (orderIdx !== -1 && orderIdx <= currState.currentIndex && idx >= orderIdx) {
            return false;
          }
          return foldTurkish(t) !== foldTurkish(topicName);
        });
        if (orderIdx !== -1 && orderIdx <= currState.currentIndex) {
          nextProgressTopic = orderIdx > 0 ? flatTopics[orderIdx - 1] : flatTopics[0] ?? '';
        }
      }

      const nextExtraMap: ExtraCompletedTopicsMap = {
        ...extraCompletedMap,
        [subjectName]: nextExtraList,
      };
      const baseNextProgress: CurriculumProgressMap = {
        ...progressMap,
        ...(nextProgressTopic ? { [subjectName]: nextProgressTopic } : {}),
      };
      const nextProgressMap = mergeExtraIntoCurriculumProgress(gradeLabel, baseNextProgress, nextExtraMap);

      setExtraCompletedMap(nextExtraMap);
      setProgressMap(nextProgressMap);

      await saveExtraCompletedTopics(nextExtraMap, student.id);
      const synced = await updateCurriculumProgress(nextProgressMap, student.id);
      setUser({
        ...student,
        curriculumProgress: synced,
      });
      void removeCachedData(CacheKeys.HOME_AI_CONTEXT);
    },
    [gradeLabel, progressMap, isTopicCompleted, extraCompletedMap, student, setUser]
  );

  const handleAssignTopicStudy = useCallback(
    async (subjectName: string, topicName: string) => {
      const key = `${subjectName}::${topicName}`;
      if (assigningTopicKey) return;
      setAssigningTopicKey(key);
      try {
        await requestAiCoachTask(subjectName, topicName);
        setAssignedKeys((prev) => ({ ...prev, [key]: true }));
      } catch (err) {
        showError(err, { title: 'Ödev atanamadı', code: 'SUBJECT_ASSIGN_TASK' });
      } finally {
        setAssigningTopicKey(null);
      }
    },
    [assigningTopicKey, showError]
  );

  const subjectSummaries = useMemo(() => {
    return subjects.map((subj) => {
      const state = deriveSubjectCurriculumState(gradeLabel, subj.name, progressMap[subj.name]);
      let completedTotal = 0;
      let solvedTotal = 0;
      let correctTotal = 0;
      let wrongTotal = 0;
      let weakCount = 0;

      state.allTopics.forEach((topic, idx) => {
        if (isTopicCompleted(subj.name, topic, idx, state.currentIndex)) {
          completedTotal += 1;
        }
        const key = `${foldTurkish(subj.name)}::${foldTurkish(topic)}`;
        const st = topicStatsMap[key];
        if (st) {
          solvedTotal += st.solved;
          correctTotal += st.correct;
          wrongTotal += st.wrong;
          if (st.gradeInfo.level === 'critical' || st.gradeInfo.level === 'weak') {
            weakCount += 1;
          }
        }
      });

      return {
        subject: subj,
        state,
        completedTotal,
        solvedTotal,
        correctTotal,
        wrongTotal,
        weakCount,
      };
    });
  }, [subjects, gradeLabel, progressMap, topicStatsMap, isTopicCompleted]);

  const activeSummary =
    subjectSummaries.find((s) => s.subject.name === selectedSubjectName) ?? subjectSummaries[0];

  const totalCompletedAll = subjectSummaries.reduce((acc, s) => acc + s.completedTotal, 0);
  const totalTopicsAll = subjectSummaries.reduce((acc, s) => acc + s.state.totalCount, 0);
  const totalSolvedAll = subjectSummaries.reduce((acc, s) => acc + s.solvedTotal, 0);

  // Aktif dersin konuları için O(1) indeks haritası
  const topicIndexMap = useMemo(() => {
    if (!activeSummary) return new Map<string, number>();
    const map = new Map<string, number>();
    activeSummary.state.allTopics.forEach((t, i) => map.set(t, i));
    return map;
  }, [activeSummary]);

  const visibleUnits = useMemo(() => {
    if (!activeSummary) return [];
    const searched = searchSubjectUnits(activeSummary.subject.units, searchQuery);
    if (filterMode === 'all') return searched;

    return searched
      .map((u) => ({
        ...u,
        topics: u.topics.filter((t) => {
          const orderIdx = topicIndexMap.get(t) ?? -1;
          const done = isTopicCompleted(
            activeSummary.subject.name,
            t,
            orderIdx,
            activeSummary.state.currentIndex
          );
          if (filterMode === 'completed') return done;
          const key = `${foldTurkish(activeSummary.subject.name)}::${foldTurkish(t)}`;
          const st = topicStatsMap[key];
          return st?.gradeInfo.level === 'critical' || st?.gradeInfo.level === 'weak';
        }),
      }))
      .filter((u) => u.topics.length > 0);
  }, [activeSummary, searchQuery, filterMode, isTopicCompleted, topicIndexMap, topicStatsMap]);

  return (
    <Screen tint={Accent}>
      <ScreenHeader
        title="Derslerim"
        subtitle={`${gradeLabel} · Türkiye Yüzyılı Maarif Modeli`}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/student'))}
      />

      {/* 1. Üst Özet ve Okulda Geldiğim Konuları Seç Kartı */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatBox}>
            <View style={styles.statIconWrapGreen}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Txt variant="tiny" color={Palette.textFaint}>
                TAMAMLANAN KONU
              </Txt>
              <Txt variant="bodyStrong" color={Palette.green}>
                {`${totalCompletedAll} / ${totalTopicsAll} Konu`}
              </Txt>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStatBox}>
            <View style={styles.statIconWrapAccent}>
              <Ionicons name="help-buoy" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Txt variant="tiny" color={Palette.textFaint}>
                ÇÖZÜLEN SORU
              </Txt>
              <Txt variant="bodyStrong" color={Palette.text}>
                {`${totalSolvedAll} Soru`}
              </Txt>
            </View>
          </View>
        </View>

        <ProgressBar
          progress={totalTopicsAll > 0 ? totalCompletedAll / totalTopicsAll : 0}
          color={DetailAccent}
          height={8}
          track={Palette.surfaceHi}
        />

        <NeonButton
          label="Okulda Geldiğim Konuları Seç"
          icon="school"
          color={Accent}
          size="md"
          full
          onPress={() => router.push('/curriculum-onboarding')}
        />
      </Card>

      {/* 2. Sınıf Seviyesindeki Ders Sekmeleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectTabs}
      >
        {subjectSummaries.map((item) => {
          const active = item.subject.name === activeSummary?.subject.name;
          return (
            <PressScale
              key={item.subject.name}
              onPress={() => {
                setSelectedSubjectName(item.subject.name);
                setSearchQuery('');
              }}
              scaleTo={0.96}
            >
              <View style={[styles.subjectTab, active && styles.subjectTabActive]}>
                <Txt variant="smallStrong" color={active ? '#FFFFFF' : Palette.text}>
                  {item.subject.name}
                </Txt>
                <View
                  style={[
                    styles.subjectCountChip,
                    { backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(251, 174, 117, 0.16)' },
                  ]}
                >
                  <Txt variant="tiny" color={active ? '#FFFFFF' : DetailAccent}>
                    {`${item.completedTotal}/${item.state.totalCount}`}
                  </Txt>
                </View>
              </View>
            </PressScale>
          );
        })}
      </ScrollView>

      {/* 3. Seçili Dersin Özet Satırı + Arama ve Filtre */}
      {activeSummary ? (
        <View style={styles.subjectBody}>
          <View style={styles.activeSubjectBanner}>
            <View style={styles.flex}>
              <Txt variant="bodyStrong">{activeSummary.subject.name}</Txt>
              <Txt variant="tiny" color={Palette.textDim}>
                {`${activeSummary.completedTotal}/${activeSummary.state.totalCount} Konu Tamamlandı · Toplam ${activeSummary.solvedTotal} Soru Çözüldü`}
                {activeSummary.solvedTotal > 0
                  ? ` (${activeSummary.correctTotal} Doğru, ${activeSummary.wrongTotal} Yanlış)`
                  : ''}
              </Txt>
            </View>
          </View>

          {/* Arama ve Hızlı Filtreler */}
          <View style={styles.filterBar}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={Palette.textFaint} />
              <TextField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`${activeSummary.subject.name} konusu ara...`}
                style={styles.flex}
              />
              {searchQuery.length > 0 ? (
                <PressScale onPress={() => setSearchQuery('')} scaleTo={0.9}>
                  <Ionicons name="close-circle" size={18} color={Palette.textFaint} />
                </PressScale>
              ) : null}
            </View>

            <View style={styles.filterChipsRow}>
              {(
                [
                  { id: 'all', label: `Tüm Konular (${activeSummary.state.totalCount})` },
                  { id: 'completed', label: `Tamamlananlar (${activeSummary.completedTotal})` },
                  { id: 'weak', label: `Eksik Konular (${activeSummary.weakCount})` },
                ] as const
              ).map((f) => {
                const isSelected = filterMode === f.id;
                return (
                  <PressScale key={f.id} onPress={() => setFilterMode(f.id)} scaleTo={0.96}>
                    <View
                      style={[
                        styles.filterChip,
                        isSelected && {
                          borderColor: DetailAccent,
                          backgroundColor: 'rgba(251, 174, 117, 0.16)',
                        },
                      ]}
                    >
                      <Txt
                        variant="tiny"
                        color={isSelected ? DetailAccent : Palette.textDim}
                      >
                        {f.label}
                      </Txt>
                    </View>
                  </PressScale>
                );
              })}
            </View>
          </View>

          {/* 4. Konu Listesi (Yeşil Tikli Tamamlananlar + Konu Bazlı Çözülen Soru Sayısı) */}
          {visibleUnits.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Txt variant="small" color={Palette.textDim} center>
                Bu filtrede görüntülenecek konu bulunmuyor.
              </Txt>
            </Card>
          ) : (
            visibleUnits.map((unit) => (
              <View key={unit.name} style={styles.unitGroup}>
                <SectionLabel>{unit.name}</SectionLabel>
                <View style={styles.topicList}>
                  {unit.topics.map((topic) => {
                    const orderIdx = topicIndexMap.get(topic) ?? -1;
                    const isSchoolCurrent = topic === activeSummary.state.currentTopic;
                    const completed = isTopicCompleted(
                      activeSummary.subject.name,
                      topic,
                      orderIdx,
                      activeSummary.state.currentIndex
                    );

                    const statsKey = `${foldTurkish(activeSummary.subject.name)}::${foldTurkish(topic)}`;
                    const st = topicStatsMap[statsKey];
                    const solvedCount = st?.solved ?? 0;
                    const correctCount = st?.correct ?? 0;
                    const wrongCount = st?.wrong ?? 0;
                    const gradeInfo = st?.gradeInfo ?? gradeTopicPerformance(0, 0, 0);
                    const isWeakTopic =
                      gradeInfo.level === 'critical' || gradeInfo.level === 'weak';

                    const assignKey = `${activeSummary.subject.name}::${topic}`;
                    const isAssigned = Boolean(assignedKeys[assignKey]);
                    const isAssigning = assigningTopicKey === assignKey;

                    return (
                      <TopicCardItem
                        key={topic}
                        topic={topic}
                        orderIdx={orderIdx}
                        completed={completed}
                        isSchoolCurrent={isSchoolCurrent}
                        isWeakTopic={isWeakTopic}
                        gradeInfo={gradeInfo}
                        solvedCount={solvedCount}
                        correctCount={correctCount}
                        wrongCount={wrongCount}
                        isAssigned={isAssigned}
                        isAssigning={isAssigning}
                        onToggleCheck={() => handleToggleTopicCheck(activeSummary.subject.name, topic)}
                        onAssign={() => handleAssignTopicStudy(activeSummary.subject.name, topic)}
                        onGoToTasks={() => router.push('/student/tasks')}
                      />
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Screen>
  );
}

type TopicCardItemProps = {
  topic: string;
  orderIdx: number;
  completed: boolean;
  isSchoolCurrent: boolean;
  isWeakTopic: boolean;
  gradeInfo: TopicPerformanceGrade;
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
  isAssigned: boolean;
  isAssigning: boolean;
  onToggleCheck: () => void;
  onAssign: () => void;
  onGoToTasks: () => void;
};

const TopicCardItem = React.memo(function TopicCardItem({
  topic,
  orderIdx,
  completed,
  isSchoolCurrent,
  isWeakTopic,
  gradeInfo,
  solvedCount,
  correctCount,
  wrongCount,
  isAssigned,
  isAssigning,
  onToggleCheck,
  onAssign,
  onGoToTasks,
}: TopicCardItemProps) {
  return (
    <View
      style={[
        styles.topicCard,
        completed && styles.topicCardCompletedGreen,
        isWeakTopic && styles.topicCardWeakBorder,
      ]}
    >
      <View style={styles.topicMainRow}>
        {/* Sol Yeşil Tik Butonu: Dokununca da konuyu tamamlandı işaretler */}
        <PressScale onPress={onToggleCheck} scaleTo={0.9}>
          <View
            style={[
              styles.checkButton,
              completed ? styles.checkButtonGreen : styles.checkButtonEmpty,
            ]}
          >
            {completed ? (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            ) : (
              <Txt variant="tiny" color={Palette.textDim}>
                {orderIdx + 1}
              </Txt>
            )}
          </View>
        </PressScale>

        {/* Konu Başlığı ve Durum Rozetleri */}
        <View style={styles.flex}>
          <Txt
            variant="bodyStrong"
            color={completed ? Palette.text : Palette.textDim}
          >
            {topic}
          </Txt>

          <View style={styles.badgesWrap}>
            {completed ? (
              <View style={styles.greenDoneBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                <Txt variant="tiny" color="#FFFFFF">
                  Tamamlandı
                </Txt>
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Henüz İşlenmedi
                </Txt>
              </View>
            )}

            {isSchoolCurrent ? (
              <View style={styles.currentSchoolBadge}>
                <Txt variant="tiny" color={Accent}>
                  Okulda Geldiğim Konu
                </Txt>
              </View>
            ) : null}

            {isWeakTopic ? (
              <View style={styles.weakWarningBadge}>
                <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                <Txt variant="tiny" color="#FFFFFF">
                  {gradeInfo.shortLabel}
                </Txt>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Konu Bazlı Çözülen Toplam Soru ve Doğru/Yanlış Bilgisi */}
      <View
        style={[
          styles.questionFooter,
          completed && styles.questionFooterGreen,
        ]}
      >
        <View style={styles.questionTotalBox}>
          <Ionicons
            name="document-text-outline"
            size={15}
            color={solvedCount > 0 ? Palette.green : Palette.textFaint}
          />
          <Txt
            variant="smallStrong"
            color={solvedCount > 0 ? Palette.text : Palette.textFaint}
          >
            {`Çözülen Soru: ${solvedCount}`}
          </Txt>
        </View>

        {solvedCount > 0 ? (
          <View style={styles.accuracyRow}>
            <Txt variant="tiny" color={Palette.green}>
              {`${correctCount} Doğru`}
            </Txt>
            <Txt variant="tiny" color={Palette.textFaint}>
              ·
            </Txt>
            <Txt
              variant="tiny"
              color={wrongCount > 0 ? Palette.pink : Palette.textDim}
            >
              {`${wrongCount} Yanlış`}
            </Txt>
            {gradeInfo.accuracyRate !== null ? (
              <View style={styles.percentChip}>
                <Txt variant="tiny" color={Palette.text}>
                  {`%${gradeInfo.accuracyRate}`}
                </Txt>
              </View>
            ) : null}
          </View>
        ) : (
          <Txt variant="tiny" color={Palette.textFaint}>
            Soru kaydı yok
          </Txt>
        )}
      </View>

      {/* Eğer bu konuda yanlış sayısı fazlaysa tek tuşla konu çalışması + soru çözümü ata */}
      {isWeakTopic ? (
        <View style={styles.weakActionWrap}>
          <Txt variant="tiny" color={Palette.pink}>
            {gradeInfo.reason}
          </Txt>
          <GhostButton
            label={
              isAssigned
                ? 'Ödevlerime Eklendi'
                : isAssigning
                  ? 'Atanıyor...'
                  : 'Konu Çalışması ve Test Ata'
            }
            icon={isAssigned ? 'checkmark-circle' : 'add-circle-outline'}
            color={isAssigned ? Palette.green : Palette.pink}
            disabled={isAssigning}
            full
            onPress={isAssigned ? onGoToTasks : onAssign}
          />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryCard: {
    gap: Space.md,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  summaryStatBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: Palette.border,
  },
  statIconWrapGreen: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green,
  },
  statIconWrapAccent: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Accent,
  },
  subjectTabs: {
    gap: Space.sm,
    paddingVertical: 2,
  },
  subjectTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Space.md,
    paddingVertical: 10,
    borderRadius: pillRadius(40),
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  subjectTabActive: {
    borderColor: DetailAccent,
    backgroundColor: DetailAccent,
  },
  subjectCountChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subjectBody: {
    gap: Space.md,
  },
  activeSubjectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251, 174, 117, 0.35)',
    backgroundColor: '#FFFFFF',
  },
  filterBar: {
    gap: Space.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: pillRadius(28),
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  emptyCard: {
    paddingVertical: Space.xl,
  },
  unitGroup: {
    gap: Space.xs,
  },
  topicList: {
    gap: Space.sm,
  },
  topicCard: {
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    gap: Space.sm,
  },
  topicCardCompletedGreen: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: Palette.surface,
  },
  topicCardWeakBorder: {
    borderColor: Palette.pink,
  },
  topicMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkButtonGreen: {
    backgroundColor: Palette.green,
  },
  checkButtonEmpty: {
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  greenDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: pillRadius(22),
    backgroundColor: Palette.green,
  },
  pendingBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: pillRadius(22),
    backgroundColor: Palette.surfaceHi,
  },
  currentSchoolBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: pillRadius(22),
    borderWidth: 1,
    borderColor: Accent,
    backgroundColor: softOf(Accent),
  },
  weakWarningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: pillRadius(22),
    backgroundColor: Palette.pink,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Space.xs,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  questionFooterGreen: {
    borderTopColor: Palette.green + '44',
  },
  questionTotalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentChip: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  weakActionWrap: {
    gap: 6,
    paddingTop: 4,
  },
});
