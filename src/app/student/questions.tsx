import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, NeonButton, PressScale } from '@/components/button';
import { CanvasView } from '@/components/canvas-view';
import { ScreenBackground } from '@/components/screen';
import { Card, EmptyState, IconBubble, Pill, Txt } from '@/components/ui';
import { getQuestions, resolveQuestion } from '@/lib/api';
import { relativeTime } from '@/lib/date';
import { useHamburgerMenu } from '@/lib/hamburger-menu-context';
import { useStudent } from '@/lib/session';
import type { Question, QuestionStatus } from '@/lib/types';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

const STATUS_META: Record<QuestionStatus, { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  pending: { label: 'Hocada bekliyor', color: Palette.gold, icon: 'hourglass' },
  in_lesson: { label: 'Derste çözülecek', color: Palette.blue, icon: 'school' },
  answered: { label: 'Cevaplandı', color: Palette.green, icon: 'checkmark-circle' },
};

export default function Questions() {
  // Soru gonderildikten sonra buraya mode=list ile donulur.
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'camera' | 'list'>(initialMode === 'list' ? 'list' : 'camera');

  return (
    <ScreenBackground tint={Palette.orange}>
      <Header mode={mode} onChange={setMode} />
      {mode === 'camera' ? <CameraPane /> : <QuestionList />}
    </ScreenBackground>
  );
}

function Header({ mode, onChange }: { mode: 'camera' | 'list'; onChange: (m: 'camera' | 'list') => void }) {
  const insets = useSafeAreaInsets();
  const { open: openMenu } = useHamburgerMenu();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
      <View style={styles.titleRow}>
        <Txt variant="title">Kurtar Beni</Txt>
        <IconButton icon="menu" onPress={openMenu} />
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
                  color={active ? OnColor : Palette.textDim}
                />
                <Txt variant="smallStrong" color={active ? OnColor : Palette.textDim}>
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

/* ---------------------------------- kamera --------------------------------- */

function CameraPane() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

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
    if (!ready || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) {
        router.push({ pathname: '/annotate', params: { uri: photo.uri } });
      }
    } finally {
      setBusy(false);
    }
  }, [ready, busy, router]);

  if (!permission) {
    return <View style={styles.pane} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <IconBubble name="camera" color={Palette.orange} size={72} />
        <Txt variant="section" center>
          Kamera izni gerekiyor
        </Txt>
        <Txt variant="small" color={Palette.textDim} center>
          Takıldığın soruyu fotoğraflayıp üzerine çizebilmen için kameraya erişmemiz lazım.
        </Txt>
        <NeonButton label="İzin ver" icon="lock-open" color={Palette.orange} onPress={requestPermission} />
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

/* -------------------------------- soru listesi ------------------------------ */

function QuestionList() {
  useStudent();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Question[]>([]);

  useFocusEffect(
    useCallback(() => {
      getQuestions()
        .then(setQuestions)
        .catch(() => {
          // Aglama hatasi ekrani bozmasin; liste bos gorunur.
        });
    }, [])
  );

  const handleResolved = useCallback((updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  if (questions.length === 0) {
    return (
      <EmptyState
        icon="camera-outline"
        title="Henüz soru göndermedin"
        subtitle="Takıldığın soruyu çek, üstüne çiz, hocaya yolla. Her soru için +10 XP."
        color={Palette.orange}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} onResolved={handleResolved} />
      ))}
    </ScrollView>
  );
}

function QuestionCard({ question, onResolved }: { question: Question; onResolved: (q: Question) => void }) {
  const meta = STATUS_META[question.status];
  const [busy, setBusy] = useState(false);

  const markResolved = useCallback(async () => {
    setBusy(true);
    try {
      const updated = await resolveQuestion(question.id);
      onResolved(updated);
    } catch {
      // Aglama hatasi karti bozmasin; kullanici tekrar deneyebilir.
    } finally {
      setBusy(false);
    }
  }, [question.id, onResolved]);

  return (
    <Card accent={meta.color} style={styles.questionCard}>
      <View style={styles.questionHead}>
        <Pill label={meta.label} color={meta.color} icon={meta.icon} />
        {question.resolvedByStudent ? <Pill label="Kendim Çözdüm" color={Palette.green} icon="checkmark-circle" /> : null}
      </View>

      {question.imageUrl ? (
        <CanvasView imageUri={question.imageUrl} canvas={question.strokes} style={styles.thumb} />
      ) : null}

      {question.note ? <Txt variant="small">{question.note}</Txt> : null}

      {question.teacherReply ? (
        <View style={styles.reply}>
          <Ionicons name="chatbubble-ellipses" size={15} color={Palette.green} />
          <Txt variant="small" color={Palette.text} style={styles.flex}>
            {question.teacherReply}
          </Txt>
        </View>
      ) : null}

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
  },
  segment: {
    flexDirection: 'row',
    gap: Space.xs,
    padding: Space.xs,
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.pill,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: Radius.pill,
  },
  segmentItemActive: {
    backgroundColor: Palette.orange,
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
    borderColor: Palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.orange,
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
    borderRadius: Radius.pill,
    backgroundColor: Palette.greenSoft,
  },
  thumb: {
    height: 180,
  },
  reply: {
    flexDirection: 'row',
    gap: Space.sm,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
  },
});
