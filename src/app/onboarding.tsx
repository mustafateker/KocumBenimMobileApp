import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui';
import { completeOnboarding } from '@/lib/api';
import {
  ALL_STEPS,
  CAREERS,
  COMMITMENT_DURATIONS,
  DAILY_HOURS,
  DEPARTMENTS,
  DISCIPLINE_MEANINGS,
  GOALS,
  HIGH_SCHOOLS,
  LISE_GRADES,
  LISE_ONCESI_GRADES,
  MOTIVATIONS,
  STEP_META,
  UNIVERSITIES,
  type StepKey,
} from '@/features/onboarding/data';
import {
  CheckList,
  GradeGridPicker,
  GridCheckList,
  GridOptionList,
  OnboardingCardShadow,
  OnboardingInput,
  OnboardingPrimaryButton,
  SearchPicker,
  StepHeader,
  StepProgress,
} from '@/features/onboarding/parts';
import { CurriculumTopicPicker } from '@/features/onboarding/curriculum-picker';
import { getCurriculumSubjectsForGrade, type CurriculumProgressMap } from '@/lib/maarif-curriculum';
import { useErrorDialog } from '@/lib/error-dialog';
import { useSession, useStudent } from '@/lib/session';
import {
  OnboardingPalette,
  Space,
} from '@/theme/tokens';

type FormState = {
  firstName: string;
  lastName: string;
  grade: string;
  curriculumProgress: CurriculumProgressMap;
  goal: string;
  career: string;
  highSchool: string;
  university: string;
  department: string;
  dailyHours: string;
  disciplineMeaning: string[];
  commitmentDuration: string;
  motivation: string[];
};

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  grade: '',
  curriculumProgress: {},
  goal: '',
  career: '',
  highSchool: '',
  university: '',
  department: '',
  dailyHours: '',
  disciplineMeaning: [],
  commitmentDuration: '',
  motivation: [],
};

/**
 * Kocun panelden actigi veya Apple / Google ile giris yapilan hesapta ad soyad
 * hazir gelebilir; ilk adimda tekrar yazdirmayalim (Apple Guideline 4.0).
 * Kendi e-postasiyla kayit yapan ogrencide `name` e-postanin on kismi oldugu icin onerilmez.
 */
