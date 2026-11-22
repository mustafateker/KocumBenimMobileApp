import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { IconBubble, ProgressBar, TextField, Txt } from '@/components/ui';
import {
  deriveSubjectCurriculumState,
  getCurriculumSubjectsForGrade,
  searchSubjectUnits,
  type CurriculumProgressMap,
  type CurriculumSubject,
} from '@/lib/maarif-curriculum';
import {
  Border,
  OnboardingPalette,
  Palette,
  Radius,
  Space,
  pillRadius,
  softOf,
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
 * Tek bir dersin konularını tek sayfada, sade ve anlaşılır şekilde seçtiren bileşen.
 * Öğrenci okulda geldiği konuya dokunduğunda o konu ve önceki tüm konular
 * belirgin yeşil renkle ve yeşil tikle "Tamamlandı" olarak işaretlenir.
 */
export function SingleSubjectTopicPicker({
  grade,
  subject,
  selectedTopic,
  onSelectTopic,
  stepIndex,
  totalSteps,
}: {
  grade: string | number;
  subject: CurriculumSubject;
  selectedTopic?: string;
  onSelectTopic: (topicName: string) => void;
  stepIndex?: number;
  totalSteps?: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* Seçili Dersin Özet Başlık Kartı */}
      <View style={styles.subjectHeroCard}>
        <View style={styles.subjectHeroTop}>
          <IconBubble name={getSubjectIcon(subject.name)} color={Palette.green} size={48} />
          <View style={styles.flex}>
            {typeof stepIndex === 'number' && typeof totalSteps === 'number' ? (
              <Txt variant="tiny" color={OnboardingPalette.accent}>
                {`DERS ${stepIndex + 1} / ${totalSteps}`}
              </Txt>
            ) : null}
            <Txt variant="section" color={OnboardingPalette.text}>
              {subject.name}
            </Txt>
            <Txt variant="tiny" color={OnboardingPalette.textDim}>
              {`${state.completedCount} / ${state.totalCount} Konu Tamamlandı (%${state.progressPercent})`}
            </Txt>
          </View>
          <View style={styles.greenCountBadge}>
            <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" />
            <Txt variant="tiny" color="#FFFFFF">
              {`${state.completedCount} Tamam`}
            </Txt>
          </View>
        </View>

        <ProgressBar
          progress={state.totalCount > 0 ? state.completedCount / state.totalCount : 0}
          color={Palette.green}
          height={8}
        />

        <View style={styles.currentSelectionBox}>
          <Ionicons name="flag" size={16} color={Palette.green} />
          <Txt variant="small" color={OnboardingPalette.text} style={styles.flex} numberOfLines={2}>
            {`Okulda Geldiğim Konu: `}
            <Txt variant="smallStrong" color={Palette.green}>
              {state.currentTopic}
            </Txt>
          </Txt>
        </View>
      </View>

      {/* Arama Kutusu */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={OnboardingPalette.textFaint} />
        <TextField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`${subject.name} içinde konu ara...`}
          tone="onboarding"
          style={styles.searchField}
        />
        {searchQuery.length > 0 ? (
          <PressScale onPress={() => setSearchQuery('')} scaleTo={0.9}>
            <Ionicons name="close-circle" size={20} color={OnboardingPalette.textFaint} />
          </PressScale>
        ) : null}
      </View>

      {/* Ünite ve Konu Listesi */}
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
              <Txt variant="tiny" color={OnboardingPalette.textFaint} style={styles.unitTitle}>
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
                        {/* Sol Yeşil Tik veya Sıra Numarası */}
                        <View
                          style={[
                            styles.checkCircle,
                            isCompleted ? styles.checkCircleGreen : styles.checkCircleEmpty,
                          ]}
                        >
                          {isCompleted ? (
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                          ) : (
                            <Txt variant="tiny" color={OnboardingPalette.textDim}>
                              {topicOrderIdx + 1}
                            </Txt>
                          )}
                        </View>

                        {/* Konu Adı ve Durum Etiketi */}
                        <View style={styles.flex}>
                          <Txt
                            variant={isCompleted ? 'bodyStrong' : 'body'}
                            color={isCompleted ? OnboardingPalette.text : OnboardingPalette.textDim}
                          >
                            {topic}
                          </Txt>
                          <View style={styles.statusRow}>
                            {isCurrent ? (
                              <View style={styles.currentBadge}>
                                <Txt variant="tiny" color="#FFFFFF">
                                  Okulda Geldiğim Son Konu
                                </Txt>
                              </View>
                            ) : isCompleted ? (
                              <Txt variant="tiny" color={Palette.green}>
                                Tamamlandı · İşlendi
                              </Txt>
                            ) : (
                              <Txt variant="tiny" color={OnboardingPalette.textFaint}>
                                Henüz İşlenmedi (Seçmek için dokun)
                              </Txt>
                            )}
                          </View>
                        </View>

                        <Ionicons
                          name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                          size={24}
                          color={isCompleted ? Palette.green : OnboardingPalette.textFaint}
                        />
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
 * İlk kayıt onboarding sihirbazı içinde kullanılan, her sayfada (section'da)
 * tek bir dersin konusunu seçtiren bileşen.
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
      {/* Üst Ders Geçiş Sekmeleri (Sayfa / Section göstergesi) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectPillsRow}
      >
        {subjects.map((subj, idx) => {
          const isActive = idx === safeIndex;
          const isDone = Boolean(value[subj.name]);
          return (
            <PressScale key={subj.name} onPress={() => setSubjectIndex(idx)} scaleTo={0.96}>
              <View
                style={[
                  styles.subjectStepPill,
                  isActive && styles.subjectStepPillActive,
                  !isActive && isDone && styles.subjectStepPillDone,
                ]}
              >
                <Ionicons
                  name={isDone ? 'checkmark-circle' : getSubjectIcon(subj.name)}
                  size={15}
                  color={isActive ? '#FFFFFF' : isDone ? Palette.green : OnboardingPalette.textDim}
                />
                <Txt
                  variant="tiny"
                  color={isActive ? '#FFFFFF' : isDone ? Palette.green : OnboardingPalette.textDim}
                >
                  {`${idx + 1}. ${subj.name}`}
                </Txt>
              </View>
            </PressScale>
          );
        })}
      </ScrollView>

      {/* Aktif Dersin Konu Seçim Bölümü */}
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

      {/* Dersler Arası İleri / Geri Geçiş Butonları */}
      {subjects.length > 1 ? (
        <View style={styles.subjectNavRow}>
          {safeIndex > 0 ? (
            <GhostButton
              label={`Önceki Ders (${subjects[safeIndex - 1].name})`}
              icon="chevron-back"
              color={OnboardingPalette.textDim}
              onPress={() => setSubjectIndex((i) => Math.max(0, i - 1))}
              style={styles.flex}
              full
            />
          ) : null}
          {safeIndex < subjects.length - 1 ? (
            <NeonButton
              label={`Sonraki Ders: ${subjects[safeIndex + 1].name}`}
              icon="arrow-forward"
              color={Palette.green}
              onPress={() => setSubjectIndex((i) => Math.min(subjects.length - 1, i + 1))}
              style={styles.flex}
              full
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wizardWrap: {
    gap: Space.md,
  },
  subjectPillsRow: {
    gap: Space.xs,
    paddingVertical: 2,
  },
  subjectStepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: pillRadius(36),
    borderWidth: Border.thick,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
  },
  subjectStepPillActive: {
    borderColor: OnboardingPalette.accent,
    backgroundColor: OnboardingPalette.accent,
  },
  subjectStepPillDone: {
    borderColor: Palette.green,
    backgroundColor: softOf(Palette.green),
  },
  subjectNavRow: {
    flexDirection: 'row',
    gap: Space.sm,
    marginTop: Space.xs,
  },
  singleContainer: {
    gap: Space.md,
  },
  subjectHeroCard: {
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.green,
    backgroundColor: OnboardingPalette.surface,
    gap: Space.sm,
  },
  subjectHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  greenCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: pillRadius(26),
    backgroundColor: Palette.green,
  },
  currentSelectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Space.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: softOf(Palette.green),
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  searchField: {
    flex: 1,
  },
  emptySearch: {
    paddingVertical: Space.xl,
  },
  unitsList: {
    gap: Space.lg,
  },
  unitBlock: {
    gap: Space.xs,
  },
  unitTitle: {
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  unitTopics: {
    gap: Space.xs,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
  },
  topicItemCompleted: {
    borderColor: Palette.green,
    backgroundColor: softOf(Palette.green),
  },
  topicItemCurrent: {
    borderColor: Palette.green,
    borderWidth: 2,
    backgroundColor: softOf(Palette.green),
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleGreen: {
    backgroundColor: Palette.green,
  },
  checkCircleEmpty: {
    backgroundColor: OnboardingPalette.track,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: pillRadius(18),
    backgroundColor: Palette.green,
  },
});
