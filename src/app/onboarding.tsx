import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhostButton, NeonButton } from '@/components/button';
import { PatternBackground } from '@/components/pattern-background';
import { IconBubble, TextField, Txt } from '@/components/ui';
import { completeOnboarding } from '@/lib/api';
import {
  ALL_STEPS,
  CAREERS,
  COMMITMENT_DURATIONS,
  DAILY_HOURS,
  DEPARTMENTS,
  DISCIPLINE_MEANINGS,
  GOALS,
  GRADES,
  HIGH_SCHOOLS,
  LISE_GRADES,
  LISE_ONCESI_GRADES,
  MOTIVATIONS,
  STEP_META,
  UNIVERSITIES,
  progressCheer,
  type StepKey,
} from '@/features/onboarding/data';
import {
  CheckList,
  OptionList,
  SearchPicker,
  StepHeader,
  StepProgress,
} from '@/features/onboarding/parts';
import { useSession, useStudent } from '@/lib/session';
import { Accent, Border, DetailAccent, Palette, Radius, Space } from '@/theme/tokens';

type FormState = {
  firstName: string;
  lastName: string;
  grade: string;
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

/** Bu adimlarda icerik ScrollView icinde dikeyde ortalanir. */
const CENTERED_STEPS = new Set<StepKey>(['welcome', 'name']);

/**
 * "Ilk Kurulum" sihirbazi — kayittan hemen sonra ogrenciyi taniyip hedeflerini
 * kaydeder. Tek ekran, adimlar arasinda index ile gezinir; lise hedefi 1-8,
 * universite ve bolum hedefleri ise 9-12. sinif icin gosterilir.
 */
export default function Onboarding() {
  // Ogrenci disi rolde ekran acilirsa erken hata firlatir (bkz. useStudent tanimi).
  useStudent();
  const { setUser } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

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
  const meta = STEP_META[step];

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

  const valid = useMemo(() => {
    switch (step) {
      case 'welcome':
        return true;
      case 'name':
        return form.firstName.trim().length > 0 && form.lastName.trim().length > 0;
      case 'grade':
        return form.grade !== '';
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
  }, [step, form]);

  const finish = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await completeOnboarding({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        grade: form.grade,
        goal: form.goal.trim(),
        career: form.career.trim(),
        targetHighSchool: isLiseOncesi ? form.highSchool.trim() : '',
        targetUniversity: isLise ? form.university.trim() : '',
        targetDepartment: isLise ? form.department.trim() : '',
        dailyHours: form.dailyHours,
        disciplineMeaning: form.disciplineMeaning,
        commitmentDuration: form.commitmentDuration,
        motivation: form.motivation,
      });
      // updated.onboardingCompletedAt burada dolu gelir; ayri bir GET /me
      // atmiyoruz ki o istegin sessizce yutulan bir hatasi (bkz session.tsx
      // refresh()) zaten basarili olmus bu islemi geciktirip kullaniciyi
      // /student -> onboarding yonlendirme dongusune sokmasin.
      setUser(updated);
      router.replace('/student');
    } finally {
      setSaving(false);
    }
  }, [saving, form, isLiseOncesi, isLise, setUser, router]);

  const next = useCallback(() => {
    if (!valid) return;
    if (step === 'summary') {
      finish();
      return;
    }
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }, [valid, step, finish, steps.length]);

  const back = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Root'ta padding yok: dekoratif zemin mutlak konumlu ve mutlak cocuklar
  // ebeveynin padding kutusuna gore yerlesir; padding burada olsaydi desen
  // durum cubugu kadar asagi kayardi. Guvenli alan boslugunu ilk cocuk verir.
  return (
    <View style={styles.root}>
      <PatternBackground color={meta.color} />

      <View style={[styles.progressWrap, { paddingTop: insets.top + Space.sm }]}>
        <StepProgress
          index={index}
          total={steps.length}
          color={meta.color}
          icon={meta.icon}
          cheer={progressCheer((index + 1) / steps.length)}
        />
      </View>

      {/* Android edge-to-edge modunda pencere klavye icin kucultulmuyor;
          odaklanan alani yukari kaydirma isini bu bilesen ustleniyor. */}
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
              <Txt variant="body" color={Palette.textDim} center>
                Sınıfını, hedeflerini ve çalışma tarzını öğrenip sana özel bir yolculuk
                hazırlayacağız. Hazırsan başlayalım!
              </Txt>
            ) : null}

            {step === 'name' ? (
              <View style={styles.body}>
                <View style={styles.field}>
                  <Txt variant="smallStrong" color={Palette.textDim}>
                    Adın
                  </Txt>
                  <TextField
                    value={form.firstName}
                    onChangeText={(v) => set('firstName', v)}
                    placeholder="Adını yaz"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.field}>
                  <Txt variant="smallStrong" color={Palette.textDim}>
                    Soyadın
                  </Txt>
                  <TextField
                    value={form.lastName}
                    onChangeText={(v) => set('lastName', v)}
                    placeholder="Soyadını yaz"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            ) : null}

            {step === 'grade' ? (
              <OptionList options={GRADES} value={form.grade} onSelect={(v) => set('grade', v)} color={meta.color} />
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
              <OptionList
                options={DAILY_HOURS}
                value={form.dailyHours}
                onSelect={(v) => set('dailyHours', v)}
                color={meta.color}
              />
            ) : null}

            {step === 'commitmentDuration' ? (
              <OptionList
                options={COMMITMENT_DURATIONS}
                value={form.commitmentDuration}
                onSelect={(v) => set('commitmentDuration', v)}
                color={meta.color}
              />
            ) : null}

            {step === 'motivation' ? (
              <CheckList
                options={MOTIVATIONS}
                values={form.motivation}
                onToggle={(v) => toggleMulti('motivation', v)}
                color={meta.color}
              />
            ) : null}

            {step === 'summary' ? (
              <View style={styles.summaryCard}>
                <SummaryRow icon="school" color={DetailAccent} label="Sınıf" value={form.grade} />
                <SummaryRow icon="trophy" color={DetailAccent} label="Hedefin" value={form.goal} />
                <SummaryRow icon="briefcase" color={DetailAccent} label="Meslek Hayali" value={form.career} />
                <SummaryRow
                  icon="time"
                  color={DetailAccent}
                  label="Günlük Çalışma"
                  value={form.dailyHours}
                />
                <SummaryRow
                  icon="shield-checkmark"
                  color={DetailAccent}
                  label="Disiplin"
                  value={form.disciplineMeaning.join(', ')}
                />
                <SummaryRow
                  icon="calendar"
                  color={DetailAccent}
                  label="Devam Süresi"
                  value={form.commitmentDuration}
                />
              </View>
            ) : null}
          </View>
      </KeyboardAwareScrollView>

      {/* Ileri/Geri butonlari klavyenin arkasinda kalmasin diye onun ustune biner. */}
      <KeyboardStickyView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + Space.md }]}>
          <View style={styles.footerRow}>
            {index > 0 ? (
              <GhostButton label="Geri" icon="chevron-back" onPress={back} style={styles.flex} full />
            ) : null}
            <NeonButton
              label={step === 'summary' ? 'Başlayalım!' : 'İleri'}
              icon={step === 'summary' ? 'checkmark' : 'arrow-forward'}
              color={Accent}
              size="lg"
              disabled={!valid || saving}
              onPress={next}
              style={styles.flex}
              full
            />
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

function SummaryRow({
  icon,
  color,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof IconBubble>['name'];
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <IconBubble name={icon} color={color} size={44} />
      <View style={styles.flex}>
        <Txt variant="tiny" color={Palette.textFaint}>
          {label.toUpperCase()}
        </Txt>
        <Txt variant="bodyStrong" numberOfLines={2}>
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
    backgroundColor: Palette.bg,
  },
  progressWrap: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.sm,
  },
  content: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    gap: Space.xl,
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  body: {
    gap: Space.md,
  },
  field: {
    gap: 6,
  },
  footer: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: Border.thick,
    borderTopColor: Palette.border,
    backgroundColor: Palette.bg,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Space.md,
  },
  summaryCard: {
    gap: Space.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: Border.thick,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
});
