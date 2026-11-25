import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PressScale } from '@/components/button';
import { ProgressBar, Txt } from '@/components/ui';
import { OnboardingCardShadow } from '@/features/onboarding/parts';
import {
  deriveSubjectCurriculumState,
  getCurriculumSubjectsForGrade,
  searchSubjectUnits,
  type CurriculumProgressMap,
  type CurriculumSubject,
} from '@/lib/maarif-curriculum';
import {
  Font,
  OnboardingPalette,
  Space,
  pillRadius,
} from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SUBJECT_ICON_MAP: Record<string, IconName> = {
  Matematik: 'calculator',
  Türkçe: 'book',
  'Türk Dili ve Edebiyatı': 'book',
  'Fen Bilimleri': 'flask',
  Fizik: 'magnet',
  Kimya: 'beaker',
  Biyoloji: 'leaf',
  'Sosyal Bilgiler': 'earth',
  'T.C. İnkılap Tarihi ve Atatürkçülük': 'flag',
  Tarih: 'time',
  'Çağdaş Türk ve Dünya Tarihi (Seçmeli)': 'globe',
  Coğrafya: 'compass',
  Felsefe: 'bulb',
  İngilizce: 'language',
  'Din Kültürü ve Ahlak Bilgisi': 'heart',
  'Hayat Bilgisi': 'sunny',
  'Psikoloji (Seçmeli)': 'person',
  'Sosyoloji (Seçmeli)': 'people',
  'Mantık (Seçmeli)': 'git-branch',
};

export function getSubjectIcon(subjectName: string): IconName {
  return SUBJECT_ICON_MAP[subjectName] ?? 'school';
}

/**
 * Sablon D — Tek bir dersin konularini tek sayfada, sade ve anlasilir sekilde sectiren bilesen.
 */
