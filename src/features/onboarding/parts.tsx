import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { PressScale } from '@/components/button';
import { Mascot, type MascotMood } from '@/components/mascot';
import { Txt } from '@/components/ui';
import {
  Font,
  OnboardingPalette,
  Space,
  pillRadius,
} from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Tum beyaz onboarding kartlari ve konusma balonlari icin ortak yumusak golge. */
export const OnboardingCardShadow = {
  shadowColor: '#2D2B52',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 16,
  elevation: 2,
} as const;

/**
 * Sablon A (Hero: welcome, name, summary) ve Sablon B (Kompakt maskot + beyaz
 * konusma balonu: tum secim adimlari) baslik bileseni.
 */
export function StepHeader({
  title,
  subtitle,
  mood,
  hero,
}: {
  color?: string;
  title: string;
  subtitle: string;
  mood: MascotMood;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <View style={styles.heroHead}>
        <View style={styles.heroMascotWrap}>
          <View style={styles.heroHalo} />
          <Mascot width={156} mood={mood} />
        </View>
        <View style={styles.heroTextWrap}>
          <Txt variant="title" color={OnboardingPalette.text} center style={styles.heroTitle}>
            {title}
          </Txt>
          <Txt variant="body" color={OnboardingPalette.textDim} center style={styles.heroSubtitle}>
            {subtitle}
          </Txt>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.compactRow}>
      <Mascot width={74} mood={mood} />
      <View style={styles.speechBubble}>
        <View style={styles.speechTail} />
        <Txt variant="section" color={OnboardingPalette.text} style={styles.bubbleTitle}>
          {title}
        </Txt>
        <Txt variant="small" color={OnboardingPalette.textDim} style={styles.bubbleSubtitle}>
          {subtitle}
        </Txt>
      </View>
    </View>
  );
}

/**
 * Ust Bar (Top Header):
 * - Sol: 40x40 saf beyaz yuvarlak Geri butonu (ilk adimda gizli)
 * - Orta: Tek parca, akici animasyonlu yatay ilerleme cubugu (height: 10, track: #FFE4CC, fill: #F47732)
 * - Sag: Sade adim sayaci hapi (2 / 11, arka plan #EFECE8)
 */
export function StepProgress({
  index,
  total,
  onBack,
  showBack = true,
  backIcon = 'chevron-back',
}: {
  index: number;
  total: number;
  onBack?: () => void;
  showBack?: boolean;
  backIcon?: IconName;
  color?: string;
  icon?: IconName;
  cheer?: string;
}) {
  const safeTotal = Math.max(1, total);
  const ratio = Math.max(0, Math.min(1, (index + 1) / safeTotal));

  return (
    <View style={styles.topHeaderRow}>
      {showBack && onBack ? (
        <PressScale onPress={onBack} scaleTo={0.92} hitSlop={8}>
          <View style={styles.backCircle}>
            <Ionicons name={backIcon} size={20} color={OnboardingPalette.text} />
          </View>
        </PressScale>
      ) : (
        <View style={styles.backSpacer} />
      )}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>

      <View style={styles.counterPill}>
        <Txt variant="tiny" color={OnboardingPalette.text} style={styles.counterText}>
          {`${index + 1} / ${safeTotal}`}
        </Txt>
      </View>
    </View>
  );
}

/**
 * Alt Sabit Aksiyon Butonu:
 * Tam genislikte kapsul (height: 56, pillRadius(56)), canli turuncu #F47732,
 * borderBottomWidth: 4 (#C8561A) 3D dokunsal efektli birincil buton.
 */
export function OnboardingPrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && styles.primaryBtnDisabled,
        pressed && !disabled && styles.primaryBtnPressed,
        style,
      ]}
    >
      <Txt variant="bodyStrong" color="#FFFFFF" style={styles.primaryBtnText}>
        {label}
      </Txt>
    </Pressable>
  );
}

/**
 * Name adimindaki modern giris alani:
 * Ustte temiz kucuk etiket, #FFFFFF zemin, height: 56, borderRadius: 18,
 * yumusak golge, odaklanildiginda 2px #F47732 kenarlik.
 */
export function OnboardingInput({
  label,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextInputProps & { label: string }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Txt variant="smallStrong" color={OnboardingPalette.textDim} style={styles.inputLabel}>
        {label}
      </Txt>
      <View
        style={[
          styles.inputBox,
          isFocused && styles.inputBoxFocused,
        ]}
      >
        <TextInput
          placeholderTextColor={OnboardingPalette.textFaint}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[styles.inputText, style]}
          {...rest}
        />
      </View>
    </View>
  );
}

