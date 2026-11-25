import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/ad-banner';
import { IconButton, NeonButton, PressScale } from '@/components/button';
import { CanvasView } from '@/components/canvas-view';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { ScreenBackground } from '@/components/screen';
import { Card, EmptyState, IconBubble, Pill, Txt } from '@/components/ui';
import { showInterstitialIfEligible } from '@/lib/ads';
import { generateQuestionHint, getCachedQuestionHint } from '@/lib/ai-question-hint';
import { getQuestions, resolveQuestion } from '@/lib/api';
import { apiMediaUrl } from '@/lib/api-client';
import { relativeTime } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import { persistCapturedPhoto } from '@/lib/photo-store';
import { useStudent } from '@/lib/session';
import { useSubscription } from '@/lib/subscription';
import type { Question, QuestionStatus } from '@/lib/types';
import { syncMonthlyQuestionsFromList } from '@/lib/usage-limits';
import { Accent, Border, DetailAccent, OnColor, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

const STATUS_META: Record<QuestionStatus | string, { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  pending: { label: 'Hocada bekliyor', color: Palette.gold, icon: 'hourglass' },
  in_lesson: { label: 'Derste çözülecek', color: Palette.blue, icon: 'school' },
  answered: { label: 'Cevaplandı', color: Palette.green, icon: 'checkmark-circle' },
};

const DEFAULT_STATUS_META = {
  label: 'İnceleniyor',
  color: Palette.gold,
  icon: 'hourglass' as React.ComponentProps<typeof Ionicons>['name'],
};

export default function Questions() {
  const { isPro } = useSubscription();
  // Soru gonderildikten sonra buraya mode=list ile donulur.
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'camera' | 'list'>(initialMode === 'list' ? 'list' : 'camera');

  useEffect(() => {
    if (mode === 'list') {
      showInterstitialIfEligible('questions_open', isPro).catch(() => {});
    }
  }, [mode, isPro]);

  return (
    <ScreenBackground tint={Accent}>
      <Header mode={mode} onChange={setMode} />
      {mode === 'camera' ? <CameraPane /> : <QuestionList />}
    </ScreenBackground>
  );
}

function Header({ mode, onChange }: { mode: 'camera' | 'list'; onChange: (m: 'camera' | 'list') => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
      <View style={styles.titleRow}>
        <MenuButton />
        <Txt variant="title" center style={styles.flex}>
          Şipşak Soru
        </Txt>
        <NotificationBell />
      </View>
      <View style={styles.segment}>
        {(['camera', 'list'] as const).map((m) => {
          const active = m === mode;
          return (
            <PressScale key={m} onPress={() => onChange(m)} style={styles.flex} scaleTo={0.97}>
              <View style={[styles.segmentItem, active && styles.segmentItemActive]}>
                <Ionicons
                  name={m === 'camera' ? 'camera' : 'albums'}
                  size={15}
                  color={active ? Palette.text : Palette.textDim}
                />
                <Txt variant="smallStrong" color={active ? Palette.text : Palette.textDim}>
                  {m === 'camera' ? 'Çek' : 'Sorularım'}
                </Txt>
              </View>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
}

function CameraPane() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showMessage, showError } = useErrorDialog();

  /** Ayni anda tek bir kamera onizlemesi acik olabilir; sekmeden
   *  cikildiginda kamerayi sokup takiyoruz. */
  const [mounted, setMounted] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setMounted(true);
      return () => {
        setMounted(false);
        setReady(false);
      };
    }, [])
  );

  const cameraRef = useRef<CameraView>(null);

  const shoot = useCallback(async () => {
    // `ready` kontrolu sart: onizleme hazir degilken ya da duraklatilmisken
    // takePictureAsync Android'de dogrudan firlatiyor (SDK 57 dokumani).
    if (!ready || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
      if (!photo?.uri) {
        showMessage('Fotoğraf alınamadı', 'Kamera fotoğrafı vermedi. Tekrar dene.');
        return;
      }

      // Onbellekteki gecici dosyayi kalici klasore tasi; cizim ekranina
      // gecerken silinirse sunucuya bos dosya gidiyordu.
      const uri = await persistCapturedPhoto(photo.uri);
      router.push({ pathname: '/annotate', params: { uri } });
    } catch (err) {
      // Yakalanmayan reddedilmis soz uygulamayi sessizce kapatir.
      showError(err, { title: 'Fotoğraf çekilemedi', code: 'CAMERA_CAPTURE' });
    } finally {
      setBusy(false);
    }
  }, [ready, busy, router, showMessage, showError]);

  if (!permission) {
    return <View style={styles.pane} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <IconBubble name="camera" color={DetailAccent} size={72} />
        <Txt variant="section" center>
          Kamera izni gerekiyor
        </Txt>
        <Txt variant="small" color={Palette.textDim} center>
          Takıldığın soruyu fotoğraflayıp üzerine çizebilmen için kameraya erişmemiz lazım.
        </Txt>
        <NeonButton label="İzin ver" icon="lock-open" color={Accent} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.pane}>
      <View style={styles.viewfinder}>
        {mounted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            enableTorch={torch}
            onCameraReady={() => setReady(true)}
          />
        ) : null}

        {/* Vizör köşeleri */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      <Txt variant="small" color={Palette.textDim} center style={styles.hint}>
        Soruyu çerçeveye sığdır, sonra üzerine çizip hocaya yolla.
      </Txt>

      <View style={[styles.shutterRow, { paddingBottom: insets.bottom + 100 }]}>
        <IconButton
          icon={torch ? 'flashlight' : 'flashlight-outline'}
          color={torch ? Palette.gold : Palette.textDim}
          size={48}
          onPress={() => setTorch((t) => !t)}
        />

        <PressScale onPress={shoot} disabled={!ready || busy} scaleTo={0.9}>
          <View style={styles.shutterOuter}>
            <View style={styles.shutterInner} />
          </View>
        </PressScale>

        <IconButton
          icon="camera-reverse"
          size={48}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
        />
      </View>
    </View>
  );
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: 991,
    studentId: 1,
    subject: 'Matematik',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    strokes: { w: 1000, h: 1000, items: [] },
    note: 'Parantez içi işlem önceliğini nasıl belirlemeliyim?',
    status: 'answered',
    teacherReply: 'Önce parantez içi işlem yapılır: 24 : (3 + 5) = 24 : 8 = 3. Ardından çarpma işlemi tamamlanır.',
    resolvedByStudent: true,
    createdAt: new Date().toISOString(),
    answeredAt: new Date().toISOString(),
  },
  {
    id: 992,
    studentId: 1,
    subject: 'Fen Bilimleri',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600',
    strokes: { w: 1000, h: 1000, items: [] },
    note: 'Pürüzlü yüzeylerde sürtünme kuvveti hareketi nasıl etkiler?',
    status: 'answered',
    teacherReply: 'Pürüzlü yüzeylerde sürtünme kuvveti artar ve cismin hareketini yavaşlatır.',
    resolvedByStudent: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    answeredAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

function QuestionList() {
  useStudent();
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Question[]>(() => (demo === '1' ? DEMO_QUESTIONS : []));
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [activeSolution, setActiveSolution] = useState<{
    imageUri?: string | null;
    replyText?: string | null;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showError } = useErrorDialog();

  useFocusEffect(
    useCallback(() => {
      if (demo === '1') return;
      getQuestions()
        .then((res) => {
          const list = Array.isArray(res) ? res : [];
          setQuestions(list);
          void syncMonthlyQuestionsFromList(list);
        })
        .catch((err) => showError(err, { title: 'Sorular yüklenemedi', code: 'QUESTIONS_LOAD' }));
    }, [demo, showError])
  );

  const handleResolved = useCallback((updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    return Array.from(set);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (filterSubject === 'all') return questions;
    return questions.filter((q) => q.subject === filterSubject);
  }, [questions, filterSubject]);

  if (questions.length === 0) {
    return (
      <EmptyState
        icon="camera-outline"
        title="Henüz soru göndermedin"
        subtitle="Takıldığın soruyu çek, üstüne çiz, hocaya yolla. Her soru için +10 XP."
        color={DetailAccent}
      />
    );
  }

  return (
    <>
      {availableSubjects.length > 0 ? (
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            <PressScale onPress={() => setFilterSubject('all')} scaleTo={0.94}>
              <View style={[styles.filterChip, filterSubject === 'all' && styles.filterChipActive]}>
                <Txt variant="tiny" color={filterSubject === 'all' ? OnColor : Palette.textDim}>
                  Tümü ({questions.length})
                </Txt>
              </View>
            </PressScale>
            {availableSubjects.map((s: string) => {
              const count = questions.filter((q: Question) => q.subject === s).length;
              const active = filterSubject === s;
              return (
                <PressScale key={s} onPress={() => setFilterSubject(s)} scaleTo={0.94}>
                  <View style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Txt variant="tiny" color={active ? OnColor : Palette.textDim}>
                      {s} ({count})
                    </Txt>
                  </View>
                </PressScale>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredQuestions.map((q: Question) => (
          <QuestionCard
            key={q.id}
            question={q}
            onResolved={handleResolved}
            onViewImage={(uri) => setPreviewImage(uri)}
            onViewSolution={(data) => setActiveSolution(data)}
          />
        ))}
        <AdBanner style={{ marginTop: Space.md, marginBottom: Space.sm }} />
      </ScrollView>

      {/* Koçun Çözümü Modalı (Görsel ve varsa açıklama) */}
      <Modal
        visible={Boolean(activeSolution)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveSolution(null)}
      >
        <Pressable style={styles.fullImageBackdrop} onPress={() => setActiveSolution(null)}>
          <View style={styles.solutionModalHeader}>
            <View style={styles.solutionModalHeaderTitle}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Txt variant="section" color="#FFFFFF">
                Koçunun Çözümü
              </Txt>
            </View>
            <Pressable
              style={styles.fullImageClose}
              onPress={() => setActiveSolution(null)}
              hitSlop={15}
            >
              <Ionicons name="close-circle" size={38} color="#FFFFFF" />
            </Pressable>
          </View>

          {activeSolution?.imageUri ? (
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.fullImageContainer}>
              <Image
                source={{ uri: apiMediaUrl(activeSolution.imageUri) }}
                style={styles.fullImage}
                contentFit="contain"
              />
            </Pressable>
          ) : null}

          {activeSolution?.replyText ? (
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalReplyBox}>
              <Ionicons name="chatbubble-ellipses" size={16} color={Palette.green} />
              <Txt variant="small" color={Palette.text} style={styles.flex}>
                {activeSolution.replyText}
              </Txt>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      {/* Soru Fotoğrafı Önizleme Modalı */}
      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable style={styles.fullImageBackdrop} onPress={() => setPreviewImage(null)}>
          <Pressable style={styles.fullImageClose} onPress={() => setPreviewImage(null)} hitSlop={15}>
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </Pressable>
          {previewImage ? (
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.fullImageContainer}>
              <Image
                source={{ uri: apiMediaUrl(previewImage) }}
                style={styles.fullImage}
                contentFit="contain"
              />
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

function QuestionCard({
  question,
  onResolved,
  onViewImage,
  onViewSolution,
}: {
  question: Question;
  onResolved: (q: Question) => void;
  onViewImage: (uri: string) => void;
  onViewSolution: (data: { imageUri?: string | null; replyText?: string | null }) => void;
}) {
  const student = useStudent();
  const { isPro } = useSubscription();
  const meta = (question.status && STATUS_META[question.status]) || DEFAULT_STATUS_META;
  const [busy, setBusy] = useState(false);
  const [replyImgLoading, setReplyImgLoading] = useState(true);
  const [replyImgFailed, setReplyImgFailed] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const { showError } = useErrorDialog();

  useEffect(() => {
    getCachedQuestionHint(question.id).then((cached) => {
      if (cached) {
        setAiHint(cached);
        setHintVisible(true);
      }
    });
  }, [question.id]);

  const handleFetchHint = useCallback(async (forceRefresh = false) => {
    const isErrorOrInvalid =
      Boolean(aiHint) &&
      (aiHint!.includes('duraklatıldı') ||
        aiHint!.includes('kota') ||
        aiHint!.includes('tespit edilemedi') ||
        aiHint!.includes('okunabilir bir soru'));
    if (aiHint && !forceRefresh && !isErrorOrInvalid) {
      setHintVisible((v) => !v);
      return;
    }
    setHintLoading(true);
    try {
      const hint = await generateQuestionHint({
        questionId: question.id,
        imageUrl: question.imageUrl,
        note: question.note ?? undefined,
        subject: question.subject ?? 'Matematik',
        grade: student.grade ?? undefined,
        forceRefresh: forceRefresh || isErrorOrInvalid,
        isPro,
      });
      setAiHint(hint);
      setHintVisible(true);
    } catch {
      // sessizce devam
    } finally {
      setHintLoading(false);
    }
  }, [aiHint, isPro, question.id, question.imageUrl, question.note, question.subject, student.grade]);

  let rawReply = (question.teacherReply || '').trim();
  let embeddedSolutionImage: string | null = null;
  if (rawReply.includes('[SOLUTION_IMAGE]:')) {
    const parts = rawReply.split('[SOLUTION_IMAGE]:');
    rawReply = parts[0].trim();
    embeddedSolutionImage = parts[1]?.trim() || null;
  }
  if (!embeddedSolutionImage && (rawReply.startsWith('data:image/') || rawReply.startsWith('http://') || rawReply.startsWith('https://'))) {
    embeddedSolutionImage = rawReply;
    rawReply = '';
  }

  let rawSolutionUri =
    question.teacherReplyImage ||
    question.replyImage ||
    question.solutionImage ||
    question.solutionImageUrl ||
    (question as any).teacher_reply_image ||
    (question as any).reply_image ||
    (question as any).solution_image ||
    embeddedSolutionImage;

  // MinIO dahili adresi ise (localhost:9000 vb.), istemcinin erisebildigi proxy rotasina bagla
  if (
    rawSolutionUri &&
    /localhost|127\.0\.0\.1|:9000|\/kocum-benim\//i.test(rawSolutionUri)
  ) {
    const match = (question.imageUrl || '').match(/token=([^&]+)/);
    const tokenQuery = match ? `?token=${match[1]}` : '';
    rawSolutionUri = `/questions/${question.id}/reply-image${tokenQuery}`;
  }

  const solutionImageUri =
    rawSolutionUri ||
    (question.status === 'answered' && question.id < 900 ? `/questions/${question.id}/reply-image` : null);

  const cleanReplyText =
    rawReply &&
    rawReply !== 'Çözüm görseli eklendi.' &&
    rawReply !== 'Çözüm görseli eklendi' &&
    rawReply !== 'Çözüldü.'
      ? rawReply
      : null;

  const handleOpenSolution = useCallback(() => {
    onViewSolution({
      imageUri: solutionImageUri,
      replyText: cleanReplyText,
    });
  }, [onViewSolution, solutionImageUri, cleanReplyText]);

  const markResolved = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await resolveQuestion(question.id);
      onResolved(updated);
    } catch (err) {
      showError(err, { title: 'Soru güncellenemedi', code: 'QUESTION_RESOLVE' });
    } finally {
      setBusy(false);
    }
  }, [question.id, onResolved, showError]);

  return (
    <Card accent={meta.color} style={styles.questionCard}>
      <View style={styles.questionHead}>
        {question.subject ? (
          <Pill label={question.subject} color={Palette.purple} icon="book-outline" />
        ) : null}
        <Pill label={meta.label} color={meta.color} icon={meta.icon} />
        {question.resolvedByStudent ? <Pill label="Kendim Çözdüm" color={Palette.green} icon="checkmark-circle" /> : null}
      </View>

      {question.imageUrl ? (
        <PressScale onPress={() => onViewImage(question.imageUrl)}>
          <View style={styles.thumbWrapper}>
            <CanvasView imageUri={question.imageUrl} canvas={question.strokes} style={styles.thumb} />
            <View style={styles.zoomBadge}>
              <Ionicons name="scan-outline" size={13} color="#FFFFFF" />
              <Txt variant="tiny" color="#FFFFFF">
                Büyüt
              </Txt>
            </View>
          </View>
        </PressScale>
      ) : question.status === 'answered' ? (
        <View style={styles.expiredNotice}>
          <Ionicons name="time-outline" size={14} color={Palette.textDim} />
          <Txt variant="tiny" color={Palette.textDim}>
            Cevaplanan soru görseli 2 günlük süre dolduğu için temizlendi.
          </Txt>
        </View>
      ) : null}

      {question.note ? <Txt variant="small">{question.note}</Txt> : null}

      {/* Koçum'dan İpucu Al (Adım Adım Yol Gösterici) */}
      <View style={styles.aiHintContainer}>
        <PressScale onPress={handleFetchHint} scaleTo={0.97}>
          <View style={[styles.aiHintButton, aiHint && styles.aiHintButtonActive]}>
            <View style={styles.aiHintBtnLeft}>
              <Ionicons name="sparkles" size={15} color={DetailAccent} />
              <Txt variant="smallStrong" color={Palette.text}>
                {hintLoading
                  ? "Koçum İpucu Hazırlıyor..."
                  : aiHint
                    ? (hintVisible ? "İpucunu Gizle" : "Koçum'un İpucunu Gör")
                    : "Koçum'dan İpucu Al"}
              </Txt>
            </View>
            {hintLoading ? (
              <ActivityIndicator size="small" color={DetailAccent} />
            ) : (
              <Ionicons
                name={hintVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={Palette.textDim}
              />
            )}
          </View>
        </PressScale>

        {hintVisible && aiHint ? (() => {
          const isLimitReached =
            aiHint.includes('duraklatıldı') ||
            aiHint.includes('kota') ||
            aiHint.includes('hakkın');
          const isInvalidQuestion =
            !isLimitReached &&
            (aiHint.includes('tespit edilemedi') ||
              aiHint.includes('okunabilir bir soru') ||
              aiHint.includes('net bir fotoğraf'));

          const boxStyle = isLimitReached
            ? styles.aiHintBoxInfo
            : isInvalidQuestion
              ? styles.aiHintBoxWarning
              : styles.aiHintBox;

          const titleColor = isLimitReached
            ? Palette.blue
            : isInvalidQuestion
              ? Palette.gold
              : DetailAccent;

          const titleText = isLimitReached
            ? 'SERVİS DURUMU'
            : isInvalidQuestion
              ? 'SORU TESPİT EDİLEMEDİ'
              : "KOÇUM'UN İPUCU";

          return (
            <View style={[styles.aiHintBox, boxStyle]}>
              <View style={styles.aiHintHead}>
                {isLimitReached ? (
                  <Ionicons name="time-outline" size={14} color={Palette.blue} />
                ) : isInvalidQuestion ? (
                  <Ionicons name="alert-circle" size={14} color={Palette.gold} />
                ) : (
                  <View style={styles.aiHintDot} />
                )}
                <Txt variant="tiny" color={titleColor} style={styles.aiHintTitle}>
                  {titleText}
                </Txt>
                {isInvalidQuestion || isLimitReached ? (
                  <PressScale onPress={() => handleFetchHint(true)} style={styles.aiHintRetryBtn}>
                    <Ionicons name="refresh" size={12} color={Palette.textDim} />
                    <Txt variant="tiny" color={Palette.textDim}>
                      Yeniden Dene
                    </Txt>
                  </PressScale>
                ) : null}
              </View>
              <Txt variant="small" color={Palette.text} style={styles.aiHintText}>
                {aiHint}
              </Txt>
            </View>
          );
        })() : null}
      </View>

      {/* Soru Cevaplandıysa Her Zaman Belirgin "Çözümü Gör" Butonu ve Çözüm Bölümü */}
      {question.status === 'answered' && (
        <View style={styles.solutionContainer}>
          <PressScale onPress={handleOpenSolution}>
            <View style={styles.viewSolutionButton}>
              <View style={styles.viewSolutionLeft}>
                <Ionicons name="sparkles" size={17} color="#FFFFFF" />
                <Txt variant="smallStrong" color="#FFFFFF">
                  Çözümü Gör
                </Txt>
              </View>
              <View style={styles.viewSolutionRight}>
                <Txt variant="tiny" color="rgba(255, 255, 255, 0.9)">
                  Görseli İncele
                </Txt>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </PressScale>

          {/* Kart içinde doğrudan çözüm görseli önizlemesi */}
          {solutionImageUri ? (
            <PressScale onPress={handleOpenSolution}>
              <View style={styles.replyImageWrapper}>
                <Image
                  source={{ uri: apiMediaUrl(solutionImageUri) }}
                  style={styles.replyImage}
                  contentFit="contain"
                  onLoadStart={() => {
                    setReplyImgLoading(true);
                    setReplyImgFailed(false);
                  }}
                  onLoad={() => {
                    setReplyImgLoading(false);
                    setReplyImgFailed(false);
                  }}
                  onError={() => {
                    setReplyImgLoading(false);
                    setReplyImgFailed(true);
                  }}
                />
                {replyImgLoading && !replyImgFailed ? (
                  <View style={styles.replyImageOverlayCenter}>
                    <ActivityIndicator size="small" color={Palette.green} />
                  </View>
                ) : null}
                {replyImgFailed ? (
                  <View style={styles.replyImageOverlayCenter}>
                    <Ionicons name="alert-circle-outline" size={20} color={Palette.textDim} />
                    <Txt variant="tiny" color={Palette.textDim}>
                      Görsel yüklenemedi
                    </Txt>
                  </View>
                ) : null}
                <View style={styles.zoomBadge}>
                  <Ionicons name="scan-outline" size={13} color="#FFFFFF" />
                  <Txt variant="tiny" color="#FFFFFF">
                    Büyüt
                  </Txt>
                </View>
              </View>
            </PressScale>
          ) : null}

          {/* Koçun yazılı yanıtı varsa kart içinde göster */}
          {cleanReplyText ? (
            <View style={styles.reply}>
              <Ionicons name="chatbubble-ellipses" size={15} color={Palette.green} />
              <Txt variant="small" color={Palette.text} style={styles.flex}>
                {cleanReplyText}
              </Txt>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.questionFoot}>
        <Txt variant="tiny" color={Palette.textFaint}>
          {relativeTime(question.createdAt)}
        </Txt>
        {!question.resolvedByStudent && (
          <PressScale onPress={markResolved} disabled={busy}>
            <View style={styles.resolveButton}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Palette.green} />
              <Txt variant="tiny" color={Palette.green}>
                {busy ? 'İşaretleniyor…' : 'Kendim Çözdüm'}
              </Txt>
            </View>
          </PressScale>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
    gap: Space.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  segment: {
    flexDirection: 'row',
    gap: Space.xs,
    padding: Space.xs,
    backgroundColor: Palette.surfaceHi,
    // 38 (oge) + 8 (dolgu) = 46
    borderRadius: pillRadius(46),
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: pillRadius(38),
  },
  segmentItemActive: {
    backgroundColor: DetailAccent,
  },
  pane: {
    flex: 1,
    paddingHorizontal: Space.lg,
  },
  permission: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    paddingHorizontal: Space.xl,
    paddingBottom: 100,
  },
  viewfinder: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#0D0B18',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: OnColor,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  hint: {
    paddingVertical: Space.md,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: DetailAccent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DetailAccent,
  },
  filterWrap: {
    paddingHorizontal: Space.lg,
    marginBottom: Space.sm,
  },
  filterChips: {
    gap: Space.xs,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: Space.md,
    paddingVertical: 6,
    borderRadius: pillRadius(28),
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  filterChipActive: {
    backgroundColor: Accent,
    borderColor: Accent,
  },
  listContent: {
    paddingHorizontal: Space.lg,
    gap: Space.md,
  },
  questionCard: {
    gap: Space.md,
  },
  questionHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Space.sm,
  },
  questionFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Space.sm,
    // 15 (tiny satir yuksekligi) + 8 (dikey dolgu) = 23
    borderRadius: pillRadius(23),
    backgroundColor: Palette.greenSoft,
  },
  thumb: {
    height: 180,
  },
  thumbWrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    paddingVertical: Space.xs,
    paddingHorizontal: Space.sm,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(58, 57, 103, 0.08)',
  },
  reply: {
    flexDirection: 'row',
    gap: Space.sm,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
  },
  solutionContainer: {
    gap: Space.xs,
    padding: Space.sm,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  viewSolutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space.sm + 4,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.md,
    backgroundColor: Palette.green,
  },
  viewSolutionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  viewSolutionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyImageWrapper: {
    height: 180,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceHi,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyImage: {
    width: '100%',
    height: '100%',
  },
  replyImageOverlayCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
    backgroundColor: Palette.surfaceHi,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: Space.xs,
    right: Space.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: pillRadius(20),
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  fullImageBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space.md,
  },
  fullImageClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: Space.xs,
  },
  solutionModalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingTop: 50,
    paddingBottom: Space.md,
  },
  solutionModalHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  modalReplyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    width: '90%',
    marginTop: Space.md,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
  fullImageContainer: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  aiHintContainer: {
    gap: Space.xs,
  },
  aiHintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  aiHintButtonActive: {
    borderColor: 'rgba(251, 174, 117, 0.4)',
  },
  aiHintBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  aiHintBox: {
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(251, 174, 117, 0.35)',
    gap: 4,
  },
  aiHintBoxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  aiHintBoxInfo: {
    backgroundColor: '#F0F9FF',
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  aiHintRetryBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  aiHintHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiHintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DetailAccent,
  },
  aiHintTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aiHintText: {
    lineHeight: 20,
  },
});
