import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { createQuestion } from '@/db/repo';
import type { CanvasItem } from '@/db/types';
import { localImageUri, persistQuestionPhoto } from '@/lib/photo-store';
import { useSession, useStudent } from '@/lib/session';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

/** Kalem paleti — fotograf uzerinde okunakli kalsin diye doygun renkler. */
const PENS = ['#FF3B5C', '#2B7FFF', '#12C46A', '#FFB020', '#111827'];

type Tool = 'pen' | 'highlight' | 'text';

export default function Annotate() {
  const router = useRouter();
  const db = useSQLiteContext();
  const student = useStudent();
  const { refresh } = useSession();
  const insets = useSafeAreaInsets();

  const { uri = '' } = useLocalSearchParams<{ uri?: string }>();

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(PENS[0]);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  /** Dokunmalari alan kutunun olculeri. */
  const [box, setBox] = useState({ w: 1, h: 1 });
  const [photoAspect, setPhotoAspect] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  /** Metin araci: dokunulan noktaya not birakma penceresi. */
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; value: string } | null>(null);

  const strokeWidth = tool === 'highlight' ? 26 : 5;

  /**
   * Fotografin kutu icinde gercekten kapladigi dikdortgen ("contain"
   * yerlesimi). Cizimleri bu dikdortgenin uzayinda sakliyoruz: koordinatlar
   * boylece fotografa bagli kalir ve kucuk onizlemede kaymaz.
   */
  const frame = useMemo(() => {
    const aspect = photoAspect ?? box.w / box.h;
    const fitsWidth = box.w / box.h > aspect;
    const w = fitsWidth ? box.h * aspect : box.w;
    const h = fitsWidth ? box.h : box.w / aspect;
    return { w, h, x: (box.w - w) / 2, y: (box.h - h) / 2 };
  }, [box, photoAspect]);

  /**
   * Cizilmekte olan yol tek bir hareket boyunca yasar ve ref'te tutulur:
   * React Compiler memo'yu diledigi zaman yeniden hesaplayabildigi icin
   * kapanista tutulan yerel bir degisken cizginin ortasinda sifirlanabilirdi.
   * Ref erisimi render sirasinda yasak oldugundan hareket isleyicilerini
   * useCallback'e alip PanResponder'i onlardan kuruyoruz.
   */
  const pathRef = useRef('');

  const onGrant = useCallback(
    (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      pathRef.current = `M ${(locationX - frame.x).toFixed(1)} ${(locationY - frame.y).toFixed(1)}`;
      setCurrent(pathRef.current);
    },
    [frame.x, frame.y]
  );

  const onMove = useCallback(
    (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      pathRef.current += ` L ${(locationX - frame.x).toFixed(1)} ${(locationY - frame.y).toFixed(1)}`;
      setCurrent(pathRef.current);
    },
    [frame.x, frame.y]
  );

  const onRelease = useCallback(() => {
    const d = pathRef.current;
    pathRef.current = '';
    setCurrent(null);
    // Tek dokunus (cizgi olmayan) iz birakmasin.
    if (!d.includes('L')) return;

    const isHighlight = tool === 'highlight';
    setItems((prev) => [
      ...prev,
      { kind: 'stroke', d, color, width: isHighlight ? 26 : 5, highlight: isHighlight },
    ]);
  }, [tool, color]);

  // PanResponder.create isleyicileri yalnizca saklar, render sirasinda
  // cagirmaz; kural bunu bilemedigi icin ref iceren kapanislari riskli
  // sayiyor. Erisim gercekte yalnizca dokunma olaylarinda oluyor.
  const responder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => tool !== 'text',
        onMoveShouldSetPanResponder: () => tool !== 'text',
        onPanResponderGrant: onGrant,
        onPanResponderMove: onMove,
        onPanResponderRelease: onRelease,
      }),
    [tool, onGrant, onMove, onRelease]
  );

  const onCanvasPress = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (tool !== 'text') return;
      const { locationX, locationY } = e.nativeEvent;
      setTextDraft({ x: locationX - frame.x, y: locationY - frame.y, value: '' });
    },
    [tool, frame.x, frame.y]
  );

  const commitText = useCallback(() => {
    if (!textDraft) return;
    const value = textDraft.value.trim();
    if (value) {
      setItems((prev) => [
        ...prev,
        { kind: 'text', x: textDraft.x, y: textDraft.y, text: value, color },
      ]);
    }
    setTextDraft(null);
  }, [textDraft, color]);

  const undo = useCallback(() => setItems((prev) => prev.slice(0, -1)), []);
  const clear = useCallback(() => setItems([]), []);

  const send = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const storedUri = uri ? await persistQuestionPhoto(uri) : '';
      await createQuestion(db, {
        studentId: student.id,
        imageUri: storedUri,
        strokes: JSON.stringify({ w: frame.w, h: frame.h, items }),
        note: note.trim(),
      });
      await refresh();
      // Gonderdikten sonra kamera yerine listeye dus: ogrenci sorusunun
      // gittigini gorsun.
      router.replace({ pathname: '/student/questions', params: { mode: 'list' } });
    } finally {
      setSaving(false);
    }
  }, [saving, uri, db, student.id, frame.w, frame.h, items, note, refresh, router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Ust bar */}
      <View style={styles.topBar}>
        <IconButton icon="close" onPress={() => router.back()} />
        <Txt variant="section">Soruyu işaretle</Txt>
        <View style={styles.topActions}>
          <IconButton icon="arrow-undo" onPress={undo} disabled={items.length === 0} />
          <IconButton
            icon="trash"
            color={Palette.pink}
            onPress={clear}
            disabled={items.length === 0}
          />
        </View>
      </View>

      <View style={styles.stage}>
        {/* Kanvas */}
        <View
          style={styles.canvas}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setBox({ w: width, h: height });
          }}
          onStartShouldSetResponder={() => tool === 'text'}
          onResponderRelease={onCanvasPress}
          {...(tool === 'text' ? {} : responder.panHandlers)}
        >
          {uri ? (
            <Image
              source={{ uri: localImageUri(uri) }}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              onLoad={(e) => {
                const { width, height } = e.source ?? {};
                if (width && height) setPhotoAspect(width / height);
              }}
            />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={40} color={Palette.textFaint} />
              <Txt variant="small" color={Palette.textDim}>
                Fotoğraf yok
              </Txt>
            </View>
          )}

          <Svg
            style={{ position: 'absolute', left: frame.x, top: frame.y }}
            width={frame.w}
            height={frame.h}
            pointerEvents="none"
          >
            {items.map((item, i) =>
              item.kind === 'stroke' ? (
                <Path
                  key={i}
                  d={item.d}
                  stroke={item.color}
                  strokeWidth={item.width}
                  strokeOpacity={item.highlight ? 0.38 : 1}
                  strokeLinecap={item.highlight ? 'butt' : 'round'}
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : (
                <SvgText key={i} x={item.x} y={item.y} fill={item.color} fontSize={18} fontWeight="bold">
                  {item.text}
                </SvgText>
              )
            )}

            {current ? (
              <Path
                d={current}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={tool === 'highlight' ? 0.38 : 1}
                strokeLinecap={tool === 'highlight' ? 'butt' : 'round'}
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </Svg>
        </View>

        {/* Sag arac cubugu */}
        <View style={styles.toolbar}>
          <ToolButton
            icon="brush"
            active={tool === 'pen'}
            color={Palette.purple}
            onPress={() => setTool('pen')}
          />
          <ToolButton
            icon="color-fill"
            active={tool === 'highlight'}
            color={Palette.gold}
            onPress={() => setTool('highlight')}
          />
          <ToolButton
            icon="text"
            active={tool === 'text'}
            color={Palette.blue}
            onPress={() => setTool('text')}
          />

          <View style={styles.toolDivider} />

          {PENS.map((c) => (
            <PressScale key={c} onPress={() => setColor(c)} scaleTo={0.85}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchActive,
                ]}
              />
            </PressScale>
          ))}
        </View>
      </View>

      {/* Alt panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.bottom, { paddingBottom: insets.bottom + Space.md }]}
      >
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Hocam burada tam olarak nerede takıldın?"
          placeholderTextColor={Palette.textFaint}
          style={styles.noteInput}
          multiline
        />

        <NeonButton
          label={saving ? 'Gönderiliyor…' : 'Hocaya Gönder'}
          icon="paper-plane"
          color={Palette.purple}
          size="lg"
          full
          disabled={saving}
          onPress={send}
        />
      </KeyboardAvoidingView>

      {/* Metin araci penceresi */}
      <Modal visible={textDraft !== null} transparent animationType="fade" onRequestClose={() => setTextDraft(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Txt variant="section">Not ekle</Txt>
            <Txt variant="small" color={Palette.textDim}>
              Bu not fotoğrafın üstünde dokunduğun yerde görünecek.
            </Txt>
            <TextInput
              autoFocus
              value={textDraft?.value ?? ''}
              onChangeText={(v) => setTextDraft((d) => (d ? { ...d, value: v } : d))}
              placeholder="Örn: burada eksi mi artı mı?"
              placeholderTextColor={Palette.textFaint}
              style={styles.modalInput}
              onSubmitEditing={commitText}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <GhostButton label="Vazgeç" onPress={() => setTextDraft(null)} style={styles.flex} full />
              <NeonButton label="Ekle" color={Palette.blue} onPress={commitText} style={styles.flex} full />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ToolButton({
  icon,
  active,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress} scaleTo={0.88}>
      <View style={[styles.tool, active && { backgroundColor: color, borderColor: color }]}>
        <Ionicons name={icon} size={20} color={active ? OnColor : Palette.textDim} />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
  },
  topActions: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  stage: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Space.md,
    gap: Space.md,
  },
  canvas: {
    flex: 1,
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  noPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
  },
  toolbar: {
    width: 56,
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  tool: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceHi,
  },
  toolDivider: {
    width: 24,
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 2,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: Palette.text,
  },
  bottom: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    gap: Space.md,
  },
  noteInput: {
    minHeight: 52,
    maxHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: Space.md,
    color: Palette.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
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
    gap: Space.md,
    padding: Space.xl,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surface,
  },
  modalInput: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.bg,
    paddingHorizontal: Space.lg,
    color: Palette.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Space.md,
  },
});
