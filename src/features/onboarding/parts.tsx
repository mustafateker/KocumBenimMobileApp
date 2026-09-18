import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from '@/components/button';
import { Mascot, type MascotMood } from '@/components/mascot';
import { TextField, Txt } from '@/components/ui';
import { Accent, Border, Palette, Radius, Space, pillRadius, softOf } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Maskotun agzindan cikan konusma balonu. Kuyruk, kenarligi iki tarafindan
 * devam eden 45 derece dondurulmus bir kare — boylece balonun konturuyla
 * kesintisiz birlesir.
 */
export function SpeechBubble({
  color = Accent,
  tail = 'left',
  style,
  children,
}: {
  color?: string;
  tail?: 'left' | 'up';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const skin = { borderColor: color, backgroundColor: softOf(color) };

  return (
    <View style={[styles.bubble, skin, style]}>
      <View style={[styles.tail, skin, tail === 'left' ? styles.tailLeft : styles.tailUp]} />
      {children}
    </View>
  );
}

/**
 * Adim basligi. Karsilama/kapanis adimlarinda (hero) buyuk maskot soruyu
 * kendi balonunda soyler; diger adimlarda baslik ustte kalir, maskot yandan
 * kisa bir yorum yapar. Boylece uzun secenek listeleri olan adimlarda ust
 * bolum sismez.
 */
export function StepHeader({
  color,
  title,
  subtitle,
  mood,
  hero,
}: {
  color: string;
  title: string;
  subtitle: string;
  mood: MascotMood;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <View style={styles.heroHead}>
        <Mascot width={150} mood={mood} />
        <SpeechBubble color={color} tail="up" style={styles.stretch}>
          <Txt variant="section" center>
            {title}
          </Txt>
          <Txt variant="small" color={Palette.textDim} center style={styles.bubbleSub}>
            {subtitle}
          </Txt>
        </SpeechBubble>
      </View>
    );
  }

  return (
    <View style={styles.head}>
      <Txt variant="title" center>
        {title}
      </Txt>
      <View style={styles.saysRow}>
        <Mascot width={74} mood={mood} />
        <SpeechBubble color={color} style={styles.flex}>
          <Txt variant="small" color={Palette.textDim}>
            {subtitle}
          </Txt>
        </SpeechBubble>
      </View>
    </View>
  );
}

/**
 * Sihirbazin ust seridi: adim ikonu + tesvik metni + segmentli ilerleme.
 * Tek bir dolan cubuk yerine adim sayisi kadar kati blok kullanilir; kac
 * adim kaldigi tek bakista sayilabilsin diye.
 */
export function StepProgress({
  index,
  total,
  color,
  icon,
  cheer,
}: {
  index: number;
  total: number;
  color: string;
  icon: IconName;
  cheer: string;
}) {
  return (
    <View style={styles.progress}>
      <View style={styles.progressTop}>
        <View style={[styles.cheerChip, { borderColor: color, backgroundColor: softOf(color) }]}>
          <Ionicons name={icon} size={13} color={color} />
          <Txt variant="tiny" color={color}>
            {cheer}
          </Txt>
        </View>
        <Txt variant="tiny" color={Palette.textFaint}>
          {index + 1} / {total}
        </Txt>
      </View>

      <View style={styles.segments}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i <= index ? color : Palette.surfaceHi }]}
          />
        ))}
      </View>
    </View>
  );
}

/** Tek secimlik satir — sinif, sinav turu, sure gibi listelerde. */
export function OptionRow({
  label,
  selected,
  onPress,
  color = Accent,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <PressScale onPress={onPress} scaleTo={0.98}>
      <View
        style={[
          styles.row,
          selected && { borderColor: color, backgroundColor: color + '14' },
        ]}
      >
        <Txt variant="bodyStrong" color={selected ? color : Palette.text} style={styles.flex}>
          {label}
        </Txt>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={color} />
        ) : (
          <View style={styles.radio} />
        )}
      </View>
    </PressScale>
  );
}

/** Coklu secim satiri — konu, motivasyon listeleri. */
export function CheckRow({
  label,
  checked,
  onPress,
  color = Accent,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <PressScale onPress={onPress} scaleTo={0.98}>
      <View
        style={[
          styles.row,
          checked && { borderColor: color, backgroundColor: color + '14' },
        ]}
      >
        <Txt variant="bodyStrong" color={checked ? color : Palette.text} style={styles.flex}>
          {label}
        </Txt>
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={22}
          color={checked ? color : Palette.textFaint}
        />
      </View>
    </PressScale>
  );
}

