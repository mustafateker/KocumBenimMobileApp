import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Card, Pill, Txt } from '@/components/ui';
import {
  calculateNet,
  deleteMockExam,
  estimateLgsScore,
  estimateTytScore,
  GENERAL_DEFAULT_SUBJECTS,
  generateAiExamAnalysis,
  LGS_DEFAULT_SUBJECTS,
  loadMockExams,
  localTodayStr,
  saveMockExam,
  TYT_DEFAULT_SUBJECTS,
  type AiExamAnalysis,
  type ExamSubjectScore,
  type MockExam,
  type MockExamType,
} from '@/lib/mock-exams';
import { useStudent } from '@/lib/session';
import {
  Accent,
  Border,
  DetailAccent,
  Font,
  OnColor,
  Palette,
  Radius,
  Space,
} from '@/theme/tokens';

export default function MockExamsScreen() {
  const router = useRouter();
  const student = useStudent();
  const insets = useSafeAreaInsets();

  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AiExamAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    const list = await loadMockExams();
    setExams(list);
    setLoading(false);

    setAnalyzing(true);
    try {
      const aiRes = await generateAiExamAnalysis(list, student);
      setAnalysis(aiRes);
    } finally {
      setAnalyzing(false);
    }
  }, [student]);

  useFocusEffect(
    useCallback(() => {
      fetchExams();
    }, [fetchExams])
  );

  const latestExam = exams[0] ?? null;
  const bestNet = useMemo(() => (exams.length > 0 ? Math.max(...exams.map((e) => e.totalNet)) : 0), [exams]);
  const avgNet = useMemo(
    () => (exams.length > 0 ? Math.round((exams.reduce((s, e) => s + e.totalNet, 0) / exams.length) * 10) / 10 : 0),
    [exams]
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Denemeyi Sil',
      `"${title}" sınavını silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteMockExam(id);
            fetchExams();
          },
        },
      ]
    );
  };

  const targetLabel =
    student.targetHighSchool ||
    student.targetUniversity ||
    student.targetDepartment ||
    student.goal ||
    'Hedef Derece';

  return (
    <View style={[styles.root, { paddingTop: insets.top + Space.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <PressScale onPress={() => router.back()} scaleTo={0.9}>
          <View style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={Palette.text} />
          </View>
        </PressScale>
        <View style={styles.headerTitleWrap}>
          <Txt variant="section" color={Palette.text}>
            Deneme Sınavlarım
          </Txt>
          <Txt variant="tiny" color={Palette.textDim}>
            Net Analizi & Hedef Eğrisi
          </Txt>
        </View>
        <PressScale onPress={() => setModalOpen(true)} scaleTo={0.92}>
          <View style={styles.addIconBtn}>
            <Plus size={18} color={OnColor} strokeWidth={2.5} />
          </View>
        </PressScale>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bento Metrics (3'lü Özet) */}
        <View style={styles.bentoGrid}>
          <Card style={styles.bentoCard}>
            <View style={styles.bentoIconBox}>
              <TrendingUp size={16} color={DetailAccent} strokeWidth={2.2} />
            </View>
            <Txt variant="smallStrong" color={Palette.text}>
              {latestExam ? `${latestExam.totalNet} Net` : '-'}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              Son Deneme
            </Txt>
          </Card>

          <Card style={styles.bentoCard}>
            <View style={styles.bentoIconBox}>
              <Award size={16} color={Palette.green} strokeWidth={2.2} />
            </View>
            <Txt variant="smallStrong" color={Palette.text}>
              {exams.length > 0 ? `${bestNet} Net` : '-'}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              En Yüksek
            </Txt>
          </Card>

          <Card style={styles.bentoCard}>
            <View style={styles.bentoIconBox}>
              <Target size={16} color={Palette.blue} strokeWidth={2.2} />
            </View>
            <Txt variant="smallStrong" color={Palette.text}>
              {exams.length > 0 ? `${avgNet} Net` : '-'}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              Ortalama Net
            </Txt>
          </Card>
        </View>

        {/* AI Net Tahmini & Hedef Eğrisi Kartı */}
        <Card style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiTitleWrap}>
              <View style={styles.aiIconBubble}>
                <Sparkles size={16} color={OnColor} strokeWidth={2.4} />
              </View>
              <View>
                <Txt variant="smallStrong" color={Palette.text}>
                  Hedef Eğrisi & Net Analizi
                </Txt>
                <Txt variant="tiny" color={Palette.textDim} numberOfLines={1}>
                  {targetLabel}
                </Txt>
              </View>
            </View>

            {analysis?.targetProbability ? (
              <Pill label={analysis.targetProbability} color={Palette.green} icon="checkmark-circle" />
            ) : null}
          </View>

          <Txt variant="body" color={Palette.text} style={styles.aiSummaryText}>
            {analyzing ? 'Netleriniz ve hedefiniz yapay zeka tarafından analiz ediliyor...' : analysis?.summary}
          </Txt>

          {/* En Çok Net Kazandıracak Kestirme Konular */}
          {analysis?.shortcutTopics && analysis.shortcutTopics.length > 0 ? (
            <View style={styles.shortcutContainer}>
              <Txt variant="tiny" color={Palette.textDim} style={styles.shortcutHeader}>
                EN HIZLI NET KAZANDIRACAK KESTİRME KONULAR
              </Txt>
              <View style={styles.shortcutList}>
                {analysis.shortcutTopics.map((item, idx) => (
                  <View key={idx} style={styles.shortcutItem}>
                    <View style={styles.shortcutLeft}>
                      <View style={styles.shortcutDot} />
                      <Txt variant="smallStrong" color={Palette.text}>
                        {item.subject} · {item.topic}
                      </Txt>
                    </View>
                    <View style={styles.gainBadge}>
                      <Txt variant="tiny" color={Palette.green} style={styles.gainText}>
                        {item.potentialGain}
                      </Txt>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Strateji İpucu */}
          {analysis?.strategyTip ? (
            <View style={styles.strategyRow}>
              <Flame size={14} color={DetailAccent} strokeWidth={2.2} />
              <Txt variant="tiny" color={Palette.textDim} style={styles.strategyText}>
                {analysis.strategyTip}
              </Txt>
            </View>
          ) : null}
        </Card>

        {/* Deneme Geçmişi Başlığı */}
        <View style={styles.listHeaderRow}>
          <Txt variant="section" color={Palette.text}>
            Kayıtlı Denemeler ({exams.length})
          </Txt>
          <PressScale onPress={() => setModalOpen(true)} scaleTo={0.95}>
            <View style={styles.addTextBtn}>
              <Plus size={14} color={Accent} strokeWidth={2.4} />
              <Txt variant="smallStrong" color={Accent}>
                Deneme Ekle
              </Txt>
            </View>
          </PressScale>
        </View>

        {/* Deneme Listesi */}
        {exams.length === 0 && !loading ? (
          <Card style={styles.emptyCard}>
            <BookOpen size={36} color={Palette.textFaint} strokeWidth={1.8} />
            <Txt variant="bodyStrong" color={Palette.textDim} center>
              Henüz deneme sınavı eklemedin
            </Txt>
            <Txt variant="small" color={Palette.textFaint} center>
              Girdiğin deneme sınavlarını ekleyerek net gelişimini ve hedefine ne kadar yaklaştığını takip et.
            </Txt>
            <NeonButton label="İlk Denemeni Ekle" icon="add" onPress={() => setModalOpen(true)} />
          </Card>
        ) : (
          exams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            return (
              <Card key={exam.id} style={styles.examCard}>
                <PressScale
                  onPress={() => setExpandedExamId(isExpanded ? null : exam.id)}
                  scaleTo={0.99}
                >
                  <View style={styles.examCardHeader}>
                    <View style={styles.examInfoCol}>
                      <View style={styles.examBadgeRow}>
                        <Pill
                          label={exam.examType.toUpperCase()}
                          color={exam.examType === 'lgs' ? Palette.blue : DetailAccent}
                        />
                        <View style={styles.dateChip}>
                          <Calendar size={12} color={Palette.textFaint} strokeWidth={2} />
                          <Txt variant="tiny" color={Palette.textDim}>
                            {exam.date}
                          </Txt>
                        </View>
                      </View>
                      <Txt variant="bodyStrong" color={Palette.text} style={styles.examTitle}>
                        {exam.title}
                      </Txt>
                    </View>

                    <View style={styles.examRightCol}>
                      <View style={styles.totalNetBox}>
                        <Txt variant="section" color={Accent}>
                          {exam.totalNet}
                        </Txt>
                        <Txt variant="tiny" color={Palette.textDim}>
                          Net
                        </Txt>
                      </View>
                      {exam.estimatedScore ? (
                        <Txt variant="tiny" color={Palette.textFaint}>
                          ~{exam.estimatedScore} Puan
                        </Txt>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardExpandTrigger}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      {isExpanded ? 'Ders dağılımını gizle' : 'Ders detaylarını gör'}
                    </Txt>
                    {isExpanded ? (
                      <ChevronUp size={14} color={Palette.textDim} strokeWidth={2.2} />
                    ) : (
                      <ChevronDown size={14} color={Palette.textDim} strokeWidth={2.2} />
                    )}
                  </View>
                </PressScale>

                {/* Genişletilmiş Ders Dağılımı */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <View style={styles.subjectsTable}>
                      <View style={styles.tableHead}>
                        <Txt variant="tiny" color={Palette.textFaint} style={{ flex: 2 }}>
                          Ders
                        </Txt>
                        <Txt variant="tiny" color={Palette.textFaint} style={styles.cellCenter}>
                          D
                        </Txt>
                        <Txt variant="tiny" color={Palette.textFaint} style={styles.cellCenter}>
                          Y
                        </Txt>
                        <Txt variant="tiny" color={Palette.textFaint} style={styles.cellCenter}>
                          B
                        </Txt>
                        <Txt variant="tiny" color={Accent} style={styles.cellRight}>
                          Net
                        </Txt>
                      </View>

                      {exam.subjects.map((sub, sIdx) => (
                        <View key={sIdx} style={styles.tableRow}>
                          <Txt variant="smallStrong" color={Palette.text} style={{ flex: 2 }}>
                            {sub.subject}
                          </Txt>
                          <Txt variant="small" color={Palette.green} style={styles.cellCenter}>
                            {sub.correct}
                          </Txt>
                          <Txt variant="small" color={Palette.pink} style={styles.cellCenter}>
                            {sub.wrong}
                          </Txt>
                          <Txt variant="small" color={Palette.textFaint} style={styles.cellCenter}>
                            {sub.empty}
                          </Txt>
                          <Txt variant="smallStrong" color={Accent} style={styles.cellRight}>
                            {sub.net}
                          </Txt>
                        </View>
                      ))}
                    </View>

                    <View style={styles.examCardFooter}>
                      <PressScale onPress={() => handleDelete(exam.id, exam.title)} scaleTo={0.92}>
                        <View style={styles.deleteBtn}>
                          <Trash2 size={14} color={Palette.pink} strokeWidth={2.2} />
                          <Txt variant="tiny" color={Palette.pink}>
                            Denemeyi Sil
                          </Txt>
                        </View>
                      </PressScale>
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Yeni Deneme Ekleme Modalı */}
      <AddExamModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchExams();
        }}
        grade={student.grade ?? '8. Sınıf'}
      />
    </View>
  );
}

// -----------------------------------------------------------------------------
// YENİ DENEME EKLEME MODALI (CANLI NET HESAPLAYICILI)
// -----------------------------------------------------------------------------

function AddExamModal({
  visible,
  onClose,
  onSaved,
  grade,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  grade: string;
}) {
  const isLgs = grade.includes('8');
  const isTyt = grade.includes('12') || grade.includes('11') || grade.includes('Mezun');

  const defaultType: MockExamType = isLgs ? 'lgs' : isTyt ? 'tyt' : 'general';

  const [examType, setExamType] = useState<MockExamType>(defaultType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(localTodayStr());

  const getSubjectsForType = (type: MockExamType) => {
    if (type === 'lgs') return LGS_DEFAULT_SUBJECTS;
    if (type === 'tyt') return TYT_DEFAULT_SUBJECTS;
    return GENERAL_DEFAULT_SUBJECTS;
  };

  const defaultSubjects = useMemo(() => getSubjectsForType(examType), [examType]);

  const [scores, setScores] = useState<Record<string, { correct: string; wrong: string; empty: string }>>(() => {
    const subs = isLgs ? LGS_DEFAULT_SUBJECTS : isTyt ? TYT_DEFAULT_SUBJECTS : GENERAL_DEFAULT_SUBJECTS;
    const initial: Record<string, { correct: string; wrong: string; empty: string }> = {};
    for (const s of subs) {
      initial[s.subject] = { correct: '0', wrong: '0', empty: '0' };
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const handleSelectExamType = (t: MockExamType) => {
    setExamType(t);
    const subs = getSubjectsForType(t);
    const updated: Record<string, { correct: string; wrong: string; empty: string }> = {};
    for (const s of subs) {
      updated[s.subject] = scores[s.subject] ?? { correct: '0', wrong: '0', empty: '0' };
    }
    setScores(updated);
  };

  const handleScoreChange = (subject: string, field: 'correct' | 'wrong' | 'empty', val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setScores((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: clean,
      },
    }));
  };

  // Canlı toplam net hesabı
  const computedSubjects: ExamSubjectScore[] = useMemo(() => {
    return defaultSubjects.map((s) => {
      const cur = scores[s.subject] ?? { correct: '0', wrong: '0', empty: '0' };
      const c = Number(cur.correct) || 0;
      const w = Number(cur.wrong) || 0;
      const e = Number(cur.empty) || 0;
      const net = calculateNet(c, w, examType);
      return {
        subject: s.subject,
        correct: c,
        wrong: w,
        empty: e,
        net,
      };
    });
  }, [defaultSubjects, scores, examType]);

  const totalNet = useMemo(
    () => Math.round(computedSubjects.reduce((sum, s) => sum + s.net, 0) * 100) / 100,
    [computedSubjects]
  );

  const estimatedScore = useMemo(() => {
    if (examType === 'lgs') return estimateLgsScore(computedSubjects);
    if (examType === 'tyt') return estimateTytScore(computedSubjects);
    return undefined;
  }, [examType, computedSubjects]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen deneme sınavı için bir başlık (ör: Özdebir 1, Okul Denemesi 2) girin.');
      return;
    }

    setSaving(true);
    try {
      const totalCorrect = computedSubjects.reduce((sum, s) => sum + s.correct, 0);
      const totalWrong = computedSubjects.reduce((sum, s) => sum + s.wrong, 0);
      const totalEmpty = computedSubjects.reduce((sum, s) => sum + s.empty, 0);

      await saveMockExam({
        title: title.trim(),
        examType,
        date: date.trim() || localTodayStr(),
        subjects: computedSubjects,
        totalCorrect,
        totalWrong,
        totalEmpty,
        totalNet,
        estimatedScore,
      });

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboardWrap}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Txt variant="section" color={Palette.text}>
                  Yeni Deneme Sınavı Ekle
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  Doğru ve yanlışlarını gir, netlerin otomatik hesaplansın
                </Txt>
              </View>
              <PressScale onPress={onClose} scaleTo={0.88}>
                <View style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Palette.textDim} />
                </View>
              </PressScale>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Sınav Türü Seçimi */}
              <View style={styles.formGroup}>
                <Txt variant="tiny" color={Palette.textDim}>
                  SINAV TÜRÜ
                </Txt>
                <View style={styles.typeSelectorRow}>
                  {(['lgs', 'tyt', 'general'] as MockExamType[]).map((t) => {
                    const active = examType === t;
                    const label = t === 'lgs' ? 'LGS (3Y 1D)' : t === 'tyt' ? 'TYT (4Y 1D)' : 'Genel Sınav';
                    return (
                      <PressScale key={t} onPress={() => handleSelectExamType(t)} style={{ flex: 1 }}>
                        <View style={[styles.typePill, active && styles.typePillActive]}>
                          <Txt
                            variant="smallStrong"
                            color={active ? OnColor : Palette.textDim}
                            center
                          >
                            {label}
                          </Txt>
                        </View>
                      </PressScale>
                    );
                  })}
                </View>
              </View>

              {/* Deneme Adı ve Tarih */}
              <View style={styles.formGroup}>
                <Txt variant="tiny" color={Palette.textDim}>
                  DENEME BAŞLIĞI
                </Txt>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Örn: Özdebir LGS-1, TÖDER Denemesi"
                  placeholderTextColor={Palette.textFaint}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Txt variant="tiny" color={Palette.textDim}>
                  TARİH
                </Txt>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Palette.textFaint}
                  style={styles.input}
                />
              </View>

              {/* Canlı Toplam Net & Puan Kartı */}
              <View style={styles.liveSummaryBox}>
                <View style={styles.liveSummaryCol}>
                  <Txt variant="tiny" color={Palette.textDim}>
                    TOPLAM NET
                  </Txt>
                  <Txt variant="section" color={Accent}>
                    {totalNet} Net
                  </Txt>
                </View>
                {estimatedScore ? (
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      TAHMİNİ PUAN
                    </Txt>
                    <Txt variant="section" color={Palette.green}>
                      ~{estimatedScore}
                    </Txt>
                  </View>
                ) : null}
              </View>

              {/* Ders Ders Net Girişi */}
              <View style={styles.subjectsInputList}>
                <View style={styles.inputTableHead}>
                  <Txt variant="tiny" color={Palette.textFaint} style={{ flex: 2 }}>
                    Ders
                  </Txt>
                  <Txt variant="tiny" color={Palette.green} style={styles.inputColHead}>
                    Doğru
                  </Txt>
                  <Txt variant="tiny" color={Palette.pink} style={styles.inputColHead}>
                    Yanlış
                  </Txt>
                  <Txt variant="tiny" color={Palette.textFaint} style={styles.inputColHead}>
                    Boş
                  </Txt>
                  <Txt variant="tiny" color={Accent} style={styles.inputColHead}>
                    Net
                  </Txt>
                </View>

                {defaultSubjects.map((s) => {
                  const cur = scores[s.subject] ?? { correct: '0', wrong: '0', empty: '0' };
                  const subNet = calculateNet(Number(cur.correct) || 0, Number(cur.wrong) || 0, examType);
                  return (
                    <View key={s.subject} style={styles.subjectInputRow}>
                      <View style={{ flex: 2 }}>
                        <Txt variant="smallStrong" color={Palette.text}>
                          {s.subject}
                        </Txt>
                        <Txt variant="tiny" color={Palette.textFaint}>
                          {s.totalQuestions} Soru
                        </Txt>
                      </View>

                      <TextInput
                        keyboardType="number-pad"
                        value={cur.correct}
                        onChangeText={(v) => handleScoreChange(s.subject, 'correct', v)}
                        style={[styles.scoreInput, { color: Palette.green }]}
                      />
                      <TextInput
                        keyboardType="number-pad"
                        value={cur.wrong}
                        onChangeText={(v) => handleScoreChange(s.subject, 'wrong', v)}
                        style={[styles.scoreInput, { color: Palette.pink }]}
                      />
                      <TextInput
                        keyboardType="number-pad"
                        value={cur.empty}
                        onChangeText={(v) => handleScoreChange(s.subject, 'empty', v)}
                        style={styles.scoreInput}
                      />
                      <View style={styles.netBox}>
                        <Txt variant="smallStrong" color={Accent}>
                          {subNet}
                        </Txt>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <GhostButton label="Vazgeç" onPress={onClose} style={{ flex: 1 }} />
              <NeonButton
                label={saving ? 'Kaydediliyor...' : 'Denemeyi Kaydet'}
                icon="checkmark"
                onPress={handleSave}
                style={{ flex: 2 }}
                disabled={saving}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: Space.md,
  },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Space.lg,
    gap: Space.lg,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  bentoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space.md,
    paddingHorizontal: Space.xs,
    gap: 3,
  },
  bentoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aiCard: {
    gap: Space.md,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 174, 117, 0.4)',
    backgroundColor: '#FFFDF9',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    flex: 1,
  },
  aiIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DetailAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSummaryText: {
    lineHeight: 22,
  },
  shortcutContainer: {
    paddingTop: Space.xs,
    gap: Space.xs,
  },
  shortcutHeader: {
    letterSpacing: 0.6,
  },
  shortcutList: {
    gap: Space.xs,
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: Space.sm,
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.sm,
  },
  shortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shortcutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DetailAccent,
  },
  gainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.pill,
  },
  gainText: {
    fontWeight: '700',
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Space.xs,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  strategyText: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    paddingVertical: Space.huge,
  },
  examCard: {
    gap: Space.sm,
  },
  examCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  examInfoCol: {
    flex: 1,
    gap: 4,
  },
  examBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  examTitle: {
    marginTop: 2,
  },
  examRightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  totalNetBox: {
    alignItems: 'flex-end',
  },
  cardExpandTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Space.xs,
  },
  expandedContent: {
    gap: Space.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  subjectsTable: {
    gap: 6,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cellCenter: {
    flex: 1,
    textAlign: 'center',
  },
  cellRight: {
    flex: 1,
    textAlign: 'right',
  },
  examCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Space.xs,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    justifyContent: 'flex-end',
  },
  modalKeyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    paddingBottom: Space.xl,
    gap: Space.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 460,
  },
  formGroup: {
    gap: 6,
    marginBottom: Space.sm,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: Space.xs,
  },
  typePill: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  typePillActive: {
    backgroundColor: Accent,
    borderColor: Accent,
  },
  input: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Palette.bg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    paddingHorizontal: Space.md,
    color: Palette.text,
    fontFamily: Font.regular,
    fontSize: 14,
  },
  liveSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.md,
    paddingVertical: Space.sm,
    marginBottom: Space.sm,
  },
  liveSummaryCol: {
    alignItems: 'center',
  },
  subjectsInputList: {
    gap: Space.xs,
    paddingBottom: Space.lg,
  },
  inputTableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  inputColHead: {
    width: 48,
    textAlign: 'center',
  },
  subjectInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  scoreInput: {
    width: 48,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Palette.bg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    textAlign: 'center',
    fontFamily: Font.semibold,
    fontSize: 14,
  },
  netBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Space.md,
    paddingTop: Space.xs,
  },
});
