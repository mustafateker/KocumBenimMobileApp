import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { IconBubble, TextField, Txt } from '@/components/ui';
import { Border, Palette, Radius, Space } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Her adimin ust basligi: ikon kabarcigi + baslik + alt yazi. */
export function StepHeader({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: IconName;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.head}>
      <IconBubble name={icon} color={color} size={68} />
      <Txt variant="title" center>
        {title}
      </Txt>
      <Txt variant="small" color={Palette.textDim} center>
        {subtitle}
      </Txt>
    </View>
  );
}

/** Tek secimlik satir — sinif, sinav turu, sure gibi listelerde. */
export function OptionRow({
  label,
  selected,
  onPress,
  color = Palette.purple,
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
  color = Palette.purple,
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
  color = Palette.purple,
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
    gap: Space.sm,
    paddingHorizontal: Space.md,
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
