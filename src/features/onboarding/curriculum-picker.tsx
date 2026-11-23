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
  DetailAccent,
  OnboardingPalette,
  Palette,
  Radius,
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
          <IconBubble name={getSubjectIcon(subject.name)} color={DetailAccent} size={48} />
          <View style={styles.flex}>
            {typeof stepIndex === 'number' && typeof totalSteps === 'number' ? (
              <Txt variant="tiny" color={DetailAccent}>
                {`DERS ${stepIndex + 1} / ${totalSteps}`}
              </Txt>
            ) : null}
            <Txt variant="section" color={Palette.text}>
              {subject.name}
            </Txt>
            <Txt variant="tiny" color={Palette.textDim}>
              {`${state.completedCount} / ${state.totalCount} Konu Tamamlandı (%${state.progressPercent})`}
            </Txt>
          </View>
          <View style={styles.topicCountBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Palette.green} />
            <Txt variant="tiny" color={Palette.text} style={{ fontWeight: '600' }}>
              {`${state.completedCount} Tamam`}
            </Txt>
          </View>
        </View>

        <ProgressBar
          progress={state.totalCount > 0 ? state.completedCount / state.totalCount : 0}
          color={DetailAccent}
          height={7}
          track={Palette.surfaceHi}
        />

        <View style={styles.currentSelectionBox}>
          <View style={styles.flagIconBox}>
            <Ionicons name="flag" size={14} color={DetailAccent} />
          </View>
          <Txt variant="small" color={Palette.text} style={styles.flex} numberOfLines={2}>
            {`Okulda Geldiğim Konu: `}
            <Txt variant="smallStrong" color={DetailAccent}>
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
                        {/* Sol İkon: Okulda Gelinen Konu İçin Bayrak/Turuncu, Tamamlananlar İçin Yeşil Tik, Diğerleri İçin Sıra Numarası */}
                        <View
                          style={[
                            styles.checkCircle,
                            isCurrent
                              ? styles.checkCircleCurrent
                              : isCompleted
                                ? styles.checkCircleGreen
                                : styles.checkCircleEmpty,
                          ]}
                        >
                          {isCurrent ? (
                            <Ionicons name="flag" size={15} color="#FFFFFF" />
                          ) : isCompleted ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : (
                            <Txt variant="tiny" color={Palette.textDim}>
                              {topicOrderIdx + 1}
                            </Txt>
                          )}
                        </View>

                        {/* Konu Adı ve Durum Etiketi */}
                        <View style={styles.flex}>
                          <Txt
                            variant={isCompleted || isCurrent ? 'bodyStrong' : 'body'}
                            color={isCompleted || isCurrent ? Palette.text : Palette.textDim}
                          >
                            {topic}
                          </Txt>
                          <View style={styles.statusRow}>
                            {isCurrent ? (
                              <View style={styles.currentBadge}>
                                <Txt variant="tiny" color="#FFFFFF" style={{ fontWeight: '600' }}>
                                  Okulda Geldiğim Son Konu
                                </Txt>
                              </View>
                            ) : isCompleted ? (
                              <Txt variant="tiny" color={Palette.green}>
                                Tamamlandı · İşlendi
                              </Txt>
                            ) : (
                              <Txt variant="tiny" color={Palette.textFaint}>
                                Dokunarak seç
                              </Txt>
                            )}
                          </View>
                        </View>

                        <Ionicons
                          name={
                            isCurrent
                              ? 'checkmark-circle'
                              : isCompleted
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                          }
                          size={22}
                          color={
                            isCurrent
                              ? DetailAccent
                              : isCompleted
                                ? Palette.green
                                : Palette.border
                          }
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
    borderColor: DetailAccent,
    backgroundColor: DetailAccent,
  },
  subjectStepPillDone: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: '#FFFFFF',
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
    padding: Space.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(251, 174, 117, 0.35)',
    backgroundColor: '#FFFFFF',
    gap: Space.md,
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  subjectHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  topicCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: pillRadius(26),
    backgroundColor: 'rgba(251, 174, 117, 0.14)',
    borderWidth: Border.thin,
    borderColor: 'rgba(251, 174, 117, 0.3)',
  },
  currentSelectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Space.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(251, 174, 117, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(251, 174, 117, 0.24)',
  },
  flagIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingHorizontal: Space.md,
    borderWidth: 1,
    borderColor: Palette.border,
    height: 48,
  },
  searchField: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
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
    marginBottom: 4,
  },
  unitTopics: {
    gap: Space.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.md,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  topicItemCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: '#FFFFFF',
  },
  topicItemCurrent: {
    borderColor: DetailAccent,
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCurrent: {
    backgroundColor: DetailAccent,
  },
  checkCircleGreen: {
    backgroundColor: Palette.green,
  },
  checkCircleEmpty: {
    backgroundColor: Palette.surfaceHi,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: pillRadius(18),
    backgroundColor: DetailAccent,
  },
});