const GRADE_GROUPS = [
  {
    title: 'İLKOKUL',
    items: [
      { value: '1. Sınıf', num: '1' },
      { value: '2. Sınıf', num: '2' },
      { value: '3. Sınıf', num: '3' },
      { value: '4. Sınıf', num: '4' },
    ],
  },
  {
    title: 'ORTAOKUL · LGS',
    items: [
      { value: '5. Sınıf', num: '5' },
      { value: '6. Sınıf', num: '6' },
      { value: '7. Sınıf', num: '7' },
      { value: '8. Sınıf', num: '8' },
    ],
  },
  {
    title: 'LİSE · YKS',
    items: [
      { value: '9. Sınıf', num: '9' },
      { value: '10. Sınıf', num: '10' },
      { value: '11. Sınıf', num: '11' },
      { value: '12. Sınıf', num: '12' },
    ],
  },
] as const;

function getGradeModeBadgeText(grade: string): string | null {
  if (!grade) return null;
  if (grade === '8. Sınıf') return 'LGS Hazırlık Modu aktif edilecek';
  if (grade === '9. Sınıf' || grade === '10. Sınıf' || grade === '11. Sınıf' || grade === '12. Sınıf') {
    return 'YKS Hazırlık Modu aktif edilecek';
  }
  if (grade === '5. Sınıf' || grade === '6. Sınıf' || grade === '7. Sınıf') {
    return 'Ortaokul & Bursluluk Hazırlık Modu aktif edilecek';
  }
  return 'İlkokul Temel Gelişim Modu aktif edilecek';
}

/**
 * Sablon C — Sinif Secimi (3 gruplu, 4 sutunlu kare kart gridi + alt bilgi rozeti).
 */
export function GradeGridPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (grade: string) => void;
}) {
  const modeText = getGradeModeBadgeText(value);

  return (
    <View style={styles.gradeContainer}>
      {GRADE_GROUPS.map((group) => (
        <View key={group.title} style={styles.gradeGroup}>
          <Txt variant="tiny" color={OnboardingPalette.textDim} style={styles.gradeGroupTitle}>
            {group.title}
          </Txt>
          <View style={styles.gradeGridRow}>
            {group.items.map((item) => {
              const selected = value === item.value;
              return (
                <PressScale
                  key={item.value}
                  onPress={() => onSelect(item.value)}
                  scaleTo={0.96}
                  style={styles.gradeCellWrap}
                >
                  <View style={[styles.gradeCard, selected && styles.cardSelected]}>
                    {selected ? (
                      <View style={styles.cornerCheckBadge}>
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    ) : null}
                    <Txt
                      variant="title"
                      color={selected ? OnboardingPalette.accent : OnboardingPalette.text}
                      style={styles.gradeNumber}
                    >
                      {item.num}
                    </Txt>
                    <Txt
                      variant="tiny"
                      color={selected ? OnboardingPalette.accent : OnboardingPalette.textDim}
                    >
                      Sınıf
                    </Txt>
                  </View>
                </PressScale>
              );
            })}
          </View>
        </View>
      ))}

      {modeText ? (
        <View style={styles.gradeModePill}>
          <View style={styles.gradeModeIconWrap}>
            <Ionicons name="sparkles" size={14} color={OnboardingPalette.accent} />
          </View>
          <Txt variant="smallStrong" color={OnboardingPalette.text}>
            {modeText}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Sablon C — Kisa secenekli adimlar (dailyHours, commitmentDuration) icin
 * 2 sutunlu yuvarlak beyaz kart gridi.
 */
export function GridOptionList({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.twoColGrid}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <PressScale
            key={option}
            onPress={() => onSelect(option)}
            scaleTo={0.97}
            style={styles.twoColItem}
          >
            <View style={[styles.gridCard, selected && styles.cardSelected]}>
              <Txt
                variant="bodyStrong"
                color={selected ? OnboardingPalette.accent : OnboardingPalette.text}
                style={styles.gridCardLabel}
              >
                {option}
              </Txt>
              {selected ? (
                <View style={styles.checkCircleSelected}>
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.checkCircleEmpty} />
              )}
            </View>
          </PressScale>
        );
      })}
    </View>
  );
}

/**
 * Sablon C — Kisa coklu secim adimi (motivation) icin 2 sutunlu yuvarlak beyaz kart gridi.
 */
