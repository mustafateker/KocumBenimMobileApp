import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Info,
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
  getExamCountdown,
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

  const studentTrack = useMemo(() => getExamTrack(student.grade), [student.grade]);
  const [activeTab, setActiveTab] = useState<ExamTrack>(studentTrack);

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

  // Aktif sekmeye göre denemeleri filtrele
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (activeTab === 'lgs') {
        return e.examType === 'lgs' || e.examType === 'general';
      }
      return e.examType === 'tyt' || e.examType === 'ayt' || e.examType === 'yks';
    });
  }, [exams, activeTab]);

  const latestExam = filteredExams[0] ?? null;
  const bestScore = useMemo(
    () => (filteredExams.length > 0 ? Math.max(...filteredExams.map((e) => e.estimatedScore ?? 0)) : 0),
    [filteredExams]
  );
  const bestNet = useMemo(
    () => (filteredExams.length > 0 ? Math.max(...filteredExams.map((e) => e.totalNet)) : 0),
    [filteredExams]
  );
  const avgNet = useMemo(
    () =>
      filteredExams.length > 0
        ? Math.round((filteredExams.reduce((s, e) => s + e.totalNet, 0) / filteredExams.length) * 10) / 10
        : 0,
    [filteredExams]
  );

  const countdownInfo = useMemo(() => getExamCountdown(activeTab === 'lgs' ? '8. Sınıf' : '12. Sınıf'), [activeTab]);

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
    (activeTab === 'lgs'
      ? student.targetHighSchool
      : student.targetUniversity || student.targetDepartment) ||
    student.goal ||
    (activeTab === 'lgs' ? 'Hedef Lise' : 'Hedef Üniversite');

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
            Deneme Takip Sistemi
          </Txt>
          <Txt variant="tiny" color={Palette.textDim}>
            {activeTab === 'lgs' ? '8. Sınıf & Liselere Geçiş' : 'YKS (TYT - AYT) & Üniversite'}
          </Txt>
        </View>
        <PressScale onPress={() => setModalOpen(true)} scaleTo={0.92}>
          <View style={styles.addIconBtn}>
            <Plus size={18} color={OnColor} strokeWidth={2.5} />
          </View>
        </PressScale>
      </View>

      {/* Sınav Türü Seçici (LGS vs YKS) */}
      <View style={styles.tabSwitcherRow}>
        <PressScale
          onPress={() => setActiveTab('lgs')}
          style={styles.flex}
          scaleTo={0.97}
        >
          <View style={[styles.examTrackTab, activeTab === 'lgs' && styles.examTrackTabActive]}>
            <Txt
              variant="smallStrong"
              color={activeTab === 'lgs' ? OnColor : Palette.textDim}
            >
              LGS Denemeleri (8. Sınıf)
            </Txt>
          </View>
        </PressScale>

        <PressScale
          onPress={() => setActiveTab('yks')}
          style={styles.flex}
          scaleTo={0.97}
        >
          <View style={[styles.examTrackTab, activeTab === 'yks' && styles.examTrackTabActive]}>
            <Txt
              variant="smallStrong"
              color={activeTab === 'yks' ? OnColor : Palette.textDim}
            >
              YKS Denemeleri (TYT - AYT)
            </Txt>
          </View>
        </PressScale>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sınav Format & Kural Kartı */}
        <Card style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <View style={styles.rulesBadge}>
              <Info size={14} color={Accent} />
              <Txt variant="tiny" color={Accent} style={{ fontWeight: '700' }}>
                {activeTab === 'lgs' ? 'LGS SİSTEMİ KURALLARI' : 'YKS SİSTEMİ KURALLARI'}
              </Txt>
            </View>
            <Txt variant="tiny" color={Palette.textFaint}>
              {countdownInfo.examDateStr}
            </Txt>
          </View>
          <Txt variant="smallStrong" color={Palette.text}>
            {countdownInfo.subInfo}
          </Txt>
          <View style={styles.rulesChipsRow}>
            <View style={styles.ruleChip}>
              <Clock size={12} color={Palette.green} />
              <Txt variant="tiny" color={Palette.textDim}>
                {countdownInfo.sessionRule}
              </Txt>
            </View>
            <View style={styles.ruleChip}>
              <Award size={12} color={DetailAccent} />
              <Txt variant="tiny" color={Palette.textDim}>
                {countdownInfo.penaltyRule}
              </Txt>
            </View>
          </View>
        </Card>

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
              {filteredExams.length > 0 ? `${avgNet} Net` : '-'}
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
            {activeTab === 'lgs' ? 'LGS Denemeleri' : 'YKS (TYT/AYT) Denemeleri'} ({filteredExams.length})
          </Txt>
          <PressScale onPress={() => setModalOpen(true)} scaleTo={0.92}>
            <View style={styles.addTextBtn}>
              <Plus size={16} color={Accent} strokeWidth={2.4} />
              <Txt variant="smallStrong" color={Accent}>
                Deneme Ekle
              </Txt>
            </View>
          </PressScale>
        </View>

        {/* Deneme Listesi */}
        {filteredExams.length === 0 ? (
          <Card style={styles.emptyCard}>
            <BookOpen size={40} color={Palette.textFaint} strokeWidth={1.5} />
            <Txt variant="body" color={Palette.textDim} center>
              Henüz kaydedilmiş {activeTab === 'lgs' ? 'LGS' : 'YKS'} deneme sınavı bulunmuyor.
            </Txt>
            <NeonButton
              label={activeTab === 'lgs' ? 'LGS Denemesi Ekle' : 'YKS Denemesi Ekle'}
              icon="add"
              onPress={() => setModalOpen(true)}
              size="md"
            />
          </Card>
        ) : (
          filteredExams.map((exam) => {
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
                          color={exam.examType === 'lgs' ? Accent : Palette.blue}
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
                        <Txt variant="section" color={Accent}>
                          {exam.totalNet}
                        </Txt>
                        <Txt variant="tiny" color={Palette.textDim}>
                          Toplam Net
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
                          Net ({exam.examType === 'lgs' ? '3Y=1D' : '4Y=1D'})
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

      {/* Sınav Giriş Modalı (LGS ve YKS için ayrılmış motor) */}
      <AddExamModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchExams();
        }}
        initialTrack={activeTab}
      />
    </View>
  );
}

