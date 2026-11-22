import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Flame,
  Layers,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { WeekBars } from '@/components/charts';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, IconBubble, ProgressBar, Segmented, Txt } from '@/components/ui';
import { getCompletedTasks, getStats, getSummary } from '@/lib/api';
import { dayLabel, humanDuration, relativeTime } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { Rules } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import { categoryIcon } from '@/lib/task-categories';
import type { StudentStats, StudentSummary, Task, TopicBreakdown, TopicReport } from '@/lib/types';
import { Accent, Border, DetailAccent, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

type ReportTab = 'overview' | 'subjects' | 'history';

const TAB_OPTIONS: { key: ReportTab; label: string }[] = [
  { key: 'overview', label: 'Genel Bakış' },
  { key: 'subjects', label: 'Ders & Konular' },
  { key: 'history', label: 'Çalışma Geçmişi' },
];

const EMPTY_STATS: StudentStats = {
  totalTasks: 0,
  doneTasks: 0,
  completionRate: 0,
  currentStreak: 0,
  last7Days: [],
  byTopic: [],
};

export default function Stats() {
  const student = useStudent();
  const { showError } = useErrorDialog();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [stats, setStats] = useState<StudentStats>(EMPTY_STATS);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [completed, setCompleted] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getStats(), getCompletedTasks(), getSummary()])
        .then(([s, c, sum]) => {
          setStats(s);
          setCompleted(c);
          setSummary(sum);
        })
        .catch((err) => {
          showError(err, { title: 'Raporlar yüklenemedi', code: 'STATS_LOAD' });
        });
    }, [showError])
  );

  // Genel hesaplamalar
  const completionRate = Math.round(stats.completionRate * 100);

  // Soru sayilari toplamlari
  const { totalSolved, totalCorrect, totalWrong, totalBlank, accuracyRate } = useMemo(() => {
    let solved = 0;
    let correct = 0;
    let wrong = 0;
    let blank = 0;

    if (stats.subjects && stats.subjects.length > 0) {
      for (const subj of stats.subjects) {
        solved += subj.solved;
        correct += subj.correct;
        wrong += subj.wrong;
        blank += subj.blank;
      }
    } else if (stats.byTopic && stats.byTopic.length > 0) {
      for (const topic of stats.byTopic) {
        correct += topic.correct;
        wrong += topic.wrong;
        solved += topic.correct + topic.wrong;
      }
    } else {
      for (const t of completed) {
        if (t.category === 'question') {
          correct += t.correctCount || 0;
          wrong += t.wrongCount || 0;
          solved += (t.correctCount || 0) + (t.wrongCount || 0);
        }
      }
    }

    const accuracy = solved > 0 ? Math.round((correct / Math.max(1, correct + wrong)) * 100) : 0;
    return {
      totalSolved: solved,
      totalCorrect: correct,
      totalWrong: wrong,
      totalBlank: blank,
      accuracyRate: accuracy,
    };
  }, [stats, completed]);

  // Odak dakikalari
  const weekMinutes = summary?.weekMinutes ?? stats.last7Days.reduce((a, b) => a + b.minutes, 0);
  const todayMinutes = summary?.todayMinutes ?? 0;

  // En verimli odak gunu
  const bestDay = useMemo(() => {
    if (!stats.last7Days || stats.last7Days.length === 0) return null;
    return stats.last7Days.reduce((best, cur) => (cur.minutes > (best?.minutes ?? 0) ? cur : best), stats.last7Days[0]);
  }, [stats.last7Days]);

  // Konular ve dersler
  const weakTopics = (stats.weakTopics ?? []).slice(0, 5);

  const strongTopics = useMemo(() => {
    const list: TopicReport[] = [];
    if (stats.subjects) {
      for (const s of stats.subjects) {
        for (const t of s.topics) {
          if (t.successRate !== null && Math.round(t.successRate * 100) >= 75 && t.solved >= 5) {
            list.push(t);
          }
        }
      }
    }
    return list.slice(0, 5);
  }, [stats.subjects]);

  const activeSubjects = useMemo(() => {
    return (stats.subjects ?? [])
      .map((s) => ({
        ...s,
        topics: s.topics.filter((t) => t.solved > 0 || t.studyCompleted > 0),
      }))
      .filter((s) => s.topics.length > 0);
  }, [stats.subjects]);

  const answeredTopics = stats.byTopic.filter((t) => t.correct + t.wrong > 0);

  // Motive edici koçluk mesajı
  const coachInsight = useMemo(() => {
    const target = student.targetUniversity || student.targetHighSchool || student.goal;
    let message = '';
    let levelTitle = 'İstikrarlı Başlangıç';

    if (stats.currentStreak >= 7) {
      levelTitle = 'Yüksek Disiplin Düzeyi';
      message = `${stats.currentStreak} günlük çalışma serin olağanüstü bir irade göstergesi. Çalışma alışkanlığını bir yaşam disiplinine dönüştürdün.`;
    } else if (stats.currentStreak >= 3) {
      levelTitle = 'Gelişen Odak Düzeyi';
      message = `${stats.currentStreak} günlük serin devam ediyor. Her gün masaya oturarak hedeflerine doğru kararlı adımlar atıyorsun. Zinciri kırma!`;
    } else if (todayMinutes > 0) {
      levelTitle = 'Günün Başlangıcı';
      message = `Bugün odaklanma oturumuna başladın. Her tamamlanan odak ve çözülen soru seni hayal ettiğin başarıya yaklaştıracak.`;
    } else {
      levelTitle = 'Yeni Bir Fırsat';
      message = `Her yeni gün hedefin için taze bir fırsattır. İlk odak oturumunu tamamlayarak serini bugün başlatabilirsin.`;
    }

    if (target) {
      message += ` ${target} hedefin için gösterdiğin bu emek çok değerli.`;
    }

    return { message, levelTitle };
  }, [stats.currentStreak, todayMinutes, student]);

  return (
    <Screen tint={Palette.bg}>
      <ScreenHeader
        title="Raporlar & İstatistikler"
        subtitle="Çalışma ve başarı analizlerin"
        onBack={() => router.back()}
      />

      {/* Sekme Secici */}
      <View style={styles.segmentWrap}>
        <Segmented
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          color={Accent}
        />
      </View>

      {/* 1. SEKME: GENEL BAKIŞ */}
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          {/* Motive Edici Koçluk Kartı */}
          <Card style={styles.coachCard}>
            <View style={styles.coachHead}>
              <View style={styles.coachIconWrap}>
                <Sparkles size={16} color={DetailAccent} strokeWidth={2.4} />
              </View>
              <View style={styles.flex}>
                <Txt variant="smallStrong" color={Palette.text}>
                  Koçunun Değerlendirmesi
                </Txt>
                <Txt variant="tiny" color={DetailAccent} style={styles.coachLevelText}>
                  {coachInsight.levelTitle}
                </Txt>
              </View>
              <View style={styles.disciplineBadge}>
                <Award size={14} color={DetailAccent} strokeWidth={2} />
              </View>
            </View>

            <Txt variant="small" color={Palette.text} style={styles.coachMessage}>
              {coachInsight.message}
            </Txt>

            <View style={styles.quoteBox}>
              <Txt variant="tiny" color={Palette.textDim} style={styles.quoteText}>
                {'“Gelecek, bugünden hazırlananlara aittir.”'}
              </Txt>
            </View>
          </Card>

          {/* 6'lı Temel Performans Matrisi */}
          <View style={styles.metricGrid}>
            <MetricCard
              icon={<Timer size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={`${todayMinutes} dk`}
              label="Bugün Odak"
            />
            <MetricCard
              icon={<Clock size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={humanDuration(weekMinutes * 60)}
              label="Haftalık Odak"
            />
            <MetricCard
              icon={<CheckCircle2 size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={String(totalSolved)}
              label="Çözülen Soru"
            />
            <MetricCard
              icon={<TrendingUp size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={totalSolved > 0 ? `%${accuracyRate}` : '-'}
              label="Net Başarı"
            />
            <MetricCard
              icon={<CheckSquare size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={`%${completionRate}`}
              label="Görev Bitirme"
            />
            <MetricCard
              icon={<Flame size={18} color={DetailAccent} strokeWidth={2.2} />}
              value={`${stats.currentStreak} Gün`}
              label="Aktif Seri"
            />
          </View>

          {/* Haftalık Odak Grafiği */}
          <Card>
            <View style={styles.cardHeaderRow}>
              <View>
                <Txt variant="section" color={Palette.text}>
                  Son 7 Günlük Odak
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  Hedef çizgin: günde {Rules.dailyGoalMinutes} dk
                </Txt>
              </View>
              <View style={styles.timeBadge}>
                <Calendar size={13} color={DetailAccent} strokeWidth={2} />
                <Txt variant="tiny" color={Palette.text}>
                  {(weekMinutes / 60).toFixed(1)} sa
                </Txt>
              </View>
            </View>

            <WeekBars data={stats.last7Days} goalMinutes={Rules.dailyGoalMinutes} color={Accent} />

            {bestDay && bestDay.minutes > 0 ? (
              <View style={styles.chartFootRow}>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Bu haftanın en yoğun günü:
                </Txt>
                <Txt variant="tiny" color={DetailAccent} style={styles.bold}>
                  {dayLabel(bestDay.day)} ({bestDay.minutes} dk)
                </Txt>
              </View>
            ) : null}
          </Card>

          {/* Soru Dağılımı ve Doğruluk Çubuğu */}
          {totalSolved > 0 ? (
            <Card style={styles.accuracyCard}>
              <View style={styles.cardHeaderRow}>
                <Txt variant="section" color={Palette.text}>
                  Soru Çözüm Dağılımı
                </Txt>
                <Txt variant="smallStrong" color={DetailAccent}>
                  %{accuracyRate} Doğruluk
                </Txt>
              </View>

              {/* Yığılmış Çubuk */}
              <View style={styles.stackedBar}>
                {totalCorrect > 0 && (
                  <View
                    style={[
                      styles.barSlice,
                      {
                        flex: totalCorrect,
                        backgroundColor: Accent,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                      },
                    ]}
                  />
                )}
                {totalWrong > 0 && (
                  <View
                    style={[
                      styles.barSlice,
                      {
                        flex: totalWrong,
                        backgroundColor: DetailAccent,
                      },
                    ]}
                  />
                )}
                {totalBlank > 0 && (
                  <View
                    style={[
                      styles.barSlice,
                      {
                        flex: totalBlank,
                        backgroundColor: Palette.border,
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Lejant */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Accent }]} />
                  <Txt variant="tiny" color={Palette.text}>
                    {totalCorrect} Doğru
                  </Txt>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: DetailAccent }]} />
                  <Txt variant="tiny" color={Palette.text}>
                    {totalWrong} Yanlış
                  </Txt>
                </View>
                {totalBlank > 0 && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Palette.border }]} />
                    <Txt variant="tiny" color={Palette.textFaint}>
                      {totalBlank} Boş
                    </Txt>
                  </View>
                )}
              </View>
            </Card>
          ) : null}

          {/* Konu Analizine Hızlı Geçiş Butonu */}
          <PressScale onPress={() => setActiveTab('subjects')}>
            <Card style={styles.jumpCard}>
              <View style={styles.jumpCardIcon}>
                <BookOpen size={18} color={DetailAccent} strokeWidth={2.2} />
              </View>
              <View style={styles.flex}>
                <Txt variant="bodyStrong" color={Palette.text}>
                  Ders ve Konu Raporlarını İncele
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  Güçlü olduğun ve tekrar etmen gereken konular
                </Txt>
              </View>
              <Ionicons name="chevron-forward" size={16} color={DetailAccent} />
            </Card>
          </PressScale>
        </View>
      )}

      {/* 2. SEKME: DERS & KONULAR */}
      {activeTab === 'subjects' && (
        <View style={styles.tabContent}>
          {/* Tekrar Edilmesi Gereken Konular */}
          {weakTopics.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Target size={15} color={DetailAccent} strokeWidth={2.2} />
                <Txt variant="smallStrong" color={Palette.text}>
                  Öncelikli Tekrar Konuları (%70 altı)
                </Txt>
              </View>
              <Card style={styles.weakCard}>
                {weakTopics.map((topic) => (
                  <View key={`${topic.subject}-${topic.grade}-${topic.topic}`} style={styles.weakRow}>
                    <View style={styles.weakBadge}>
                      <Txt variant="smallStrong" color={DetailAccent}>
                        %{Math.round(topic.successRate * 100)}
                      </Txt>
                    </View>
                    <View style={styles.flex}>
                      <Txt variant="smallStrong" numberOfLines={1} color={Palette.text}>
                        {topic.topic}
                      </Txt>
                      <Txt variant="tiny" color={Palette.textFaint}>
                        {topic.subject} · {topic.correct} doğru, {topic.wrong} yanlış, {topic.blank} boş
                      </Txt>
                    </View>
                  </View>
                ))}
                <View style={styles.cardTipRow}>
                  <Compass size={12} color={DetailAccent} strokeWidth={2} />
                  <Txt variant="tiny" color={Palette.textDim}>
                    Tavsiye: Bu konulardan soru çözerek başarı yüzdeni artırabilirsin.
                  </Txt>
                </View>
              </Card>
            </View>
          ) : null}

          {/* Hakim Olunan Güçlü Konular */}
          {strongTopics.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <CheckCircle2 size={15} color={Accent} strokeWidth={2.2} />
                <Txt variant="smallStrong" color={Palette.text}>
                  Hakim Olduğun Güçlü Konular (%75 ve üzeri)
                </Txt>
              </View>
              <Card style={styles.strongCard}>
                {strongTopics.map((topic) => (
                  <View key={`${topic.grade}-${topic.topic}`} style={styles.strongRow}>
                    <View style={styles.strongBadge}>
                      <Txt variant="smallStrong" color={Accent}>
                        %{Math.round((topic.successRate ?? 1) * 100)}
                      </Txt>
                    </View>
                    <View style={styles.flex}>
                      <Txt variant="smallStrong" numberOfLines={1} color={Palette.text}>
                        {topic.topic}
                      </Txt>
                      <Txt variant="tiny" color={Palette.textFaint}>
                        {topic.correct} doğru / {topic.solved} soru tamamlandı
                      </Txt>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {/* Ders Bazlı Raporlar */}
          {stats.subjects && activeSubjects.length > 0 ? (
            activeSubjects.map((subject) => (
              <View key={subject.subject} style={styles.section}>
                <View style={styles.subjectHead}>
                  <BookOpen size={16} color={DetailAccent} strokeWidth={2.2} />
                  <Txt variant="smallStrong" color={Palette.text} style={styles.flex}>
                    {subject.subject}
                  </Txt>
                  {subject.successRate !== null ? (
                    <View style={styles.subjectPill}>
                      <Txt variant="tiny" color={Palette.text}>
                        {subject.solved} soru · %{Math.round(subject.successRate * 100)} başarı
                      </Txt>
                    </View>
                  ) : null}
                </View>
                <View style={styles.list}>
                  {subject.topics.map((topic) => (
                    <TopicReportRow key={`${topic.grade}-${topic.topic}`} topic={topic} />
                  ))}
                </View>
              </View>
            ))
          ) : answeredTopics.length > 0 ? (
            <View style={styles.section}>
              <Txt variant="smallStrong" color={Palette.textDim}>
                Konu Bazlı Doğru / Yanlış
              </Txt>
              <View style={styles.list}>
                {answeredTopics.map((topic) => (
                  <TopicRow key={topic.title} topic={topic} />
                ))}
              </View>
            </View>
          ) : (
            <EmptyState
              icon="stats-chart-outline"
              title="Henüz konu verisi yok"
              subtitle="Soru görevlerini tamamladıkça burada konu analizlerin listelenecektir."
              color={DetailAccent}
            />
          )}
        </View>
      )}

      {/* 3. SEKME: ÇALIŞMA GEÇMİŞİ */}
      {activeTab === 'history' && (
        <View style={styles.tabContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Layers size={15} color={DetailAccent} strokeWidth={2.2} />
              <Txt variant="smallStrong" color={Palette.text}>
                Tamamlanan Çalışmalar ({completed.length})
              </Txt>
            </View>

            {completed.length === 0 ? (
              <EmptyState
                icon="checkmark-done-outline"
                title="Henüz tamamlanmış görev yok"
                subtitle="İlk odak veya soru görevini bitirdiğinde burada listelenecek."
                color={DetailAccent}
              />
            ) : (
              <View style={styles.list}>
                {completed.map((task) => (
                  <Card key={task.id} style={styles.historyRow}>
                    <IconBubble name={categoryIcon(task.category)} color={DetailAccent} size={40} />
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong" numberOfLines={1} color={Palette.text}>
                        {task.title}
                      </Txt>
                      <Txt variant="tiny" color={Palette.textFaint}>
                        {task.subject}
                        {task.topic ? ` · ${task.topic}` : ''}
                      </Txt>
                      <View style={styles.historyMetaRow}>
                        {task.correctCount + task.wrongCount > 0 ? (
                          <View style={styles.badgeSuccess}>
                            <Txt variant="tiny" color={Palette.text}>
                              {task.correctCount} D · {task.wrongCount} Y
                            </Txt>
                          </View>
                        ) : null}
                        <Txt variant="tiny" color={Palette.textFaint}>
                          {relativeTime(task.completedAt ?? task.dueDate)} tamamlandı
                        </Txt>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIconBox}>{icon}</View>
      <Txt variant="section" color={Palette.text} style={styles.metricValue}>
        {value}
      </Txt>
      <Txt variant="tiny" color={Palette.textDim}>
        {label}
      </Txt>
    </View>
  );
}

function TopicRow({ topic }: { topic: TopicBreakdown }) {
  const total = topic.correct + topic.wrong;
  const rate = total === 0 ? 0 : topic.correct / total;

  return (
    <Card style={styles.topicRow}>
      <View style={styles.topicHead}>
        <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
          {topic.title}
        </Txt>
        <Txt variant="smallStrong" color={Accent}>
          %{Math.round(rate * 100)}
        </Txt>
      </View>
      <ProgressBar progress={rate} color={Accent} height={7} />
      <View style={styles.topicFoot}>
        <Txt variant="tiny" color={Palette.text}>
          {topic.correct} doğru
        </Txt>
        <Txt variant="tiny" color={DetailAccent}>
          {topic.wrong} yanlış
        </Txt>
      </View>
    </Card>
  );
}

function TopicReportRow({ topic }: { topic: TopicReport }) {
  const rate = topic.successRate;
  const isWeak = rate !== null && Math.round(rate * 100) < 70;
  const color = isWeak ? DetailAccent : Accent;

  return (
    <Card style={styles.topicRow}>
      <View style={styles.topicHead}>
        <Txt variant="bodyStrong" numberOfLines={2} style={styles.flex} color={Palette.text}>
          {topic.topic}
        </Txt>
        {rate !== null ? (
          <Txt variant="smallStrong" color={color}>
            %{Math.round(rate * 100)}
          </Txt>
        ) : null}
      </View>
      {rate !== null ? <ProgressBar progress={rate} color={color} height={6} /> : null}
      <View style={styles.topicFoot}>
        <Txt variant="tiny" color={Palette.textDim}>
          {rate !== null ? `${topic.correct} doğru · ${topic.wrong} yanlış · ${topic.blank} boş` : ''}
        </Txt>
        {topic.studyCompleted > 0 ? (
          <Txt variant="tiny" color={Accent}>
            Konu çalışıldı
          </Txt>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
  segmentWrap: {
    marginBottom: Space.md,
  },
  tabContent: {
    gap: Space.md,
  },
  section: {
    gap: Space.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  list: {
    gap: Space.sm,
  },

  // Koçluk Kartı
  coachCard: {
    backgroundColor: Palette.surface,
    borderLeftWidth: 4,
    borderLeftColor: DetailAccent,
    gap: Space.sm,
    padding: Space.md,
  },
  coachHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  coachIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachLevelText: {
    fontWeight: '600',
  },
  disciplineBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachMessage: {
    lineHeight: 20,
  },
  quoteBox: {
    paddingTop: 6,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  quoteText: {
    fontStyle: 'italic',
  },

  // Metrik Kartları
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  metricCard: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    paddingVertical: Space.md,
    paddingHorizontal: Space.xs,
    alignItems: 'center',
    gap: 3,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 22,
  },

  // Başlık Satırları
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: pillRadius(24),
  },
  chartFootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Space.sm,
    paddingTop: Space.xs,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },

  // Doğruluk Çubuğu
  accuracyCard: {
    gap: Space.sm,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: Palette.surfaceHi,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barSlice: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Geçiş Kartı
  jumpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    borderColor: Palette.border,
  },
  jumpCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Geliştirilmesi Gereken Konular
  weakCard: {
    gap: Space.md,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  weakBadge: {
    width: 44,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Space.xs,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },

  // Güçlü Konular
  strongCard: {
    gap: Space.md,
  },
  strongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  strongBadge: {
    width: 44,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Konu Satırı
  topicRow: {
    gap: Space.sm,
  },
  topicHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  topicFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  subjectPill: {
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: pillRadius(20),
  },

  // Geçmiş Satırı
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    marginTop: 2,
  },
  badgeSuccess: {
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
});