function prefillName(student: {
  name: string;
  surname?: string | null;
  email?: string | null;
  teacherId: number | null;
}): Pick<FormState, 'firstName' | 'lastName'> {
  const rawName = (student.name ?? '').trim();
  const rawSurname = (student.surname ?? '').trim();
  const emailPrefix = (student.email ?? '').split('@')[0]?.trim().toLowerCase() ?? '';

  if (rawSurname) {
    return { firstName: rawName, lastName: rawSurname };
  }

  const isEmailPrefixOnly =
    student.teacherId == null &&
    (!rawName || rawName.toLowerCase() === emailPrefix || rawName.toLowerCase() === 'öğrenci');

  if (isEmailPrefixOnly) {
    return { firstName: '', lastName: '' };
  }

  const parts = rawName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

/** Bu adimlarda icerik ScrollView icinde dikeyde ortalanir. */
const CENTERED_STEPS = new Set<StepKey>(['welcome', 'name']);

function isStepValid(targetStep: StepKey, form: FormState): boolean {
  switch (targetStep) {
    case 'welcome':
      return true;
    case 'name':
      return form.firstName.trim().length > 0 && form.lastName.trim().length > 0;
    case 'grade':
      return form.grade !== '';
    case 'currentTopics':
      return true;
    case 'goal':
      return form.goal.trim().length > 0;
    case 'career':
      return form.career.trim().length > 0;
    case 'highSchool':
      return form.highSchool.trim().length > 0;
    case 'university':
      return form.university.trim().length > 0;
    case 'department':
      return form.department.trim().length > 0;
    case 'dailyHours':
      return form.dailyHours !== '';
    case 'disciplineMeaning':
      return form.disciplineMeaning.length > 0;
    case 'commitmentDuration':
      return form.commitmentDuration !== '';
    case 'motivation':
      return form.motivation.length > 0;
    case 'summary':
      return true;
  }
}

/**
 * "Ilk Kurulum" sihirbazi — kayittan hemen sonra ogrenciyi taniyip hedeflerini
 * kaydeder. Tek ekran, adimlar arasinda index ile gezinir; lise hedefi 1-8,
 * universite ve bolum hedefleri ise 9-12. sinif icin gosterilir.
 */
export default function Onboarding() {
  const student = useStudent();
  const { setUser } = useSession();
  const { showError } = useErrorDialog();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY_FORM, ...prefillName(student) }));
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const lastNavAtRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isLiseOncesi = LISE_ONCESI_GRADES.has(form.grade);
  const isLise = LISE_GRADES.has(form.grade);

  const steps = useMemo(
    () =>
      ALL_STEPS.filter((key) => {
        if (key === 'highSchool') return isLiseOncesi;
        if (key === 'university' || key === 'department') return isLise;
        return true;
      }),
    [isLiseOncesi, isLise]
  );

  const step = steps[Math.min(index, steps.length - 1)];
  const meta = (step && STEP_META[step]) || STEP_META.welcome;

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const toggleMulti = useCallback((key: 'disciplineMeaning' | 'motivation', value: string) => {
    setForm((f) => {
      const list = f[key];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next };
    });
  }, []);

  const valid = useMemo(() => isStepValid(step, form), [step, form]);

  const finish = useCallback(async () => {
    if (saving) return;

    const missingIdx = steps.findIndex((s) => s !== 'summary' && !isStepValid(s, form));
    if (missingIdx !== -1) {
      setIndex(missingIdx);
      return;
    }

    setSaving(true);
    try {
      const subjects = getCurriculumSubjectsForGrade(form.grade);
      const finalProgress: CurriculumProgressMap = {};
      for (const s of subjects) {
        const chosen = form.curriculumProgress[s.name];
        if (chosen && chosen.trim()) {
          finalProgress[s.name] = chosen.trim();
        }
      }

      const fallbackPrefill = prefillName(student);
      const safeFirstName = (form.firstName.trim() || fallbackPrefill.firstName || student.name || 'Öğrenci').slice(0, 60);
      const safeLastName = (form.lastName.trim() || fallbackPrefill.lastName || student.surname || '-').slice(0, 60);

      const updated = await completeOnboarding({
        firstName: safeFirstName,
        lastName: safeLastName,
        grade: (form.grade || '8. Sınıf').slice(0, 40),
        goal: (form.goal.trim() || GOALS[0]).slice(0, 200),
        career: (form.career.trim() || CAREERS[0]).slice(0, 200),
        targetHighSchool: isLiseOncesi ? form.highSchool.trim().slice(0, 200) : '',
        targetUniversity: isLise ? form.university.trim().slice(0, 200) : '',
        targetDepartment: isLise ? form.department.trim().slice(0, 200) : '',
        dailyHours: (form.dailyHours || DAILY_HOURS[1]).slice(0, 40),
        disciplineMeaning: form.disciplineMeaning.slice(0, 20),
        commitmentDuration: (form.commitmentDuration || COMMITMENT_DURATIONS[4]).slice(0, 100),
        motivation: form.motivation.slice(0, 20),
        curriculumProgress: finalProgress,
      });
      setUser(updated);
      router.replace('/student');
    } catch (err) {
      if (isMountedRef.current) {
        setSaving(false);
      }
      showError(err, { title: 'Bilgilerin kaydedilemedi', code: 'ONBOARDING_SAVE' });
    }
  }, [saving, steps, form, student, isLiseOncesi, isLise, setUser, router, showError]);

  const next = useCallback(() => {
    const now = Date.now();
    if (now - lastNavAtRef.current < 280) return;
    if (!valid) return;
    lastNavAtRef.current = now;
    if (step === 'summary') {
      finish();
      return;
    }
    setIndex((i) => {
      const currentKey = steps[Math.min(i, steps.length - 1)];
      if (!isStepValid(currentKey, form)) return i;
      return Math.min(steps.length - 1, i + 1);
    });
  }, [valid, step, finish, steps, form]);

  const back = useCallback(() => {
    const now = Date.now();
    if (now - lastNavAtRef.current < 200) return;
    lastNavAtRef.current = now;
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.progressWrap, { paddingTop: insets.top + Space.sm }]}>
        <StepProgress
          index={index}
          total={steps.length}
          onBack={back}
          showBack={index > 0}
        />
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        bottomOffset={Space.xl}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Space.xl },
          CENTERED_STEPS.has(step) && styles.contentCentered,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          color={meta.color}
          title={meta.title}
          subtitle={meta.subtitle}
          mood={meta.mood}
          hero={meta.hero}
        />

        <View style={styles.body}>
          {step === 'welcome' ? (
            <View style={styles.welcomeCard}>
              <Txt variant="body" color={OnboardingPalette.textDim} center>
                Sınıfını, hedeflerini ve çalışma tarzını öğrenip sana özel bir yolculuk
                hazırlayacağız. Hazırsan başlayalım!
              </Txt>
            </View>
          ) : null}

          {step === 'name' ? (
            <View style={styles.body}>
              <OnboardingInput
                label="Adın"
                value={form.firstName}
                onChangeText={(v) => set('firstName', v)}
                placeholder="Adını yaz"
                autoCapitalize="words"
              />
              <OnboardingInput
                label="Soyadın"
                value={form.lastName}
                onChangeText={(v) => set('lastName', v)}
                placeholder="Soyadını yaz"
                autoCapitalize="words"
              />
            </View>
          ) : null}

          {step === 'grade' ? (
            <GradeGridPicker
              value={form.grade}
              onSelect={(v) => {
                const subjects = getCurriculumSubjectsForGrade(v);
                const validNames = new Set(subjects.map((s) => s.name));
                const retained: CurriculumProgressMap = {};
                for (const [sName, top] of Object.entries(form.curriculumProgress)) {
                  if (validNames.has(sName) && top) {
                    retained[sName] = top;
                  }
                }
                setForm((f) => ({ ...f, grade: v, curriculumProgress: retained }));
              }}
            />
          ) : null}

          {step === 'currentTopics' ? (
            <CurriculumTopicPicker
              grade={form.grade || '8. Sınıf'}
              value={form.curriculumProgress}
              onChange={(v) => set('curriculumProgress', v)}
              color={meta.color}
            />
          ) : null}

          {step === 'goal' ? (
            <SearchPicker
              value={form.goal}
              onChangeText={(v) => set('goal', v)}
              placeholder="Hedefini ara ya da yaz…"
              popularLabel="Örnek hedefler"
              options={GOALS}
              color={meta.color}
            />
          ) : null}

          {step === 'career' ? (
            <SearchPicker
              value={form.career}
              onChangeText={(v) => set('career', v)}
              placeholder="Meslek ara…"
              popularLabel="Popüler meslekler"
              options={CAREERS}
              color={meta.color}
            />
          ) : null}

          {step === 'highSchool' ? (
            <SearchPicker
              value={form.highSchool}
              onChangeText={(v) => set('highSchool', v)}
              placeholder="Lise ara…"
              popularLabel="Seçkin liseler"
              options={HIGH_SCHOOLS}
              color={meta.color}
            />
          ) : null}

          {step === 'university' ? (
            <SearchPicker
              value={form.university}
              onChangeText={(v) => set('university', v)}
              placeholder="Üniversite ara…"
              popularLabel="Popüler üniversiteler"
              options={UNIVERSITIES}
              color={meta.color}
            />
          ) : null}

          {step === 'department' ? (
            <SearchPicker
              value={form.department}
              onChangeText={(v) => set('department', v)}
              placeholder="Bölüm ara…"
              popularLabel="Popüler bölümler"
              options={DEPARTMENTS}
              color={meta.color}
            />
          ) : null}

          {step === 'disciplineMeaning' ? (
            <CheckList
              options={DISCIPLINE_MEANINGS}
              values={form.disciplineMeaning}
              onToggle={(v) => toggleMulti('disciplineMeaning', v)}
              color={meta.color}
            />
          ) : null}

          {step === 'dailyHours' ? (
            <GridOptionList
              options={DAILY_HOURS}
              value={form.dailyHours}
              onSelect={(v) => set('dailyHours', v)}
            />
          ) : null}

          {step === 'commitmentDuration' ? (
            <GridOptionList
              options={COMMITMENT_DURATIONS}
              value={form.commitmentDuration}
              onSelect={(v) => set('commitmentDuration', v)}
            />
          ) : null}

          {step === 'motivation' ? (
            <GridCheckList
              options={MOTIVATIONS}
              values={form.motivation}
              onToggle={(v) => toggleMulti('motivation', v)}
            />
          ) : null}

          {step === 'summary' ? (
            <View style={styles.summaryCard}>
              <SummaryRow icon="school" label="Sınıf" value={form.grade} />
              <SummaryRow icon="trophy" label="Hedefin" value={form.goal} />
              <SummaryRow icon="briefcase" label="Meslek Hayali" value={form.career} />
              <SummaryRow icon="time" label="Günlük Çalışma" value={form.dailyHours} />
              <SummaryRow
                icon="shield-checkmark"
                label="Disiplin"
                value={form.disciplineMeaning.join(', ')}
              />
              <SummaryRow
                icon="calendar"
                label="Devam Süresi"
                value={form.commitmentDuration}
              />
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Space.md }]}>
        <OnboardingPrimaryButton
          label={
            saving
              ? 'Kaydediliyor…'
              : step === 'summary'
                ? 'Yolculuğa Başla →'
                : 'Devam Et →'
          }
          disabled={!valid || saving}
          onPress={next}
        />
      </View>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIconCircle}>
        <Ionicons name={icon} size={20} color={OnboardingPalette.accent} />
      </View>
      <View style={styles.flex}>
        <Txt variant="tiny" color={OnboardingPalette.textFaint}>
          {label.toUpperCase()}
        </Txt>
        <Txt variant="bodyStrong" color={OnboardingPalette.text} numberOfLines={2}>
          {value || '—'}
        </Txt>
      </View>
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
    paddingBottom: Space.sm,
  },
  content: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    gap: Space.lg,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  body: {
    gap: Space.md,
  },
  welcomeCard: {
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    ...OnboardingCardShadow,
  },
  footer: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.bg,
  },
  summaryCard: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OnboardingPalette.border,
    backgroundColor: OnboardingPalette.surface,
    ...OnboardingCardShadow,
  },
  summaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: OnboardingPalette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
