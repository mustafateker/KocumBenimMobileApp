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
  estimateAytScore,
  estimateLgsScore,
  estimateTytScore,
  estimateYksCompositeScore,
  generateAiExamAnalysis,
  getAytSubjectsForField,
  getExamTrack,
  LGS_SAYISAL_SUBJECTS,
  LGS_SOZEL_SUBJECTS,
  loadMockExams,
  localTodayStr,
  saveMockExam,
  TYT_DEFAULT_SUBJECTS,
  type AiExamAnalysis,
  type ExamSubjectScore,
  type ExamTrack,
  type MockExam,
  type YksField,
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

  // Öğrencinin kayıtlı sınıfına göre sınav sistemi (5-8: LGS, 9-12/Mezun: YKS)
  const track = useMemo(() => getExamTrack(student.grade), [student.grade]);
  const isLgs = track === 'lgs';

  const [exams, setExams] = useState<MockExam[]>([]);
  const [, setLoading] = useState(true);
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

  // Öğrencinin kayıtlı olduğu sınav sistemine ait denemeler
  const studentExams = useMemo(() => {
    return exams.filter((e) => {
      if (isLgs) {
        return e.examType === 'lgs' || e.examType === 'general';
      }
      return e.examType === 'tyt' || e.examType === 'ayt' || e.examType === 'yks';
    });
  }, [exams, isLgs]);

  const latestExam = studentExams[0] ?? null;
  const bestScore = useMemo(
    () => (studentExams.length > 0 ? Math.max(...studentExams.map((e) => e.estimatedScore ?? 0)) : 0),
    [studentExams]
  );
  const bestNet = useMemo(
    () => (studentExams.length > 0 ? Math.max(...studentExams.map((e) => e.totalNet)) : 0),
    [studentExams]
  );
  const avgNet = useMemo(
    () =>
      studentExams.length > 0
        ? Math.round((studentExams.reduce((s, e) => s + e.totalNet, 0) / studentExams.length) * 10) / 10
        : 0,
    [studentExams]
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
    (isLgs
      ? student.targetHighSchool
      : student.targetUniversity || student.targetDepartment) ||
    student.goal ||
    (isLgs ? 'Hedef Lise' : 'Hedef Üniversite');

  return (
    <View style={[styles.root, { paddingTop: insets.top + Space.md }]}>
      {/* Header - Sınıfa Göre Özel Başlık */}
      <View style={styles.header}>
        <PressScale onPress={() => router.back()} scaleTo={0.9}>
          <View style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={Palette.text} />
          </View>
        </PressScale>
        <View style={styles.headerTitleWrap}>
          <Txt variant="section" color={Palette.text}>
            {isLgs ? 'LGS Deneme Sınavlarım' : 'YKS Deneme Sınavlarım'}
          </Txt>
          <Txt variant="tiny" color={Palette.textDim}>
            {isLgs
              ? `${student.grade ?? '8. Sınıf'} · Liselere Geçiş Sistemi (LGS)`
              : `${student.grade ?? '12. Sınıf'} · Yükseköğretim Kurumları Sınavı (TYT - AYT)`}
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
              {bestScore > 0 ? `${bestScore} Puan` : `${bestNet} Net`}
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
              {studentExams.length > 0 ? `${avgNet} Net` : '-'}
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

        {/* Kayıtlı Denemeler Başlığı */}
        <View style={styles.listHeaderRow}>
          <Txt variant="section" color={Palette.text}>
            {isLgs ? 'Kayıtlı LGS Denemeleri' : 'Kayıtlı YKS Denemeleri'} ({studentExams.length})
          </Txt>
          <PressScale onPress={() => setModalOpen(true)} scaleTo={0.92}>
            <View style={styles.addTextBtn}>
              <Plus size={16} color={Accent} strokeWidth={2.4} />
              <Txt variant="smallStrong" color={Accent}>
                {isLgs ? 'LGS Denemesi Ekle' : 'YKS Denemesi Ekle'}
              </Txt>
            </View>
          </PressScale>
        </View>

        {/* Deneme Listesi */}
        {studentExams.length === 0 ? (
          <Card style={styles.emptyCard}>
            <BookOpen size={40} color={Palette.textFaint} strokeWidth={1.5} />
            <Txt variant="body" color={Palette.textDim} center>
              Henüz kaydedilmiş {isLgs ? 'LGS' : 'YKS'} deneme sınavın bulunmuyor.
            </Txt>
            <NeonButton
              label={isLgs ? 'İlk LGS Denemeni Ekle' : 'İlk YKS Denemeni Ekle'}
              icon="add"
              onPress={() => setModalOpen(true)}
              size="md"
            />
          </Card>
        ) : (
          studentExams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;
            const toggleExpand = () => setExpandedExamId(isExpanded ? null : exam.id);

            return (
              <Card key={exam.id} style={styles.examCard}>
                <PressScale onPress={toggleExpand} scaleTo={0.98}>
                  <View style={styles.examCardHeader}>
                    <View style={styles.examInfoCol}>
                      <View style={styles.examBadgeRow}>
                        <Pill
                          label={
                            exam.examType === 'lgs'
                              ? 'LGS (90 S)'
                              : exam.examType === 'tyt'
                                ? 'TYT (120 S)'
                                : exam.examType === 'ayt'
                                  ? `AYT (${exam.yksField?.toUpperCase() ?? '80 S'})`
                                  : 'YKS (TYT+AYT)'
                          }
                          color={exam.examType === 'lgs' ? DetailAccent : Palette.blue}
                        />
                        <View style={styles.dateChip}>
                          <Calendar size={12} color={Palette.textFaint} />
                          <Txt variant="tiny" color={Palette.textDim}>
                            {exam.date}
                          </Txt>
                        </View>
                      </View>

                      <Txt variant="bodyStrong" color={Palette.text} style={styles.examTitle}>
                        {exam.title}
                      </Txt>

                      {/* Oturum Net Özeti (Sözel/Sayısal veya TYT/AYT) */}
                      {exam.sessionBreakdown ? (
                        <View style={styles.sessionPillsRow}>
                          {exam.sessionBreakdown.sozelNet !== undefined ? (
                            <View style={styles.sessionPill}>
                              <Txt variant="tiny" color={Palette.textDim}>
                                Sözel: <Txt variant="tiny" color={Palette.text} style={{ fontWeight: '700' }}>{exam.sessionBreakdown.sozelNet} Net</Txt>
                              </Txt>
                            </View>
                          ) : null}
                          {exam.sessionBreakdown.sayisalNet !== undefined ? (
                            <View style={styles.sessionPill}>
                              <Txt variant="tiny" color={Palette.textDim}>
                                Sayısal: <Txt variant="tiny" color={Palette.text} style={{ fontWeight: '700' }}>{exam.sessionBreakdown.sayisalNet} Net</Txt>
                              </Txt>
                            </View>
                          ) : null}
                          {exam.sessionBreakdown.tytNet !== undefined ? (
                            <View style={styles.sessionPill}>
                              <Txt variant="tiny" color={Palette.textDim}>
                                TYT: <Txt variant="tiny" color={Palette.text} style={{ fontWeight: '700' }}>{exam.sessionBreakdown.tytNet} Net</Txt>
                              </Txt>
                            </View>
                          ) : null}
                          {exam.sessionBreakdown.aytNet !== undefined ? (
                            <View style={styles.sessionPill}>
                              <Txt variant="tiny" color={Palette.textDim}>
                                AYT: <Txt variant="tiny" color={Palette.text} style={{ fontWeight: '700' }}>{exam.sessionBreakdown.aytNet} Net</Txt>
                              </Txt>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.examRightCol}>
                      <View style={styles.totalNetBox}>
                        <Txt variant="section" color={isLgs ? DetailAccent : Accent}>
                          {exam.totalNet}
                        </Txt>
                        <Txt variant="tiny" color={Palette.textDim}>
                          {isLgs ? 'Toplam Net / 90' : 'Toplam Net'}
                        </Txt>
                      </View>
                      {exam.estimatedScore ? (
                        <Txt variant="tiny" color={Palette.green} style={{ fontWeight: '700' }}>
                          {exam.estimatedScore} Puan
                        </Txt>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardExpandTrigger}>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      {isExpanded ? 'Ders Ayrıntılarını Gizle' : 'Ders Netlerini Gör'}
                    </Txt>
                    {isExpanded ? (
                      <ChevronUp size={14} color={Palette.textFaint} />
                    ) : (
                      <ChevronDown size={14} color={Palette.textFaint} />
                    )}
                  </View>
                </PressScale>

                {/* Açılır Ders Tablosu */}
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

      {/* Sınav Giriş Modalı (Öğrencinin kayıtlı sınıfına göre LGS veya YKS) */}
      <AddExamModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchExams();
        }}
        track={track}
      />
    </View>
  );
}

// -----------------------------------------------------------------------------
// YENİ DENEME EKLEME MODALI (Öğrencinin Sınav Sistemine Özel)
// -----------------------------------------------------------------------------

function AddExamModal({
  visible,
  onClose,
  onSaved,
  track,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  track: ExamTrack;
}) {
  const isLgs = track === 'lgs';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(localTodayStr());

  // YKS Özellikleri
  const [yksSubtype, setYksSubtype] = useState<'tyt' | 'ayt' | 'yks'>('tyt');
  const [yksField, setYksField] = useState<YksField>('sayisal');

  // Skor State: subject -> { correct, wrong, empty }
  const [scores, setScores] = useState<Record<string, { correct: string; wrong: string; empty: string }>>({});
  const [saving, setSaving] = useState(false);

  // Oturum Dersleri
  const lgsSozel = LGS_SOZEL_SUBJECTS;
  const lgsSayisal = LGS_SAYISAL_SUBJECTS;
  const tytSubs = TYT_DEFAULT_SUBJECTS;
  const aytSubs = useMemo(() => getAytSubjectsForField(yksField), [yksField]);

  const getSubjectScore = useCallback(
    (subj: string, totalQuestions: number) => {
      return (
        scores[subj] ?? {
          correct: '',
          wrong: '',
          empty: String(totalQuestions),
        }
      );
    },
    [scores]
  );

  const handleScoreChange = (
    subject: string,
    field: 'correct' | 'wrong' | 'empty',
    val: string,
    totalQuestions: number
  ) => {
    const clean = val.replace(/[^0-9]/g, '');
    setScores((prev) => {
      const cur = prev[subject] ?? { correct: '', wrong: '', empty: String(totalQuestions) };
      const next = { ...cur, [field]: clean };

      // Kullanıcı Doğru veya Yanlış girdiğinde testin toplam soru sayısından
      // otomatik olarak Boş sayısını hesapla ve doldur
      if (field === 'correct' || field === 'wrong') {
        const c = Number(next.correct) || 0;
        const w = Number(next.wrong) || 0;
        const autoEmpty = Math.max(0, totalQuestions - c - w);
        next.empty = String(autoEmpty);
      }

      return {
        ...prev,
        [subject]: next,
      };
    });
  };

  // LGS Canlı Net ve Puan Hesabı (3 Yanlış 1 Doğruyu Götürür)
  const lgsSozelComputed = useMemo(() => {
    return lgsSozel.map((s) => {
      const sc = getSubjectScore(s.subject, s.totalQuestions);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'lgs');
      return { subject: s.subject, totalQuestions: s.totalQuestions, correct: c, wrong: w, empty: e, net };
    });
  }, [lgsSozel, getSubjectScore]);

  const lgsSayisalComputed = useMemo(() => {
    return lgsSayisal.map((s) => {
      const sc = getSubjectScore(s.subject, s.totalQuestions);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'lgs');
      return { subject: s.subject, totalQuestions: s.totalQuestions, correct: c, wrong: w, empty: e, net };
    });
  }, [lgsSayisal, getSubjectScore]);

  const lgsSozelNet = useMemo(
    () => Math.round(lgsSozelComputed.reduce((sum, s) => sum + s.net, 0) * 100) / 100,
    [lgsSozelComputed]
  );
  const lgsSayisalNet = useMemo(
    () => Math.round(lgsSayisalComputed.reduce((sum, s) => sum + s.net, 0) * 100) / 100,
    [lgsSayisalComputed]
  );
  const lgsTotalNet = Math.round((lgsSozelNet + lgsSayisalNet) * 100) / 100;
  const lgsEstimatedScore = useMemo(
    () => estimateLgsScore([...lgsSozelComputed, ...lgsSayisalComputed]),
    [lgsSozelComputed, lgsSayisalComputed]
  );

  // YKS Canlı Net ve Puan Hesabı (4 Yanlış 1 Doğruyu Götürür)
  const tytComputed = useMemo(() => {
    return tytSubs.map((s) => {
      const sc = getSubjectScore(s.subject, s.totalQuestions);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'tyt');
      return { subject: s.subject, totalQuestions: s.totalQuestions, correct: c, wrong: w, empty: e, net };
    });
  }, [tytSubs, getSubjectScore]);

  const aytComputed = useMemo(() => {
    return aytSubs.map((s) => {
      const sc = getSubjectScore(s.subject, s.totalQuestions);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'ayt');
      return { subject: s.subject, totalQuestions: s.totalQuestions, correct: c, wrong: w, empty: e, net };
    });
  }, [aytSubs, getSubjectScore]);

  const tytNet = useMemo(
    () => Math.round(tytComputed.reduce((sum, s) => sum + s.net, 0) * 100) / 100,
    [tytComputed]
  );
  const aytNet = useMemo(
    () => Math.round(aytComputed.reduce((sum, s) => sum + s.net, 0) * 100) / 100,
    [aytComputed]
  );

  const tytScore = useMemo(() => estimateTytScore(tytComputed), [tytComputed]);
  const aytScore = useMemo(() => estimateAytScore(aytComputed), [aytComputed]);
  const yksCompositeScore = useMemo(
    () => estimateYksCompositeScore(tytScore, aytScore),
    [tytScore, aytScore]
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen deneme sınavı için bir başlık girin.');
      return;
    }

    setSaving(true);
    try {
      if (isLgs) {
        const allSubjects = [...lgsSozelComputed, ...lgsSayisalComputed];
        const totalC = allSubjects.reduce((s, sub) => s + sub.correct, 0);
        const totalW = allSubjects.reduce((s, sub) => s + sub.wrong, 0);
        const totalE = allSubjects.reduce((s, sub) => s + sub.empty, 0);

        await saveMockExam({
          title: title.trim(),
          examType: 'lgs',
          date,
          subjects: allSubjects,
          totalCorrect: totalC,
          totalWrong: totalW,
          totalEmpty: totalE,
          totalNet: lgsTotalNet,
          estimatedScore: lgsEstimatedScore,
          sessionBreakdown: {
            sozelNet: lgsSozelNet,
            sayisalNet: lgsSayisalNet,
          },
        });
      } else {
        // YKS
        let subjectsToSave: ExamSubjectScore[] = [];
        let finalScore = tytScore;

        if (yksSubtype === 'tyt') {
          subjectsToSave = tytComputed;
          finalScore = tytScore;
        } else if (yksSubtype === 'ayt') {
          subjectsToSave = aytComputed;
          finalScore = aytScore;
        } else {
          subjectsToSave = [...tytComputed, ...aytComputed];
          finalScore = yksCompositeScore;
        }

        const totalC = subjectsToSave.reduce((s, sub) => s + sub.correct, 0);
        const totalW = subjectsToSave.reduce((s, sub) => s + sub.wrong, 0);
        const totalE = subjectsToSave.reduce((s, sub) => s + sub.empty, 0);
        const totalNet = Math.round(subjectsToSave.reduce((s, sub) => s + sub.net, 0) * 100) / 100;

        await saveMockExam({
          title: title.trim(),
          examType: yksSubtype,
          yksField,
          date,
          subjects: subjectsToSave,
          totalCorrect: totalC,
          totalWrong: totalW,
          totalEmpty: totalE,
          totalNet,
          estimatedScore: finalScore,
          sessionBreakdown: {
            tytNet: yksSubtype !== 'ayt' ? tytNet : undefined,
            aytNet: yksSubtype !== 'tyt' ? aytNet : undefined,
          },
        });
      }

      onSaved();
    } catch {
      Alert.alert('Hata', 'Deneme sınavı kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

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
                  {isLgs ? 'Yeni LGS Denemesi' : 'Yeni YKS Denemesi'}
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  {isLgs ? 'Sözel ve Sayısal Oturumları' : 'TYT ve Alan Oturumları'}
                </Txt>
              </View>
              <PressScale onPress={onClose} scaleTo={0.9}>
                <View style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Palette.textDim} />
                </View>
              </PressScale>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Deneme Bilgileri */}
              <View style={styles.formGroup}>
                <Txt variant="smallStrong" color={Palette.text}>
                  Deneme Adı & Yayın
                </Txt>
                <TextInput
                  placeholder={isLgs ? 'Örn: Özdebir LGS-3, Mozaik Türkiye Geneli' : 'Örn: 3D TYT-2, Bilgi Sarmal AYT'}
                  placeholderTextColor={Palette.textFaint}
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Txt variant="smallStrong" color={Palette.text}>
                  Tarih
                </Txt>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-AA-GG"
                  placeholderTextColor={Palette.textFaint}
                  style={styles.input}
                />
              </View>

              {/* YKS için Oturum ve Alan Seçimi */}
              {!isLgs && (
                <View style={styles.yksConfigBlock}>
                  <View style={styles.formGroup}>
                    <Txt variant="smallStrong" color={Palette.text}>
                      YKS Oturum Seçimi
                    </Txt>
                    <View style={styles.typeSelectorRow}>
                      <PressScale onPress={() => setYksSubtype('tyt')} style={styles.flex}>
                        <View style={[styles.typePill, yksSubtype === 'tyt' && styles.typePillActive]}>
                          <Txt variant="tiny" color={yksSubtype === 'tyt' ? OnColor : Palette.textDim} center>
                            Sadece TYT
                          </Txt>
                        </View>
                      </PressScale>
                      <PressScale onPress={() => setYksSubtype('ayt')} style={styles.flex}>
                        <View style={[styles.typePill, yksSubtype === 'ayt' && styles.typePillActive]}>
                          <Txt variant="tiny" color={yksSubtype === 'ayt' ? OnColor : Palette.textDim} center>
                            Sadece AYT
                          </Txt>
                        </View>
                      </PressScale>
                      <PressScale onPress={() => setYksSubtype('yks')} style={styles.flex}>
                        <View style={[styles.typePill, yksSubtype === 'yks' && styles.typePillActive]}>
                          <Txt variant="tiny" color={yksSubtype === 'yks' ? OnColor : Palette.textDim} center>
                            Tam YKS (TYT+AYT)
                          </Txt>
                        </View>
                      </PressScale>
                    </View>
                  </View>

                  {yksSubtype !== 'tyt' && (
                    <View style={styles.formGroup}>
                      <Txt variant="smallStrong" color={Palette.text}>
                        AYT Alanı
                      </Txt>
                      <View style={styles.typeSelectorRow}>
                        {(
                          [
                            { id: 'sayisal', label: 'Sayısal' },
                            { id: 'esitagirlik', label: 'Eşit Ağırlık' },
                            { id: 'sozel', label: 'Sözel' },
                            { id: 'dil', label: 'Dil (YDT)' },
                          ] as const
                        ).map((field) => (
                          <PressScale
                            key={field.id}
                            onPress={() => setYksField(field.id)}
                            style={styles.flex}
                          >
                            <View style={[styles.typePill, yksField === field.id && styles.typePillActive]}>
                              <Txt
                                variant="tiny"
                                color={yksField === field.id ? OnColor : Palette.textDim}
                                center
                              >
                                {field.label}
                              </Txt>
                            </View>
                          </PressScale>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Canlı Net & Puan Göstergesi */}
              {isLgs ? (
                <View style={styles.liveSummaryBox}>
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      SÖZEL (50 S / 75 dk)
                    </Txt>
                    <Txt variant="bodyStrong" color={DetailAccent}>
                      {lgsSozelNet} Net
                    </Txt>
                  </View>
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      SAYISAL (40 S / 80 dk)
                    </Txt>
                    <Txt variant="bodyStrong" color={DetailAccent}>
                      {lgsSayisalNet} Net
                    </Txt>
                  </View>
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      LGS TAHMİNİ PUAN
                    </Txt>
                    <Txt variant="bodyStrong" color={Palette.green}>
                      {lgsEstimatedScore} / 500
                    </Txt>
                  </View>
                </View>
              ) : (
                <View style={styles.liveSummaryBox}>
                  {yksSubtype !== 'ayt' && (
                    <View style={styles.liveSummaryCol}>
                      <Txt variant="tiny" color={Palette.textDim}>
                        TYT NET (120 S)
                      </Txt>
                      <Txt variant="bodyStrong" color={Accent}>
                        {tytNet} Net
                      </Txt>
                    </View>
                  )}
                  {yksSubtype !== 'tyt' && (
                    <View style={styles.liveSummaryCol}>
                      <Txt variant="tiny" color={Palette.textDim}>
                        AYT NET (80 S)
                      </Txt>
                      <Txt variant="bodyStrong" color={Accent}>
                        {aytNet} Net
                      </Txt>
                    </View>
                  )}
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      TAHMİNİ PUAN
                    </Txt>
                    <Txt variant="bodyStrong" color={Palette.green}>
                      {yksSubtype === 'tyt' ? tytScore : yksSubtype === 'ayt' ? aytScore : yksCompositeScore} / 500
                    </Txt>
                  </View>
                </View>
              )}

              {/* Oturum Ders Tabloları */}
              {isLgs ? (
                <View style={styles.subjectsInputList}>
                  {/* LGS Sözel Oturum */}
                  <View style={styles.sessionHeaderRow}>
                    <Txt variant="smallStrong" color={DetailAccent}>
                      1. Oturum: Sözel Bölüm (75 dk · 50 Soru)
                    </Txt>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      Türkçe (20), İnkılap (10), Din (10), İngilizce (10)
                    </Txt>
                  </View>
                  <View style={styles.inputTableHead}>
                    <Txt variant="tiny" color={Palette.textFaint} style={{ flex: 1 }}>
                      Ders Adı
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
                    <Txt variant="tiny" color={DetailAccent} style={styles.inputColHead}>
                      Net
                    </Txt>
                  </View>

                  {lgsSozelComputed.map((sub) => (
                    <SubjectInputRow
                      key={sub.subject}
                      subject={sub.subject}
                      totalQuestions={sub.totalQuestions}
                      correct={getSubjectScore(sub.subject, sub.totalQuestions).correct}
                      wrong={getSubjectScore(sub.subject, sub.totalQuestions).wrong}
                      empty={getSubjectScore(sub.subject, sub.totalQuestions).empty}
                      net={sub.net}
                      accentColor={DetailAccent}
                      onChange={handleScoreChange}
                    />
                  ))}

                  {/* LGS Sayısal Oturum */}
                  <View style={[styles.sessionHeaderRow, { marginTop: Space.md }]}>
                    <Txt variant="smallStrong" color={DetailAccent}>
                      2. Oturum: Sayısal Bölüm (80 dk · 40 Soru)
                    </Txt>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      Matematik (20), Fen Bilimleri (20)
                    </Txt>
                  </View>
                  {lgsSayisalComputed.map((sub) => (
                    <SubjectInputRow
                      key={sub.subject}
                      subject={sub.subject}
                      totalQuestions={sub.totalQuestions}
                      correct={getSubjectScore(sub.subject, sub.totalQuestions).correct}
                      wrong={getSubjectScore(sub.subject, sub.totalQuestions).wrong}
                      empty={getSubjectScore(sub.subject, sub.totalQuestions).empty}
                      net={sub.net}
                      accentColor={DetailAccent}
                      onChange={handleScoreChange}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.subjectsInputList}>
                  {/* YKS TYT Oturumu */}
                  {yksSubtype !== 'ayt' && (
                    <>
                      <View style={styles.sessionHeaderRow}>
                        <Txt variant="smallStrong" color={Palette.blue}>
                          TYT Oturumu (165 dk · 120 Soru)
                        </Txt>
                      </View>
                      <View style={styles.inputTableHead}>
                        <Txt variant="tiny" color={Palette.textFaint} style={{ flex: 1 }}>
                          Ders Adı
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

                      {tytComputed.map((sub) => (
                        <SubjectInputRow
                          key={sub.subject}
                          subject={sub.subject}
                          totalQuestions={sub.totalQuestions}
                          correct={getSubjectScore(sub.subject, sub.totalQuestions).correct}
                          wrong={getSubjectScore(sub.subject, sub.totalQuestions).wrong}
                          empty={getSubjectScore(sub.subject, sub.totalQuestions).empty}
                          net={sub.net}
                          accentColor={Accent}
                          onChange={handleScoreChange}
                        />
                      ))}
                    </>
                  )}

                  {/* YKS AYT Oturumu */}
                  {yksSubtype !== 'tyt' && (
                    <>
                      <View style={[styles.sessionHeaderRow, { marginTop: Space.md }]}>
                        <Txt variant="smallStrong" color={Palette.blue}>
                          AYT Oturumu ({yksField.toUpperCase()} · 180 dk · 80 Soru)
                        </Txt>
                      </View>
                      <View style={styles.inputTableHead}>
                        <Txt variant="tiny" color={Palette.textFaint} style={{ flex: 1 }}>
                          Ders Adı
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

                      {aytComputed.map((sub) => (
                        <SubjectInputRow
                          key={sub.subject}
                          subject={sub.subject}
                          totalQuestions={sub.totalQuestions}
                          correct={getSubjectScore(sub.subject, sub.totalQuestions).correct}
                          wrong={getSubjectScore(sub.subject, sub.totalQuestions).wrong}
                          empty={getSubjectScore(sub.subject, sub.totalQuestions).empty}
                          net={sub.net}
                          accentColor={Accent}
                          onChange={handleScoreChange}
                        />
                      ))}
                    </>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Modal Eylemleri */}
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

function SubjectInputRow({
  subject,
  totalQuestions,
  correct,
  wrong,
  empty,
  net,
  accentColor,
  onChange,
}: {
  subject: string;
  totalQuestions: number;
  correct: string;
  wrong: string;
  empty: string;
  net: number;
  accentColor: string;
  onChange: (subject: string, field: 'correct' | 'wrong' | 'empty', val: string, totalQuestions: number) => void;
}) {
  return (
    <View style={styles.subjectInputRow}>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt variant="smallStrong" color={Palette.text} numberOfLines={1}>
          {subject}
        </Txt>
        <Txt variant="tiny" color={Palette.textFaint}>
          {totalQuestions} Soru
        </Txt>
      </View>
      <TextInput
        style={styles.scoreInput}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={Palette.textFaint}
        value={correct}
        onChangeText={(val) => onChange(subject, 'correct', val, totalQuestions)}
        selectTextOnFocus
      />
      <TextInput
        style={styles.scoreInput}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={Palette.textFaint}
        value={wrong}
        onChangeText={(val) => onChange(subject, 'wrong', val, totalQuestions)}
        selectTextOnFocus
      />
      <TextInput
        style={[styles.scoreInput, styles.autoEmptyInput]}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={Palette.textFaint}
        value={empty}
        onChangeText={(val) => onChange(subject, 'empty', val, totalQuestions)}
        selectTextOnFocus
      />
      <View style={styles.netBox}>
        <Txt variant="smallStrong" color={accentColor}>
          {net}
        </Txt>
      </View>
    </View>
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
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.sm,
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
  sessionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  sessionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceHi,
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
    maxHeight: '92%',
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
    maxHeight: 480,
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
  yksConfigBlock: {
    gap: Space.xs,
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
  sessionHeaderRow: {
    paddingVertical: 4,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    marginBottom: 4,
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
  autoEmptyInput: {
    backgroundColor: Palette.surfaceHi,
    color: Palette.text,
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