export function GridCheckList({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View style={styles.twoColGrid}>
      {options.map((option) => {
        const checked = values.includes(option);
        return (
          <PressScale
            key={option}
            onPress={() => onToggle(option)}
            scaleTo={0.97}
            style={styles.twoColItem}
          >
            <View style={[styles.gridCard, checked && styles.cardSelected]}>
              <Txt
                variant="bodyStrong"
                color={checked ? OnboardingPalette.accent : OnboardingPalette.text}
                style={styles.gridCardLabel}
              >
                {option}
              </Txt>
              {checked ? (
                <View style={styles.checkCircleSelected}>
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.checkCircleEmpty} />
              )}
            </View>
          </PressScale>
        );
      })}
    </View>
  );
}

/** Tek secimlik ferah beyaz kart satiri. */
function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress} scaleTo={0.985}>
      <View style={[styles.row, selected && styles.cardSelected]}>
        <Txt
          variant="bodyStrong"
          color={selected ? OnboardingPalette.accent : OnboardingPalette.text}
          style={styles.rowText}
        >
          {label}
        </Txt>
        {selected ? (
          <View style={styles.checkCircleSelected}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.checkCircleEmpty} />
        )}
      </View>
    </PressScale>
  );
}

/** Coklu secimlik ferah beyaz kart satiri. */
function CheckRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress} scaleTo={0.985}>
      <View style={[styles.row, checked && styles.cardSelected]}>
        <Txt
          variant="bodyStrong"
          color={checked ? OnboardingPalette.accent : OnboardingPalette.text}
          style={styles.rowText}
        >
          {label}
        </Txt>
        {checked ? (
          <View style={styles.checkCircleSelected}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.checkCircleEmpty} />
        )}
      </View>
    </PressScale>
  );
}

export function OptionList({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  color?: string;
}) {
  return (
    <View style={styles.list}>
      {options.map((o) => (
        <OptionRow key={o} label={o} selected={value === o} onPress={() => onSelect(o)} />
      ))}
    </View>
  );
}

export function CheckList({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  color?: string;
}) {
  return (
    <View style={styles.list}>
      {options.map((o) => (
        <CheckRow key={o} label={o} checked={values.includes(o)} onPress={() => onToggle(o)} />
      ))}
    </View>
  );
}

/**
 * Beyaz kapsul arama cubugu + ferah beyaz secim kartlari.
 */