// -----------------------------------------------------------------------------
// YENİ DENEME EKLEME MODALI (LGS ve YKS Ayrılmış Oturum Motoru)
// -----------------------------------------------------------------------------

function AddExamModal({
  visible,
  onClose,
  onSaved,
  initialTrack,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialTrack: ExamTrack;
}) {
  const [modalTrack, setModalTrack] = useState<ExamTrack>(initialTrack);
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

  // Skorları sıfırla/doldur
  const getSubjectScore = useCallback(
    (subj: string) => {
      return scores[subj] ?? { correct: '0', wrong: '0', empty: '0' };
    },
    [scores]
  );

  const handleScoreChange = (subject: string, field: 'correct' | 'wrong' | 'empty', val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setScores((prev) => ({
      ...prev,
      [subject]: {
        ...(prev[subject] ?? { correct: '0', wrong: '0', empty: '0' }),
        [field]: clean,
      },
    }));
  };

  // LGS Canlı Net ve Puan Hesabı (3 Yanlış 1 Doğruyu Götürür)
  const lgsSozelComputed = useMemo(() => {
    return lgsSozel.map((s) => {
      const sc = getSubjectScore(s.subject);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'lgs');
      return { subject: s.subject, correct: c, wrong: w, empty: e, net };
    });
  }, [lgsSozel, getSubjectScore]);

  const lgsSayisalComputed = useMemo(() => {
    return lgsSayisal.map((s) => {
      const sc = getSubjectScore(s.subject);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'lgs');
      return { subject: s.subject, correct: c, wrong: w, empty: e, net };
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
      const sc = getSubjectScore(s.subject);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'tyt');
      return { subject: s.subject, correct: c, wrong: w, empty: e, net };
    });
  }, [tytSubs, getSubjectScore]);

  const aytComputed = useMemo(() => {
    return aytSubs.map((s) => {
      const sc = getSubjectScore(s.subject);
      const c = Number(sc.correct) || 0;
      const w = Number(sc.wrong) || 0;
      const e = Number(sc.empty) || 0;
      const net = calculateNet(c, w, 'ayt');
      return { subject: s.subject, correct: c, wrong: w, empty: e, net };
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
      if (modalTrack === 'lgs') {
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
                  Yeni Deneme Kaydı
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  {modalTrack === 'lgs'
                    ? 'LGS: Sözel + Sayısal (3 Yanlış 1 Doğru)'
                    : 'YKS: TYT + AYT (4 Yanlış 1 Doğru)'}
                </Txt>
              </View>
              <PressScale onPress={onClose} scaleTo={0.9}>
                <View style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Palette.textDim} />
                </View>
              </PressScale>
            </View>

            {/* Sınav Modu Seçici */}
            <View style={styles.typeSelectorRow}>
              <PressScale onPress={() => setModalTrack('lgs')} style={styles.flex}>
                <View style={[styles.typePill, modalTrack === 'lgs' && styles.typePillActive]}>
                  <Txt
                    variant="smallStrong"
                    color={modalTrack === 'lgs' ? OnColor : Palette.textDim}
                    center
                  >
                    LGS (8. Sınıf)
                  </Txt>
                </View>
              </PressScale>

              <PressScale onPress={() => setModalTrack('yks')} style={styles.flex}>
                <View style={[styles.typePill, modalTrack === 'yks' && styles.typePillActive]}>
                  <Txt
                    variant="smallStrong"
                    color={modalTrack === 'yks' ? OnColor : Palette.textDim}
                    center
                  >
                    YKS (TYT - AYT)
                  </Txt>
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
                  placeholder={modalTrack === 'lgs' ? 'Örn: Özdebir LGS-3, Mozaik Türkiye Geneli' : 'Örn: 3D TYT-2, Bilgi Sarmal AYT'}
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
              {modalTrack === 'yks' && (
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
              {modalTrack === 'lgs' ? (
                <View style={styles.liveSummaryBox}>
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      SÖZEL (50 S / 75 dk)
                    </Txt>
                    <Txt variant="bodyStrong" color={Accent}>
                      {lgsSozelNet} Net
                    </Txt>
                  </View>
                  <View style={styles.liveSummaryCol}>
                    <Txt variant="tiny" color={Palette.textDim}>
                      SAYISAL (40 S / 80 dk)
                    </Txt>
                    <Txt variant="bodyStrong" color={Accent}>
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
              {modalTrack === 'lgs' ? (
                <View style={styles.subjectsInputList}>
                  {/* LGS Sözel Oturum */}
                  <View style={styles.sessionHeaderRow}>
                    <Txt variant="smallStrong" color={Accent}>
                      1. Oturum: Sözel Bölüm (75 dk · 50 Soru)
                    </Txt>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      Türkçe, İnkılap, Din, İngilizce
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
                      Net (3Y=1D)
                    </Txt>
                  </View>

                  {lgsSozelComputed.map((sub) => (
                    <SubjectInputRow
                      key={sub.subject}
                      subject={sub.subject}
                      correct={getSubjectScore(sub.subject).correct}
                      wrong={getSubjectScore(sub.subject).wrong}
                      empty={getSubjectScore(sub.subject).empty}
                      net={sub.net}
                      onChange={handleScoreChange}
                    />
                  ))}

                  {/* LGS Sayısal Oturum */}
                  <View style={[styles.sessionHeaderRow, { marginTop: Space.md }]}>
                    <Txt variant="smallStrong" color={Accent}>
                      2. Oturum: Sayısal Bölüm (80 dk · 40 Soru)
                    </Txt>
                    <Txt variant="tiny" color={Palette.textFaint}>
                      Matematik, Fen Bilimleri
                    </Txt>
                  </View>
                  {lgsSayisalComputed.map((sub) => (
                    <SubjectInputRow
                      key={sub.subject}
                      subject={sub.subject}
                      correct={getSubjectScore(sub.subject).correct}
                      wrong={getSubjectScore(sub.subject).wrong}
                      empty={getSubjectScore(sub.subject).empty}
                      net={sub.net}
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
                        <Txt variant="tiny" color={Palette.textFaint}>
                          4 Yanlış 1 Doğruyu Götürür
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
                          Net (4Y=1D)
                        </Txt>
                      </View>

                      {tytComputed.map((sub) => (
                        <SubjectInputRow
                          key={sub.subject}
                          subject={sub.subject}
                          correct={getSubjectScore(sub.subject).correct}
                          wrong={getSubjectScore(sub.subject).wrong}
                          empty={getSubjectScore(sub.subject).empty}
                          net={sub.net}
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
                        <Txt variant="tiny" color={Palette.textFaint}>
                          4 Yanlış 1 Doğruyu Götürür
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
                          Net (4Y=1D)
                        </Txt>
                      </View>

                      {aytComputed.map((sub) => (
                        <SubjectInputRow
                          key={sub.subject}
                          subject={sub.subject}
                          correct={getSubjectScore(sub.subject).correct}
                          wrong={getSubjectScore(sub.subject).wrong}
                          empty={getSubjectScore(sub.subject).empty}
                          net={sub.net}
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
  correct,
  wrong,
  empty,
  net,
  onChange,
}: {
  subject: string;
  correct: string;
  wrong: string;
  empty: string;
  net: number;
  onChange: (subject: string, field: 'correct' | 'wrong' | 'empty', val: string) => void;
}) {
  return (
    <View style={styles.subjectInputRow}>
      <Txt variant="smallStrong" color={Palette.text} style={{ flex: 1 }}>
        {subject}
      </Txt>
      <TextInput
        style={styles.scoreInput}
        keyboardType="number-pad"
        value={correct}
        onChangeText={(val) => onChange(subject, 'correct', val)}
        selectTextOnFocus
      />
      <TextInput
        style={styles.scoreInput}
        keyboardType="number-pad"
        value={wrong}
        onChangeText={(val) => onChange(subject, 'wrong', val)}
        selectTextOnFocus
      />
      <TextInput
        style={styles.scoreInput}
        keyboardType="number-pad"
        value={empty}
        onChangeText={(val) => onChange(subject, 'empty', val)}
        selectTextOnFocus
      />
      <View style={styles.netBox}>
        <Txt variant="smallStrong" color={Accent}>
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
  tabSwitcherRow: {
    flexDirection: 'row',
    gap: Space.xs,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
  },
  examTrackTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTrackTabActive: {
    backgroundColor: Accent,
    borderColor: Accent,
  },
  scrollContent: {
    paddingHorizontal: Space.lg,
    gap: Space.lg,
  },
  rulesCard: {
    gap: 6,
    backgroundColor: Palette.surface,
    borderColor: 'rgba(58, 57, 103, 0.1)',
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rulesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
    marginTop: 2,
  },
  ruleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
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
