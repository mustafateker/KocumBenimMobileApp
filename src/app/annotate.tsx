import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  PanResponder,
  StyleSheet,
  TextInput,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDialog } from '@/components/app-dialog';
import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { createQuestion } from '@/lib/api';
import { logHandledError } from '@/lib/crash-reporter';
import { discardPhoto, localImageUri } from '@/lib/photo-store';
import { useSession, useStudent } from '@/lib/session';
import type { CanvasItem } from '@/lib/types';
import { Accent, Border, DetailAccent, OnColor, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

/** Kalem paleti — fotograf uzerinde okunakli kalsin diye doygun renkler. */
const PENS = ['#FF3B5C', '#2B7FFF', '#12C46A', '#FFB020', '#111827'];

type Tool = 'pen' | 'highlight' | 'text';

export default function Annotate() {
  const router = useRouter();
  useStudent();
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
  const [uploadError, setUploadError] = useState<{ message: string; code: string } | null>(null);

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
      // Not yazarken fotografa dokunmak klavyeyi kapatsin — geri tusuna
      // basmak zorunda kalinmasin.
      Keyboard.dismiss();
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
      Keyboard.dismiss();
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
    if (saving || !uri) return;
    setSaving(true);
    try {
      await createQuestion({
        imageUri: uri,
        strokes: { w: frame.w, h: frame.h, items },
        note: note.trim(),
      });
      await refresh();
      // Sunucuda duruyor; yerel kopyayi tutmaya gerek yok.
      discardPhoto(uri);
      // Gonderdikten sonra kamera yerine listeye dus: ogrenci sorusunun
      // gittigini gorsun.
      router.replace({ pathname: '/student/questions', params: { mode: 'list' } });
      // `saving` bilerek sifirlanmiyor ve bu satirdan sonra state'e
      // dokunulmuyor: `router.replace` bu tam ekran modali sokmeye baslarken
      // ayni karede setState yapmak Fabric'i
      // "addViewAt: the specified child already has a parent" mount hatasina
      // (kirmizi ekran) dusuruyordu. Ekran zaten kapandigi icin bayragi
      // sifirlamaya gerek de yok.
    } catch (err) {
      // Eskiden yakalanmayan bu hata sessiz bir cokmeye donusuyordu.
      // Mesaji ekrana bir metin satiri olarak basmiyoruz: alt panele sonradan
      // gorunur bir yazi eklemek ayni mount hatasini tetikliyor.
      const entry = logHandledError('QUESTION_UPLOAD', err);
      setUploadError({ message: entry.message, code: entry.code });
      setSaving(false);
    }
  }, [saving, uri, frame.w, frame.h, items, note, refresh, router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Ust bar */}
      <View style={styles.topBar}>
        <IconButton icon="close" onPress={() => router.back()} />
        <View style={styles.flex} />
        <PressScale onPress={send} disabled={saving} hapticStyle={Haptics.ImpactFeedbackStyle.Medium}>
          <View style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            <Txt variant="bodyStrong" color={OnColor}>
              {saving ? 'Gönderiliyor…' : 'Kaydet'}
            </Txt>
          </View>
        </PressScale>
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
      </View>

      {/* Renkler, not alani ve arac cubugu klavye acilinca onun ustune biner —
          Android edge-to-edge modunda pencere kendiliginden kucultulmuyor.
          Panelin kendi opak zemini var: yukari bindiginde fotograf arkasindan
          gorunup araclari okunmaz hale getirmesin. */}
      <KeyboardStickyView>
        <View style={styles.bottomPanel}>
          {/* Kalem renkleri */}
          <View style={styles.swatchRow}>
            {PENS.map((c) => (
              <PressScale key={c} onPress={() => setColor(c)} scaleTo={0.85}>
                <View style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]} />
              </PressScale>
            ))}
          </View>

          {/* Not alani */}
          <View style={styles.noteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={Palette.textFaint} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Nerede takıldın? (opsiyonel not)"
              placeholderTextColor={Palette.textFaint}
              style={styles.noteInput}
            />
          </View>

          {/* Alt arac cubugu */}
          <View style={[styles.toolbar, { paddingBottom: insets.bottom + Space.sm }]}>
            <ToolButton icon="pencil" label="Kalem" active={tool === 'pen'} color={DetailAccent} onPress={() => setTool('pen')} />
            <ToolButton
              icon="color-fill"
              label="Vurgula"
              active={tool === 'highlight'}
              color={DetailAccent}
              onPress={() => setTool('highlight')}
            />
            <ToolButton icon="text" label="Metin" active={tool === 'text'} color={DetailAccent} onPress={() => setTool('text')} />
            <ToolButton icon="arrow-undo" label="Geri Al" active={false} color={Palette.textDim} onPress={undo} disabled={items.length === 0} />
            <ToolButton icon="trash" label="Temizle" active={false} color={Palette.pink} onPress={clear} disabled={items.length === 0} />
          </View>
        </View>
      </KeyboardStickyView>

      {/* Metin araci penceresi */}
      <Modal visible={textDraft !== null} transparent animationType="fade" onRequestClose={() => setTextDraft(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalAccent} />
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
              <NeonButton label="Ekle" color={Accent} onPress={commitText} style={styles.flex} full />
            </View>
          </View>
        </View>
      </Modal>

      <AppDialog
        visible={uploadError !== null}
        icon="cloud-offline-outline"
        title="Soru gönderilemedi"
        message={uploadError ? `${uploadError.message}\nHata kodu: ${uploadError.code}` : ''}
        confirmLabel="Tamam"
        onConfirm={() => setUploadError(null)}
      />
    </View>
  );
}

function ToolButton({
  icon,
  label,
  active,
  color,
  disabled,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  active: boolean;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress} disabled={disabled} scaleTo={0.9} style={styles.toolWrap}>
      <View style={[styles.tool, active && { backgroundColor: color + '22', borderColor: color }]}>
        <Ionicons name={icon} size={20} color={active ? color : Palette.textDim} />
      </View>
      <Txt variant="tiny" color={active ? color : Palette.textFaint}>
        {label}
      </Txt>
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
  saveButton: {
    height: 40,
    paddingHorizontal: Space.xl,
    borderRadius: pillRadius(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Accent,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  stage: {
    flex: 1,
    paddingHorizontal: Space.md,
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
  /**
   * Klavye acilinca bu panel fotografin uzerine biner; kendi opak zemini
   * olmazsa fotograf araclarin arkasindan gorunup hepsini okunmaz yapiyor.
   */
  bottomPanel: {
    backgroundColor: Palette.bg,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
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
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    marginHorizontal: Space.lg,
    marginBottom: Space.sm,
    paddingHorizontal: Space.lg,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  noteInput: {
    flex: 1,
    color: Palette.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Space.sm,
    paddingHorizontal: Space.md,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  toolWrap: {
    alignItems: 'center',
    gap: 4,
  },
  tool: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceHi,
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
    paddingTop: Space.xxl,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.borderStrong,
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