export function SearchPicker({
  value,
  onChangeText,
  placeholder,
  popularLabel,
  options,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  popularLabel: string;
  options: string[];
  color?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const query = value.trim().toLowerCase();
  const filtered = query ? options.filter((o) => o.toLowerCase().includes(query)) : options;
  const exactMatch = options.some((o) => o.toLowerCase() === query);
  const canAddCustom = query.length > 1 && !exactMatch;

  return (
    <View style={styles.list}>
      <View style={[styles.searchCapsule, isFocused && styles.searchCapsuleFocused]}>
        <Ionicons name="search" size={18} color={OnboardingPalette.textFaint} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={OnboardingPalette.textFaint}
          autoCapitalize="words"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.searchInput}
        />
        {value.length > 0 ? (
          <PressScale onPress={() => onChangeText('')} scaleTo={0.9} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={OnboardingPalette.textFaint} />
          </PressScale>
        ) : null}
      </View>

      {canAddCustom ? (
        <PressScale onPress={() => onChangeText(value.trim())} scaleTo={0.985}>
          <View style={[styles.row, styles.addRow]}>
            <Ionicons name="add-circle" size={22} color={OnboardingPalette.accent} />
            <Txt variant="bodyStrong" color={OnboardingPalette.accent} style={styles.rowText} numberOfLines={1}>
              {`"${value.trim()}" olarak seç`}
            </Txt>
          </View>
        </PressScale>
      ) : null}

      {filtered.length > 0 ? (
        <>
          <Txt variant="tiny" color={OnboardingPalette.textDim} style={styles.popularLabel}>
            {popularLabel.toUpperCase()}
          </Txt>
          <View style={styles.list}>
            {filtered.map((o) => (
              <OptionRow key={o} label={o} selected={value === o} onPress={() => onChangeText(o)} />
            ))}
          </View>
        </>
      ) : !canAddCustom ? (
        <Txt variant="small" color={OnboardingPalette.textFaint}>
          Listede yok mu? Yukarı yazdığın metin olduğu gibi kaydedilecek.
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Top Header
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: OnboardingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    ...OnboardingCardShadow,
  },
  backSpacer: {
    width: 40,
    height: 40,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: OnboardingPalette.accentSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: OnboardingPalette.accent,
  },
  counterPill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: pillRadius(28),
    backgroundColor: '#EFECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Font.semibold,
    color: OnboardingPalette.textDim,
  },

  // Sablon A — Hero Header
  heroHead: {
    alignItems: 'center',
    gap: Space.lg,
    paddingHorizontal: Space.sm,
  },
  heroMascotWrap: {
    width: 172,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHalo: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: OnboardingPalette.heroGlow,
  },
  heroTextWrap: {
    alignItems: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
  },
  heroTitle: {
    fontFamily: Font.black,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
  },

  // Sablon B — Kompakt Maskot + Beyaz Konusma Balonu
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    paddingHorizontal: Space.lg,
    paddingVertical: 14,
    gap: 4,
    ...OnboardingCardShadow,
  },
  speechTail: {
    position: 'absolute',
    left: -6,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: OnboardingPalette.surface,
    transform: [{ rotate: '45deg' }],
  },
  bubbleTitle: {
    fontFamily: Font.bold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  bubbleSubtitle: {
    fontFamily: Font.regular,
    fontSize: 13,
    lineHeight: 19,
  },

  // Primary CTA Button
  primaryBtn: {
    height: 56,
    borderRadius: pillRadius(56),
    backgroundColor: OnboardingPalette.accent,
    borderBottomWidth: 4,
    borderBottomColor: OnboardingPalette.accentShadow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xl,
  },
  primaryBtnPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    fontFamily: Font.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  // Onboarding Input
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    marginLeft: 4,
  },
  inputBox: {
    height: 56,
    borderRadius: 18,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    paddingHorizontal: Space.lg,
    justifyContent: 'center',
    ...OnboardingCardShadow,
  },
  inputBoxFocused: {
    borderWidth: 2,
    borderColor: OnboardingPalette.borderSelected,
  },
  inputText: {
    color: OnboardingPalette.text,
    fontFamily: Font.semibold,
    fontSize: 16,
    paddingVertical: 0,
  },

  // Sablon C — Grade 4-col Grid
  gradeContainer: {
    gap: Space.md,
  },
  gradeGroup: {
    gap: 8,
  },
  gradeGroupTitle: {
    fontFamily: Font.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginLeft: 2,
  },
  gradeGridRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  gradeCellWrap: {
    flex: 1,
  },
  gradeCard: {
    height: 76,
    borderRadius: 18,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...OnboardingCardShadow,
  },
  gradeNumber: {
    fontFamily: Font.black,
    fontSize: 22,
    lineHeight: 26,
  },
  cornerCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: Space.lg,
    borderRadius: pillRadius(44),
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    marginTop: 4,
    ...OnboardingCardShadow,
  },
  gradeModeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: OnboardingPalette.surfaceSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sablon C — 2-Column Grid Cards
  twoColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  twoColItem: {
    width: '48.2%',
    flexGrow: 1,
  },
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
    minHeight: 62,
    padding: 16,
    borderRadius: 18,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    ...OnboardingCardShadow,
  },
  gridCardLabel: {
    flex: 1,
    fontFamily: Font.semibold,
    fontSize: 15,
    lineHeight: 20,
  },

  // Shared Selection State & Radio/Check Circles
  cardSelected: {
    backgroundColor: OnboardingPalette.surfaceSelected,
    borderWidth: 2,
    borderColor: OnboardingPalette.borderSelected,
  },
  checkCircleSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.bg,
  },

  // Sablon C — Long / Searchable List Rows
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    minHeight: 56,
    paddingHorizontal: Space.lg,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
    ...OnboardingCardShadow,
  },
  rowText: {
    flex: 1,
    fontFamily: Font.semibold,
    fontSize: 15,
    lineHeight: 21,
  },
  addRow: {
    borderColor: OnboardingPalette.accent,
    borderStyle: 'dashed',
    backgroundColor: OnboardingPalette.surfaceSelected,
  },
  searchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    height: 52,
    paddingHorizontal: Space.lg,
    borderRadius: pillRadius(52),
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    ...OnboardingCardShadow,
  },
  searchCapsuleFocused: {
    borderWidth: 2,
    borderColor: OnboardingPalette.borderSelected,
  },
  searchInput: {
    flex: 1,
    color: OnboardingPalette.text,
    fontFamily: Font.medium,
    fontSize: 15,
    paddingVertical: 0,
  },
  popularLabel: {
    fontFamily: Font.bold,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
});