export function OptionList({
  options,
  value,
  onSelect,
  color,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  color?: string;
}) {
  return (
    <View style={styles.list}>
      {options.map((o) => (
        <OptionRow key={o} label={o} selected={value === o} onPress={() => onSelect(o)} color={color} />
      ))}
    </View>
  );
}

export function CheckList({
  options,
  values,
  onToggle,
  color,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  color?: string;
}) {
  return (
    <View style={styles.list}>
      {options.map((o) => (
        <CheckRow key={o} label={o} checked={values.includes(o)} onPress={() => onToggle(o)} color={color} />
      ))}
    </View>
  );
}

/** Serbest metin adimlari — "En büyük hedefin ne?" gibi. */
export function BigTextArea({
  value,
  onChangeText,
  placeholder,
  helper,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  helper?: string;
}) {
  return (
    <View style={styles.list}>
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        autoCapitalize="sentences"
      />
      {helper ? (
        <Txt variant="tiny" color={Palette.textFaint}>
          {helper}
        </Txt>
      ) : null}
    </View>
  );
}

/**
 * Arama kutusu + populer secenekler. Deger dogrudan arama metni: listeden
 * secilirse kutuya yazilir, secilmezse yazdigin metin oldugu gibi kaydedilir
 * (boylece "Diğer" secenegi ayri bir dal gerektirmez).
 */
export function SearchPicker({
  value,
  onChangeText,
  placeholder,
  popularLabel,
  options,
  color = Accent,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  popularLabel: string;
  options: string[];
  color?: string;
}) {
  const query = value.trim().toLowerCase();
  const filtered = query ? options.filter((o) => o.toLowerCase().includes(query)) : options;
  const exactMatch = options.some((o) => o.toLowerCase() === query);
  const canAddCustom = query.length > 1 && !exactMatch;

  return (
    <View style={styles.list}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={Palette.textFaint} />
        <TextField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize="words"
          style={styles.searchField}
        />
      </View>

      {canAddCustom ? (
        <PressScale onPress={() => onChangeText(value.trim())} scaleTo={0.98}>
          <View style={[styles.row, styles.addRow, { borderColor: color }]}>
            <Ionicons name="add-circle" size={22} color={color} />
            <Txt variant="bodyStrong" color={color} style={styles.flex} numberOfLines={1}>
              &quot;{value.trim()}&quot; olarak ekle
            </Txt>
          </View>
        </PressScale>
      ) : null}

      {filtered.length > 0 ? (
        <>
          <Txt variant="tiny" color={Palette.textFaint} style={styles.popularLabel}>
            {popularLabel.toUpperCase()}
          </Txt>
          <View style={styles.list}>
            {filtered.map((o) => (
              <OptionRow key={o} label={o} selected={value === o} onPress={() => onChangeText(o)} color={color} />
            ))}
          </View>
        </>
      ) : !canAddCustom ? (
        <Txt variant="small" color={Palette.textFaint}>
          Listede yok mu? Yukarı yazdığın metin olduğu gibi kaydedilecek.
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: {
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.md,
  },
  heroHead: {
    alignItems: 'center',
    gap: Space.lg,
    paddingHorizontal: Space.sm,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  bubbleSub: {
    marginTop: 4,
  },
  saysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    alignSelf: 'stretch',
  },
  bubble: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
  },
  tail: {
    position: 'absolute',
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
  },
  tailLeft: {
    left: -9,
    top: '50%',
    marginTop: -7,
    borderLeftWidth: Border.thick,
    borderBottomWidth: Border.thick,
  },
  tailUp: {
    top: -9,
    left: '50%',
    marginLeft: -7,
    borderLeftWidth: Border.thick,
    borderTopWidth: Border.thick,
  },
  progress: {
    gap: Space.sm,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  cheerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Space.md,
    paddingVertical: 5,
    // 15 (tiny satir yuksekligi) + 10 (dikey dolgu) + 4 (kenarlik) = 29
    borderRadius: pillRadius(29),
    borderWidth: Border.thick,
  },
  segments: {
    flexDirection: 'row',
    gap: 3,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  list: {
    gap: Space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    minHeight: 54,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  addRow: {
    borderStyle: 'dashed',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: Border.thick,
    borderColor: Palette.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  searchField: {
    flex: 1,
  },
  popularLabel: {
    marginTop: Space.xs,
    letterSpacing: 1,
  },
});