export function SingleSubjectTopicPicker({
  grade,
  subject,
  selectedTopic,
  onSelectTopic,
}: {
  grade: string | number;
  subject: CurriculumSubject;
  selectedTopic?: string;
  onSelectTopic: (topicName: string) => void;
  stepIndex?: number;
  totalSteps?: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const state = useMemo(
    () => deriveSubjectCurriculumState(grade, subject.name, selectedTopic),
    [grade, subject.name, selectedTopic]
  );

  const filteredUnits = useMemo(
    () => searchSubjectUnits(subject.units, searchQuery),
    [subject.units, searchQuery]
  );

  return (
    <View style={styles.singleContainer}>
      {/* Ozet Ilerleme Karti: Ustte Matematik · X / Y Konu + sagda #10B981 yesil X Tamam hapi, altinda ince #F47732 ilerleme cubugu */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View style={styles.subjectIconCircle}>
            <Ionicons name={getSubjectIcon(subject.name)} size={18} color={OnboardingPalette.accent} />
          </View>
          <Txt variant="bodyStrong" color={OnboardingPalette.text} style={styles.summaryTitle}>
            {`${subject.name} · ${state.completedCount} / ${state.totalCount} Konu`}
          </Txt>
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Txt variant="tiny" color="#FFFFFF" style={styles.doneBadgeText}>
              {`${state.completedCount} Tamam`}
            </Txt>
          </View>
        </View>

        <ProgressBar
          progress={state.totalCount > 0 ? state.completedCount / state.totalCount : 0}
          color={OnboardingPalette.accent}
          height={8}
          track={OnboardingPalette.accentSoft}
        />

        <View style={styles.currentTopicRow}>
          <Ionicons name="flag" size={14} color={OnboardingPalette.accent} />
          <Txt variant="small" color={OnboardingPalette.textDim} style={styles.flex} numberOfLines={2}>
            {'Okulda Geldiğim Konu: '}
            <Txt variant="smallStrong" color={OnboardingPalette.accent}>
              {state.currentTopic}
            </Txt>
          </Txt>
        </View>
      </View>

      {/* Beyaz Kapsul Arama Cubugu */}
      <View style={[styles.searchCapsule, searchFocused && styles.searchCapsuleFocused]}>
        <Ionicons name="search" size={18} color={OnboardingPalette.textFaint} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`${subject.name} içinde konu ara...`}
          placeholderTextColor={OnboardingPalette.textFaint}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 ? (
          <PressScale onPress={() => setSearchQuery('')} scaleTo={0.9} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={OnboardingPalette.textFaint} />
          </PressScale>
        ) : null}
      </View>

      {/* Unite ve Konu Kartlari */}
      {filteredUnits.length === 0 ? (
        <View style={styles.emptySearch}>
          <Txt variant="small" color={OnboardingPalette.textFaint} center>
            Aramana uygun konu bulunamadı.
          </Txt>
        </View>
      ) : (
        <View style={styles.unitsList}>
          {filteredUnits.map((unit) => (
            <View key={unit.name} style={styles.unitBlock}>
              <Txt variant="tiny" color={OnboardingPalette.textDim} style={styles.unitTitle}>
                {unit.name.toUpperCase()}
              </Txt>

              <View style={styles.unitTopics}>
                {unit.topics.map((topic) => {
                  const topicOrderIdx = state.allTopics.indexOf(topic);
                  const isCurrent = topic === state.currentTopic;
                  const isCompleted = topicOrderIdx !== -1 && topicOrderIdx <= state.currentIndex;

                  return (
                    <PressScale
                      key={topic}
                      onPress={() => onSelectTopic(topic)}
                      scaleTo={0.985}
                    >
                      <View
                        style={[
                          styles.topicItem,
                          isCompleted && styles.topicItemCompleted,
                          isCurrent && styles.topicItemCurrent,
                        ]}
                      >
                        {/* Sol Ikon: Secili son konu icin yumusak turuncu bayrak, tamamlananlar icin yesil tik, digerleri sira numarasi */}
                        <View
                          style={[
                            styles.leftCircle,
                            isCurrent
                              ? styles.leftCircleCurrent
                              : isCompleted
                                ? styles.leftCircleCompleted
                                : styles.leftCircleEmpty,
                          ]}
                        >
                          {isCurrent ? (
                            <Ionicons name="flag" size={15} color={OnboardingPalette.accent} />
                          ) : isCompleted ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : (
                            <Txt variant="tiny" color={OnboardingPalette.textDim}>
                              {topicOrderIdx + 1}
                            </Txt>
                          )}
                        </View>

                        {/* Konu Adi ve Durum */}
                        <View style={styles.flex}>
                          <Txt
                            variant={isCompleted || isCurrent ? 'bodyStrong' : 'body'}
                            color={OnboardingPalette.text}
                          >
                            {topic}
                          </Txt>
                          <View style={styles.statusRow}>
                            {isCurrent ? (
                              <Txt variant="tiny" color={OnboardingPalette.accent} style={styles.currentStatusText}>
                                Okulda Geldiğim Son Konu
                              </Txt>
                            ) : isCompleted ? (
                              <Txt variant="tiny" color={OnboardingPalette.success}>
                                Tamamlandı · İşlendi
                              </Txt>
                            ) : (
                              <Txt variant="tiny" color={OnboardingPalette.textFaint}>
                                Dokunarak seç
                              </Txt>
                            )}
                          </View>
                        </View>

                        {/* Sagda #10B981 yesil tik dairesi veya bos daire */}
                        {isCurrent || isCompleted ? (
                          <View style={styles.rightGreenCheck}>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View style={styles.rightEmptyCircle} />
                        )}
                      </View>
                    </PressScale>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Sablon D — Onboarding icindeki Maarif Mufredat Konu Secici.
 * Ders sekmeleri yatay ScrollView icinde tam metinli kapsul haplar olarak yer alir.
 */
export function CurriculumTopicPicker({
  grade,
  value,
  onChange,
}: {
  grade: string | number;
  value: CurriculumProgressMap;
  onChange: (next: CurriculumProgressMap) => void;
  color?: string;
}) {
  const subjects = useMemo(() => getCurriculumSubjectsForGrade(grade), [grade]);
  const [subjectIndex, setSubjectIndex] = useState(0);

  const safeIndex = Math.min(subjectIndex, Math.max(0, subjects.length - 1));
  const activeSubject = subjects[safeIndex];

  if (!activeSubject) return null;

  return (
    <View style={styles.wizardWrap}>
      {/* Yatay ScrollView icinde tam metinli ders kapsul haplari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectPillsRow}
      >
        {subjects.map((subj, idx) => {
          const isActive = idx === safeIndex;
          const isDone = Boolean(value[subj.name]);
          return (
            <PressScale
              key={subj.name}
              onPress={() => setSubjectIndex(idx)}
              scaleTo={0.96}
              style={styles.pillWrapper}
            >
              <View style={[styles.subjectTabPill, isActive && styles.subjectTabPillActive]}>
                <Ionicons
                  name={isDone && !isActive ? 'checkmark-circle' : getSubjectIcon(subj.name)}
                  size={15}
                  color={
                    isActive
                      ? '#FFFFFF'
                      : isDone
                        ? OnboardingPalette.success
                        : OnboardingPalette.textDim
                  }
                />
                <Txt
                  variant="smallStrong"
                  color={isActive ? '#FFFFFF' : OnboardingPalette.text}
                  style={styles.subjectTabText}
                >
                  {subj.name}
                </Txt>
              </View>
            </PressScale>
          );
        })}
      </ScrollView>

      {/* Aktif Dersin Konu Secim Bolumu */}
      <SingleSubjectTopicPicker
        grade={grade}
        subject={activeSubject}
        selectedTopic={value[activeSubject.name]}
        stepIndex={safeIndex}
        totalSteps={subjects.length}
        onSelectTopic={(topicName) => {
          onChange({ ...value, [activeSubject.name]: topicName });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wizardWrap: {
    gap: Space.md,
  },
  subjectPillsRow: {
    gap: Space.sm,
    paddingVertical: 4,
  },
  pillWrapper: {
    flexShrink: 0,
  },
  subjectTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: pillRadius(40),
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
    ...OnboardingCardShadow,
  },
  subjectTabPillActive: {
    borderColor: OnboardingPalette.accent,
    backgroundColor: OnboardingPalette.accent,
  },
  subjectTabText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Font.semibold,
  },
  singleContainer: {
    gap: Space.md,
  },
  summaryCard: {
    padding: Space.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
    gap: 12,
    ...OnboardingCardShadow,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: OnboardingPalette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    flex: 1,
    fontFamily: Font.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: pillRadius(26),
    backgroundColor: OnboardingPalette.success,
  },
  doneBadgeText: {
    fontFamily: Font.bold,
  },
  currentTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  searchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    height: 50,
    paddingHorizontal: Space.lg,
    borderRadius: pillRadius(50),
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
    fontSize: 14,
    paddingVertical: 0,
  },
  emptySearch: {
    paddingVertical: Space.xl,
  },
  unitsList: {
    gap: Space.lg,
  },
  unitBlock: {
    gap: 8,
  },
  unitTitle: {
    fontFamily: Font.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  unitTopics: {
    gap: 10,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
    ...OnboardingCardShadow,
  },
  topicItemCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: OnboardingPalette.surface,
  },
  topicItemCurrent: {
    borderColor: OnboardingPalette.borderSelected,
    borderWidth: 1.5,
    backgroundColor: OnboardingPalette.surfaceSelected,
  },
  leftCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftCircleCurrent: {
    backgroundColor: OnboardingPalette.accentSoft,
  },
  leftCircleCompleted: {
    backgroundColor: OnboardingPalette.success,
  },
  leftCircleEmpty: {
    backgroundColor: OnboardingPalette.bg,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  currentStatusText: {
    fontFamily: Font.bold,
  },
  rightGreenCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: OnboardingPalette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightEmptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.bg,
  },
});
