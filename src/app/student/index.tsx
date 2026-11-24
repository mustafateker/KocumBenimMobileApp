import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { SideExamCountdown } from '@/components/side-exam-countdown';
import { FocusRing } from '@/components/focus-ring';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { RaccoonIcon } from '@/components/raccoon-icon';
import { Screen } from '@/components/screen';
import { TodayStudyCard } from '@/components/today-study-card';
import { Card, IconBubble, ProgressBar, SectionLabel, Txt } from '@/components/ui';
import { getAiCoachContext, getCurriculumProgress, getSummary, getTasks, getUpcomingLessons, requestAiCoachTask } from '@/lib/api';
import { clockFormat, formatLessonDateTime } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { hasIncompleteCurriculumTopics, loadExtraCompletedTopics } from '@/lib/maarif-curriculum';
import { getExamTrack } from '@/lib/mock-exams';
import { useSyncRoutineReminders } from '@/lib/routine-reminders';
import { useSession, useStudent } from '@/lib/session';
import { useSubscription } from '@/lib/subscription';
import { categoryColor, categoryIcon, taskGoalLabel } from '@/lib/task-categories';
import type { AiCoachContext, AiDailyRecommendation, PrivateLesson, StudentSummary, Task } from '@/lib/types';
import { Accent, Border, DetailAccent, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

const DURATIONS = [
  { label: '25 dk', seconds: 25 * 60 },
  { label: '45 dk', seconds: 45 * 60 },
  { label: '60 dk', seconds: 60 * 60 },
];

const MIN_SECONDS = 5 * 60;
const MAX_SECONDS = 180 * 60;

function parseDailyMinutes(dailyHours?: string | null): number {
  if (!dailyHours) return 60;
  const lower = dailyHours.toLowerCase().trim();
  if (lower.includes('dakika') || lower.includes('dk')) {
    const num = parseInt(lower.replace(/[^\d]/g, ''), 10);
    return isNaN(num) || num <= 0 ? 30 : num;
  }
  if (lower.includes('saat')) {
    const clean = lower.replace('saat', '').replace(',', '.').trim();
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 60);
    }
  }
  const fallbackNum = parseInt(lower.replace(/[^\d]/g, ''), 10);
  return !isNaN(fallbackNum) && fallbackNum > 0 ? fallbackNum * 60 : 60;
}

