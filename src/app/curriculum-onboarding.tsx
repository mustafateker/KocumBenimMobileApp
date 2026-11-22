import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { PatternBackground } from '@/components/pattern-background';
import { Txt } from '@/components/ui';
import {
  SingleSubjectTopicPicker,
  getSubjectIcon,
} from '@/features/onboarding/curriculum-picker';
import { StepHeader, StepProgress } from '@/features/onboarding/parts';
import { getCurriculumProgress, updateCurriculumProgress } from '@/lib/api';
import { useErrorDialog } from '@/lib/error-dialog';
import {
  getCurriculumSubjectsForGrade,
  type CurriculumProgressMap,
} from '@/lib/maarif-curriculum';
import { useSession, useStudent } from '@/lib/session';
import {
  Border,
  OnboardingPalette,
  Palette,
  Space,
  pillRadius,
  softOf,
} from '@/theme/tokens';

/**
 * "Okulda Geldiğim Konuları Seç" ekranı:
 * Her sayfada (adımda) YALNIZCA TEK BİR DERS gösterilir.
 * Öğrenci sırayla (Matematik -> Türkçe -> Fen Bilimleri -> ...) her derste
 * okulda geldiği konuyu işaretler; önceki konular otomatik olarak yeşil tikli (Tamamlandı) olur.
 */
export default function CurriculumOnboardingScreen() {
  const student = useStudent();
  const { setUser } = useSession();
  const { showError } = useErrorDialog();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);

  const grade = student.grade ?? '8. Sınıf';
  const subjects = useMemo(() => getCurriculumSubjectsForGrade(grade), [grade]);

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState<CurriculumProgressMap>({});
  const [saving, setSaving] = useState(false);

  const safeIndex = Math.min(stepIndex, Math.max(0, subjects.length - 1));
  const currentSubject = subjects[safeIndex];
  const isLastStep = safeIndex >= subjects.length - 1;

  useEffect(() => {
    let mounted = true;
    getCurriculumProgress(student).then((saved) => {
      if (!mounted) return;
      const initial: CurriculumProgressMap = {};
      for (const s of subjects) {
        const firstTopic = s.units[0]?.topics[0];
        initial[s.name] = saved[s.name] ?? firstTopic ?? '';
      }
      setProgress(initial);
    });
    return () => {
      mounted = false;
    };
  }, [student, subjects]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const merged = await updateCurriculumProgress(progress, student.id);
      setUser({
        ...student,
        curriculumProgress: merged,
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/subjects');
      }
    } catch (err) {
      showError(err, { title: 'Konu ilerlemesi kaydedilemedi', code: 'CURRICULUM_SAVE' });
    } finally {
      setSaving(false);
    }
  }, [saving, progress, student, setUser, router, showError]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSave();
      return;
    }
    setStepIndex((i) => Math.min(subjects.length - 1, i + 1));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [isLastStep, handleSave, subjects.length]);

  const handleBack = useCallback(() => {
    if (safeIndex > 0) {
      setStepIndex((i) => Math.max(0, i - 1));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/subjects');
    }
  }, [safeIndex, router]);

  return (
    <View style={styles.root}>
      <PatternBackground
        color={OnboardingPalette.accent}
        backgroundColor={OnboardingPalette.bg}
        blobColor={OnboardingPalette.blob}
      />

      <View style={[styles.progressWrap, { paddingTop: insets.top + Space.sm }]}>
        <StepProgress
          index={safeIndex}
          total={subjects.length}
          color={Palette.green}
          icon={currentSubject ? getSubjectIcon(currentSubject.name) : 'book'}
          cheer={currentSubject ? `${currentSubject.name} (${safeIndex + 1}/${subjects.length})` : grade}
        />

        {/* Dersler Arası Hızlı Sekme Çubuğu */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {subjects.map((subj, idx) => {
            const active = idx === safeIndex;
            const completed = idx < safeIndex || Boolean(progress[subj.name]);
            return (
              <PressScale
                key={subj.name}
                onPress={() => {
                  setStepIndex(idx);
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                scaleTo={0.96}
              >
                <View
                  style={[
                    styles.subjectPill,
                    active && styles.subjectPillActive,
                    !active && completed && styles.subjectPillCompleted,
                  ]}
                >
                  <Ionicons
                    name={completed && !active ? 'checkmark-circle' : getSubjectIcon(subj.name)}
                    size={14}
                    color={active ? '#FFFFFF' : completed ? Palette.green : OnboardingPalette.textDim}
                  />
                  <Txt
                    variant="tiny"
                    color={active ? '#FFFFFF' : completed ? Palette.green : OnboardingPalette.textDim}
                  >
                    {subj.name}
                  </Txt>
                </View>
              </PressScale>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.flex}
        bottomOffset={Space.xl}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Space.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {currentSubject ? (
          <>
            <StepHeader
              color={Palette.green}
              title={`${currentSubject.name} dersinde hangi konudasın?`}
              subtitle="Okulda en son işlediğiniz konuya dokun. Seçtiğin konuya kadar olan tüm konular yeşil tikle tamamlanmış sayılır."
              mood="happy"
            />

            <SingleSubjectTopicPicker
              grade={grade}
              subject={currentSubject}
              selectedTopic={progress[currentSubject.name]}
              stepIndex={safeIndex}
              totalSteps={subjects.length}
              onSelectTopic={(topicName) => {
                setProgress((prev) => ({ ...prev, [currentSubject.name]: topicName }));
              }}
            />
          </>
        ) : null}
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + Space.md }]}>
          <View style={styles.footerRow}>
            <GhostButton
              label={safeIndex > 0 ? 'Önceki Ders' : 'Kapat'}
              icon={safeIndex > 0 ? 'chevron-back' : 'close'}
              color={OnboardingPalette.textDim}
              onPress={handleBack}
              style={styles.backBtn}
              full
            />
            <NeonButton
              label={
                saving
                  ? 'Kaydediliyor...'
                  : isLastStep
                    ? 'Kaydet ve Tamamla'
                    : `Sonraki: ${subjects[safeIndex + 1]?.name ?? 'İleri'}`
              }
              icon={isLastStep ? 'checkmark-circle' : 'arrow-forward'}
              color={Palette.green}
              size="lg"
              disabled={saving}
              onPress={handleNext}
              style={styles.nextBtn}
              full
            />
          </View>
          {!isLastStep ? (
            <PressScale onPress={handleSave} scaleTo={0.98}>
              <View style={styles.saveNowLink}>
                <Txt variant="tiny" color={OnboardingPalette.textDim} center>
                  Değişiklikleri şimdi kaydet ve Derslerim&apos;e dön
                </Txt>
              </View>
            </PressScale>
          ) : null}
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: OnboardingPalette.bg,
  },
  progressWrap: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.xs,
    gap: Space.sm,
  },
  pillsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: pillRadius(30),
    borderWidth: Border.thick,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
  },
  subjectPillActive: {
    borderColor: Palette.green,
    backgroundColor: Palette.green,
  },
  subjectPillCompleted: {
    borderColor: Palette.green,
    backgroundColor: softOf(Palette.green),
  },
  content: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    gap: Space.lg,
  },
  footer: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: Border.thick,
    borderTopColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.bg,
    gap: Space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  backBtn: {
    flex: 0.9,
  },
  nextBtn: {
    flex: 1.4,
  },
  saveNowLink: {
    paddingVertical: 4,
  },
});