export default function Home() {
  const router = useRouter();
  const student = useStudent();
  const { refresh } = useSession();
  const { showError } = useErrorDialog();
  const { isPro, presentPaywall } = useSubscription();

  const [duration, setDuration] = useState(DURATIONS[0].seconds);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [nextLesson, setNextLesson] = useState<PrivateLesson | null>(null);
  const [aiContext, setAiContext] = useState<AiCoachContext | null>(null);
  const [assigningRecId, setAssigningRecId] = useState<string | null>(null);
  const [assignedRecIds, setAssignedRecIds] = useState<Record<string, boolean>>({});
  const [showCurriculumPrompt, setShowCurriculumPrompt] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(DURATIONS[0].seconds);
  /** Halka bu ekranda ilerleme degil, secilen sureyi gosteren dekoratif bir cerceve. */
  const ringProgress = useSharedValue(1);

  const load = useCallback(async () => {
    try {
      setTasks(await getTasks('day'));
    } catch (err) {
      showError(err, { title: 'Görevler yüklenemedi', code: 'HOME_TASKS_LOAD' });
    }
    try {
      const s = await getSummary();
      setSummary(s);
    } catch {
      // sessizce devam
    }
    try {
      const ctx = await getAiCoachContext();
      setAiContext(ctx);
    } catch {
      // cevrimdisi durumda yerel oneriler gosterilir
    }
    try {
      const upcoming = await getUpcomingLessons(1);
      setNextLesson(upcoming[0] ?? null);
    } catch (err) {
      showError(err, { title: 'Ders bilgisi yüklenemedi', code: 'HOME_LESSON_LOAD' });
    }
    try {
      const [prog, extra] = await Promise.all([
        getCurriculumProgress(student),
        loadExtraCompletedTopics(student?.id),
      ]);
      setShowCurriculumPrompt(hasIncompleteCurriculumTopics(student?.grade, prog, extra));
    } catch {
      setShowCurriculumPrompt(false);
    }
  }, [showError, student]);

  useFocusEffect(
    useCallback(() => {
      load();
      refresh();
    }, [load, refresh])
  );

  const openPicker = useCallback(() => {
    setDraft(duration);
    setPickerOpen(true);
  }, [duration]);

  const applyDraft = useCallback(() => {
    setDuration(draft);
    setPickerOpen(false);
  }, [draft]);

  const bumpMinutes = useCallback((delta: number) => {
    setDraft((d) => Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, d + delta * 60)));
  }, []);

  const bumpSeconds = useCallback((delta: number) => {
    setDraft((d) => {
      const next = d + delta * 15;
      return Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, next));
    });
  }, []);

  const draftMinutes = Math.floor(draft / 60);
  const draftSeconds = draft % 60;

  // Gunluk istatistik hesaplamalari
  const todayPomodoroMinutes = summary?.todayMinutes ?? aiContext?.studyStats?.todayMinutes ?? 0;
  const todayQuestions = tasks.reduce((sum, task) => {
    if (task.category === 'question') {
      const count = (task.correctCount || 0) + (task.wrongCount || 0);
      return sum + (count > 0 ? count : (task.done || 0));
    }
    return sum;
  }, 0);
  const todayCorrect = tasks.reduce((sum, task) => {
    if (task.category === 'question') {
      return sum + (task.correctCount || 0);
    }
    return sum;
  }, 0);

  useSyncRoutineReminders(student, {
    tasks,
    pomodoroMinutesToday: todayPomodoroMinutes,
    hasIncompleteTopics: showCurriculumPrompt,
  });

  const activeProgressEntry = useMemo(() => {
    if (!student.curriculumProgress || typeof student.curriculumProgress !== 'object') {
      return null;
    }
    for (const [subject, topic] of Object.entries(student.curriculumProgress)) {
      if (typeof topic === 'string' && topic.trim().length > 0) {
        return { subject, topic: topic.trim() };
      }
    }
    return null;
  }, [student.curriculumProgress]);

  // Otomatik gunluk AI koç onerileri (sunucudan veya yerel veriden)
  const targetMinutes = aiContext?.student?.targetMinutes ?? parseDailyMinutes(student.dailyHours);
  const gradeLabel = aiContext?.student?.grade ?? student.grade ?? '8. Sınıf';
  const pendingCount = tasks.filter((t) => t.completedAt === null).length;

  const recSubject =
    aiContext?.weakTopics?.[0]?.subject ??
    activeProgressEntry?.subject ??
    (getExamTrack(student.grade) === 'lgs' ? 'Matematik' : 'Temel Matematik');
  const recTopic =
    aiContext?.weakTopics?.[0]?.topic ??
    activeProgressEntry?.topic ??
    'Konu ve Soru Çalışması';

  const dailyRecommendations: AiDailyRecommendation[] =
    aiContext?.dailyRecommendations && aiContext.dailyRecommendations.length > 0
      ? aiContext.dailyRecommendations
      : [
          {
            id: 'local-topic',
            category: 'topic',
            badge: `${gradeLabel} Müfredat`,
            title: `${recSubject} · ${recTopic}`,
            description: aiContext?.weakTopics?.[0]
              ? `Son soru çözümlerinde %${aiContext.weakTopics[0].accuracyRate} başarı (${aiContext.weakTopics[0].wrongCount} yanlış) görülüyor. Bugün konu tekrarı ve 20 soru çözümü önerilir.`
              : activeProgressEntry
                ? `Müfredatta işaretlediğin ${activeProgressEntry.subject} dersi "${activeProgressEntry.topic}" konusunda eksiklerini kapatmak için bugün tekrar ve 20 soru çözümü önerilir.`
                : `${gradeLabel} seviyene uygun günlük konu tekrarı ve soru çözümü görevlerini panona ekleyebilirsin.`,
            actionType: 'assign_task',
            actionLabel: 'Günlük Ödev Ata',
            subject: recSubject,
            topic: recTopic,
          },
          {
            id: 'local-duration',
            category: 'duration',
            badge: 'Çalışma Süresi',
            title: `Günlük Hedef: ${targetMinutes} Dakika`,
            description:
              todayPomodoroMinutes >= targetMinutes
                ? `Bugün ${todayPomodoroMinutes} dakika çalışarak günlük odak hedefini tamamladın.`
                : `Bugün ${todayPomodoroMinutes} dakika odaklandın. Hedefini tamamlamak için ${Math.max(25, targetMinutes - todayPomodoroMinutes)} dakikalık oturum başlatabilirsin.`,
            actionType: 'start_focus',
            actionLabel: 'Odaklanmaya Başla',
            recommendedMinutes: 25,
          },
          {
            id: 'local-routine',
            category: 'routine',
            badge: pendingCount > 0 ? 'Seri Takibi' : 'Günlük Plan',
            title:
              tasks.length === 0
                ? 'Bugün İçin Görev Atanmadı'
                : pendingCount > 0
                  ? `Bekleyen ${pendingCount} Görevin Var`
                  : 'Bugünkü Görevler Tamamlandı',
            description:
              tasks.length === 0
                ? `${student.streak} günlük çalışma serini sürdürmek için sınıfına uygun görev oluşturabilirsin.`
                : pendingCount > 0
                  ? `${student.streak} günlük serini korumak için bugünkü kalan görevlerini tamamlamalısın.`
                  : `Bugün atanan tüm görevlerini bitirdin ve çalışma serini korudun.`,
            actionType: tasks.length === 0 ? 'assign_task' : pendingCount > 0 ? 'open_tasks' : 'open_chat',
            actionLabel: tasks.length === 0 ? 'Görev Oluştur' : pendingCount > 0 ? 'Görevlere Git' : 'Koçla Değerlendir',
          },
        ];

  const handleRecommendationAction = useCallback(
    async (rec: AiDailyRecommendation) => {
      if (rec.actionType === 'assign_task') {
        if (assigningRecId || assignedRecIds[rec.id]) {
          router.push('/student/tasks');
          return;
        }
        setAssigningRecId(rec.id);
        try {
          const created = await requestAiCoachTask(rec.subject, rec.topic);
          setAssignedRecIds((prev) => ({ ...prev, [rec.id]: true }));
          if (created && created.length > 0) {
            setTasks((prev) => [...created, ...prev]);
          } else {
            setTasks(await getTasks('day'));
          }
        } catch (err) {
          showError(err, { title: 'Ödev atanamadı', code: 'HOME_AI_TASK_ASSIGN' });
        } finally {
          setAssigningRecId(null);
        }
        return;
      }

      if (rec.actionType === 'start_focus') {
        const mins = rec.recommendedMinutes ?? 25;
        router.push({ pathname: '/focus', params: { seconds: String(mins * 60) } });
        return;
      }

      if (rec.actionType === 'open_tasks') {
        router.push('/student/tasks');
        return;
      }

      router.push('/student/ai-coach');
    },
    [assignedRecIds, assigningRecId, router, showError]
  );

  return (
    <Screen>
      {/* Ekran Yaninda Sabit LGS / YKS Geri Sayim Rozeti ve Detay Popup'i */}
      <SideExamCountdown
        grade={student.grade}
        target={student.targetHighSchool || student.targetUniversity || student.targetDepartment || student.goal}
      />

      {/* Ust bar */}
      <View style={styles.topBar}>
        <MenuButton />

        <PressScale onPress={() => router.push('/student/profile')} style={styles.who}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            Merhaba, {student.nickname ?? student.name.split(' ')[0]}
          </Txt>
        </PressScale>

        <View style={styles.topActions}>
          <View style={[styles.statChip, { borderColor: Palette.orange }]}>
            <Ionicons name="flame" size={15} color={Palette.orange} />
            <Txt variant="smallStrong" color={Palette.orange}>
              {student.streak}
            </Txt>
          </View>
          <NotificationBell />
        </View>
      </View>

      {/* Eksik Konu İlerleme Uyarısı */}
      {showCurriculumPrompt && (
        <PressScale onPress={() => router.push('/subjects')} scaleTo={0.98}>
          <Card style={styles.curriculumPromptCard}>
            <View style={styles.curriculumPromptHeader}>
              <View style={styles.curriculumPromptIconWrap}>
                <Ionicons name="bookmark" size={18} color={DetailAccent} />
              </View>
              <View style={styles.flex}>
                <Txt variant="smallStrong" color={Palette.text}>
                  Konu İlerlemeni Tamamla
                </Txt>
                <Txt variant="tiny" color={Palette.textDim} style={styles.curriculumPromptText}>
                  Koçunun sana daha doğru ödev atayabilmesi için lütfen tüm derslerden en az 2. konuya kadar işaretle.
                </Txt>
              </View>
            </View>
            <View style={styles.curriculumPromptActionRow}>
              <Txt variant="smallStrong" color={Accent}>
                Konuları İşaretle →
              </Txt>
            </View>
          </Card>
        </PressScale>
      )}

      {/* Gunluk Calisma Ozeti Karti */}
      <TodayStudyCard
        pomodoroMinutes={todayPomodoroMinutes}
        questionsSolved={todayQuestions}
        correctCount={todayCorrect}
      />

      {/* Odak zamani secici */}
      <PressScale onPress={openPicker} scaleTo={0.98}>
        <FocusRing progress={ringProgress} color={DetailAccent} track={Palette.border} size={252}>
          <Txt variant="tiny" color={Palette.textFaint}>
            ODAK ZAMANI
          </Txt>
          <Txt variant="timer" color={Palette.text}>
            {clockFormat(duration)}
          </Txt>
          <View style={styles.editHint}>
            <Ionicons name="pencil" size={12} color={Palette.textFaint} />
            <Txt variant="small" color={Palette.textDim}>
              dokun, değiştir
            </Txt>
          </View>
        </FocusRing>
      </PressScale>

      {/* Sure secimi ve baslatma */}
      <View style={styles.setup}>
        <View style={styles.chipRow}>
          {DURATIONS.map((d) => {
            const selected = duration === d.seconds;
            return (
              <PressScale key={d.seconds} onPress={() => setDuration(d.seconds)} style={styles.flex}>
                <View style={[styles.chip, selected && styles.chipActive]}>
                  <Txt variant="smallStrong" color={selected ? Accent : Palette.textDim}>
                    {d.label}
                  </Txt>
                </View>
              </PressScale>
            );
          })}
          <PressScale onPress={openPicker} style={styles.flex}>
            <View style={[styles.chip, !DURATIONS.some((d) => d.seconds === duration) && styles.chipActive]}>
              <Txt
                variant="smallStrong"
                color={!DURATIONS.some((d) => d.seconds === duration) ? Accent : Palette.textDim}
              >
                Özel
              </Txt>
            </View>
          </PressScale>
        </View>

        <NeonButton
          label="Çalışmaya Başla"
          icon="play"
          color={Accent}
          size="lg"
          full
          onPress={() => router.push({ pathname: '/focus', params: { seconds: String(duration) } })}
        />
      </View>

      {/* Otomatik Gunluk Koçum Onerileri */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <SectionLabel>Günlük Koçum Önerileri</SectionLabel>
          <PressScale onPress={() => router.push('/student/ai-coach')}>
            <Txt variant="tiny" color={Accent}>
              Koçum ile Konuş →
            </Txt>
          </PressScale>
        </View>

        {!isPro ? (
          <PressScale onPress={() => void presentPaywall()} scaleTo={0.98}>
            <Card accent={DetailAccent} style={styles.proLockedCard}>
              <View style={styles.proLockedTop}>
                <View style={styles.proLockBadge}>
                  <Ionicons name="lock-closed" size={20} color={Accent} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.aiTitleRow}>
                    <Txt variant="bodyStrong">Bugünün Koçluk Analizi</Txt>
                    <View style={styles.proChip}>
                      <Txt variant="tiny" color={Palette.bg} style={styles.proChipText}>
                        PRO
                      </Txt>
                    </View>
                  </View>
                  <Txt variant="tiny" color={Palette.textDim} style={styles.proLockedDesc}>
                    {"Yapay zeka koçunun günlük çalışma verilerini ve eksik konularını analiz ederek sana özel çıkardığı hedefler ve koçluk önerileri Koçum Pro'ya özeldir."}
                  </Txt>
                </View>
              </View>
              <View style={styles.proLockedAction}>
                <Txt variant="smallStrong" color={Accent}>
                  {"Koçum Pro'ya Geç ve Analizi Aç →"}
                </Txt>
              </View>
            </Card>
          </PressScale>
        ) : (
          <Card accent={DetailAccent} style={styles.aiSummaryCard}>
            <View style={styles.aiSummaryTop}>
              <RaccoonIcon size={44} />
              <View style={styles.flex}>
                <View style={styles.aiTitleRow}>
                  <Txt variant="bodyStrong">Bugünün Koçluk Analizi</Txt>
                  <View style={styles.targetPill}>
                    <Txt variant="tiny" color={Accent}>
                      Hedef: {targetMinutes} dk
                    </Txt>
                  </View>
                </View>
                <Txt variant="tiny" color={Palette.textDim}>
                  {aiContext?.dailySummary ??
                    `${gradeLabel} çalışma verilerine ve soru çözümlerine göre bugünkü kişisel önerilerin:`}
                </Txt>
              </View>
            </View>

            <View style={styles.recList}>
              {dailyRecommendations.map((rec) => {
                const isAssigned = Boolean(assignedRecIds[rec.id]);
                const isBusy = assigningRecId === rec.id;
                const iconName: React.ComponentProps<typeof Ionicons>['name'] =
                  rec.category === 'topic'
                    ? 'book-outline'
                    : rec.category === 'duration'
                      ? 'timer-outline'
                      : 'checkmark-circle-outline';

                return (
                  <View key={rec.id} style={styles.recItem}>
                    <View style={styles.recHeader}>
                      <View style={styles.recBadgeWrap}>
                        <Ionicons name={iconName} size={13} color={Accent} />
                        <Txt variant="tiny" color={Accent}>
                          {rec.badge}
                        </Txt>
                      </View>
                      <PressScale
                        onPress={() => handleRecommendationAction(rec)}
                        disabled={isBusy}
                        scaleTo={0.96}
                      >
                        <View style={[styles.recActionBtn, isAssigned && styles.recActionBtnDone]}>
                          <Txt variant="tiny" color={isAssigned ? Accent : OnColorText}>
                            {isBusy ? 'Atanıyor...' : isAssigned ? 'Ödevlerime Git →' : rec.actionLabel}
                          </Txt>
                        </View>
                      </PressScale>
                    </View>

                    <Txt variant="smallStrong" color={Palette.text}>
                      {rec.title}
                    </Txt>
                    <Txt variant="tiny" color={Palette.textDim}>
                      {rec.description}
                    </Txt>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </View>

      {/* Gunluk odevler */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <SectionLabel>Günlük Ödevler</SectionLabel>
          <PressScale onPress={() => router.push('/student/tasks')}>
            <Txt variant="tiny" color={Accent}>
              Tümünü Gör
            </Txt>
          </PressScale>
        </View>

        {tasks.length === 0 ? (
          <Card>
            <Txt variant="small" color={Palette.textDim}>
              Bugün için atanmış ödev yok. Yukarıdaki Koçum önerisinden günlük ödev oluşturabilirsin.
            </Txt>
          </Card>
        ) : (
          <View style={styles.taskGrid}>
            {tasks.slice(0, 3).map((task) => (
              <MiniTaskCard key={task.id} task={task} />
            ))}
          </View>
        )}
      </View>

      {/* Derslerim ve Maarif Müfredat Konu Takibi */}
      <PressScale onPress={() => router.push('/subjects')}>
        <Card accent={Accent} style={styles.quickCard}>
          <IconBubble name="book" color={DetailAccent} size={48} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">Derslerim ve Konu Takibi</Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              {gradeLabel} Maarif müfredatı, okulda geldiğin konular ve soru analizlerin
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
        </Card>
      </PressScale>

      {/* Hizli soru sor */}
      <PressScale
        onPress={() => {
          if (!isPro) {
            void presentPaywall();
            return;
          }
          router.push('/student/questions');
        }}
      >
        <Card accent={Accent} style={styles.quickCard}>
          <IconBubble name="camera" color={DetailAccent} size={48} />
          <View style={styles.flex}>
            <View style={styles.rowCenterGap}>
              <Txt variant="bodyStrong">Hızlı Soru Sor</Txt>
              {!isPro && (
                <View style={styles.proChipMini}>
                  <Txt variant="tiny" color={Palette.bg} style={styles.proChipText}>
                    PRO
                  </Txt>
                </View>
              )}
            </View>
            <Txt variant="tiny" color={Palette.textDim}>
              Sorunu çek, üstüne çiz, hocana gönder
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
        </Card>
      </PressScale>

      {/* Yaklasan ozel ders */}
      {nextLesson ? (
        <PressScale onPress={() => router.push('/lessons')}>
          <Card accent={Accent} style={styles.quickCard}>
            <IconBubble name="calendar" color={DetailAccent} size={48} />
            <View style={styles.flex}>
              <Txt variant="bodyStrong">Yaklaşan Özel Ders</Txt>
              <Txt variant="tiny" color={Palette.textDim}>
                {formatLessonDateTime(nextLesson.scheduledAt)}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
          </Card>
        </PressScale>
      ) : null}

      {/* Manuel sure secici */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalAccent} />
            <Txt variant="section" center>
              Odak süresini ayarla
            </Txt>

            <View style={styles.stepperRow}>
              <Stepper label="Dakika" value={String(draftMinutes).padStart(2, '0')} onDec={() => bumpMinutes(-1)} onInc={() => bumpMinutes(1)} />
              <Txt variant="hero">:</Txt>
              <Stepper
                label="Saniye"
                value={String(draftSeconds).padStart(2, '0')}
                onDec={() => bumpSeconds(-1)}
                onInc={() => bumpSeconds(1)}
              />
            </View>

            <View style={styles.modalActions}>
              <GhostButton label="Vazgeç" onPress={() => setPickerOpen(false)} style={styles.flex} full />
              <NeonButton label="Uygula" color={Accent} onPress={applyDraft} style={styles.flex} full />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const OnColorText = Palette.bg;

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Txt variant="tiny" color={Palette.textFaint}>
        {label.toUpperCase()}
      </Txt>
      <View style={styles.stepperControls}>
        <IconButton icon="remove" onPress={onDec} />
        <Txt variant="title">{value}</Txt>
        <IconButton icon="add" color={DetailAccent} onPress={onInc} />
      </View>
    </View>
  );
}

function MiniTaskCard({ task }: { task: Task }) {
  const done = task.completedAt !== null;
  const progress = task.target === 0 ? 0 : task.done / task.target;
  const color = done ? Palette.green : categoryColor(task.category);

  return (
    <View style={[styles.miniCard, done && { borderColor: Palette.green }]}>
      <IconBubble name={done ? 'checkmark-circle' : categoryIcon(task.category)} color={DetailAccent} size={32} />
      <Txt variant="tiny" color={Palette.textDim} numberOfLines={2} style={styles.miniTitle}>
        {task.title}
      </Txt>
      <Txt variant="smallStrong" color={done ? Palette.green : Palette.text}>
        {taskGoalLabel(task)}
      </Txt>
      <ProgressBar progress={progress} color={color} track={Palette.border} height={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  who: {
    flex: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.md,
    height: 40,
    borderRadius: pillRadius(40),
    borderWidth: Border.thick,
    backgroundColor: Palette.surface,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  setup: {
    gap: Space.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  chip: {
    height: 42,
    borderRadius: pillRadius(42),
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Palette.surface,
    borderColor: Accent,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiSummaryCard: {
    gap: Space.md,
  },
  aiSummaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  raccoonBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.xs,
    marginBottom: 2,
  },
  targetPill: {
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: pillRadius(20),
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  recList: {
    gap: Space.sm,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
    paddingTop: Space.sm,
  },
  recItem: {
    backgroundColor: Palette.bg,
    borderRadius: Radius.md,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    padding: Space.md,
    gap: 4,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  recBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: pillRadius(20),
  },
  recActionBtn: {
    backgroundColor: Accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: pillRadius(24),
  },
  recActionBtnDone: {
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Accent,
  },
  taskGrid: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  miniCard: {
    flex: 1,
    gap: 6,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  miniTitle: {
    minHeight: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
  },
  modalCard: {
    width: '100%',
    gap: Space.xl,
    padding: Space.xl,
    paddingTop: Space.xxl,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    overflow: 'hidden',
  },
  modalAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: DetailAccent,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Space.lg,
  },
  stepper: {
    alignItems: 'center',
    gap: Space.sm,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Space.md,
  },
  curriculumPromptCard: {
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: DetailAccent + '60',
    backgroundColor: Palette.surfaceHi,
    gap: Space.xs,
  },
  curriculumPromptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.sm,
  },
  curriculumPromptIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: DetailAccent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumPromptText: {
    marginTop: 2,
    lineHeight: 16,
  },
  curriculumPromptActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  rowCenterGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  proLockedCard: {
    gap: Space.md,
    borderWidth: Border.thick,
    borderColor: Accent + '60',
    backgroundColor: Palette.surfaceHi,
    padding: Space.lg,
  },
  proLockedTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  proLockBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
    borderColor: Accent + '40',
  },
  proChip: {
    backgroundColor: Accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: pillRadius(18),
  },
  proChipMini: {
    backgroundColor: Accent,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: pillRadius(14),
  },
  proChipText: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  proLockedDesc: {
    lineHeight: 18,
    marginTop: 4,
  },
  proLockedAction: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
    paddingTop: Space.sm,
  },
});
