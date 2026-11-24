import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { Screen, ScreenHeader } from '@/components/screen';
import { Typography } from '@/components/typography';
import { Card, Pill, ProgressBar } from '@/components/ui';
import { getSummary } from '@/lib/api';
import { humanDuration } from '@/lib/date';
import { useErrorDialog } from '@/lib/error-dialog';
import {
  getLevelInfo,
  LEVEL_CHARACTERS,
  LEVEL_DEFINITIONS,
  Rules,
} from '@/lib/gamification';
import { getExamTrack } from '@/lib/mock-exams';
import { useSession, useStudent } from '@/lib/session';
import { useSubscription } from '@/lib/subscription';
import type { Student, StudentSummary } from '@/lib/types';
import {
  Accent,
  Border,
  DetailAccent,
  OnColor,
  Palette,
  Radius,
  Space,
} from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type DreamMeta = {
  icon: IconName;
  label: string;
  pick: (s: Student) => string | null | undefined;
  accentColor: string;
  softColor: string;
};

const DREAM_ITEMS: DreamMeta[] = [
  {
    icon: 'briefcase',
    label: 'Hedef Mesleğim',
    pick: (s) => s.career,
    accentColor: Palette.blue,
    softColor: Palette.blueSoft,
  },
  {
    icon: 'business',
    label: 'Hedef Lisem',
    pick: (s) => s.targetHighSchool,
    accentColor: DetailAccent,
    softColor: Palette.goldSoft,
  },
  {
    icon: 'school',
    label: 'Hedef Üniversitem',
    pick: (s) => s.targetUniversity,
    accentColor: Accent,
    softColor: Palette.surfaceHi,
  },
  {
    icon: 'book',
    label: 'Hedef Bölümüm',
    pick: (s) => s.targetDepartment,
    accentColor: Palette.green,
    softColor: Palette.greenSoft,
  },
];

export default function Profile() {
  const router = useRouter();
  const student = useStudent();
  const { refresh } = useSession();
  const { showError } = useErrorDialog();
  const { isPro, presentPaywall } = useSubscription();

  const { journey } = useLocalSearchParams<{ journey?: string }>();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [internalJourneyOpen, setInternalJourneyOpen] = useState<boolean | null>(null);
  const journeyOpen = internalJourneyOpen ?? (journey === '1');

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        getSummary().then(setSummary),
        refresh(),
      ]);
    } catch (err) {
      showError(err, { title: 'Profil yüklenemedi', code: 'SUMMARY_LOAD' });
    }
  }, [refresh, showError]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getSummary().then(setSummary),
        refresh(),
      ]);
    } catch {
      // sessizce devam
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const isLgs = getExamTrack(student.grade) === 'lgs';

  // Kademeye göre hedefler: Ortaokul için Lise ve Meslek, Lise için Üniversite, Bölüm ve Meslek
  const dreams = useMemo(() => {
    return DREAM_ITEMS.filter((item) => {
      if (isLgs && (item.label === 'Hedef Üniversitem' || item.label === 'Hedef Bölümüm')) {
        return false;
      }
      if (!isLgs && item.label === 'Hedef Lisem') {
        return false;
      }
      return true;
    })
      .map((item) => ({ ...item, value: item.pick(student) }))
      .filter((item) => item.value && item.value.trim().length > 0);
  }, [isLgs, student]);

  const discipline = student.disciplineMeaning ?? [];
  const motivation = student.motivationSources ?? [];

  // Seviye ve XP Hesaplaması (gamification kuralları)
  const xp = student.xp || 0;
  const levelInfo = useMemo(() => getLevelInfo(xp), [xp]);

  const gamificationState = student.gamification;
  const decayWarning = gamificationState?.decayWarning;
  const isShieldActive = gamificationState?.decayStatus === 'shield_active' || (gamificationState?.shieldDaysLeft ?? 0) > 0;

  return (
    <Screen
      tint={Accent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Accent} colors={[Accent]} />
      }
    >
      <ScreenHeader
        title="Profilim"
        subtitle="Öğrenci kimliğin, hedeflerin ve başarın"
        left={<MenuButton />}
        right={<NotificationBell />}
      />

      {/* Hero Karakter & İlerleme Kartı */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          {/* Avatar: Seviye Karakteri Görseli */}
          <PressScale onPress={() => setInternalJourneyOpen(true)} scaleTo={0.93}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarSquircle}>
                <Image
                  source={levelInfo.character}
                  style={styles.characterAvatarImage}
                  contentFit="contain"
                  priority="high"
                />
              </View>
              <View style={styles.avatarBadge}>
                <Typography.Tiny color={OnColor} weight="bold" style={styles.levelBadgeText}>
                  {levelInfo.level}
                </Typography.Tiny>
              </View>
            </View>
          </PressScale>

          {/* İsim & Rozetler */}
          <View style={styles.heroInfoCol}>
            <Typography.Title color={Palette.text} numberOfLines={1}>
              {student.nickname ?? student.name}
            </Typography.Title>

            {/* Karakter Ünvanı */}
            <PressScale onPress={() => setInternalJourneyOpen(true)} scaleTo={0.96}>
              <View style={styles.characterTitleChip}>
                <Ionicons name="sparkles" size={13} color={DetailAccent} />
                <Typography.SmallStrong color={DetailAccent}>
                  {levelInfo.title}
                </Typography.SmallStrong>
                <Ionicons name="chevron-forward" size={12} color={DetailAccent} />
              </View>
            </PressScale>

            <View style={styles.heroPillsRow}>
              {student.grade ? (
                <Pill label={student.grade} color={Accent} icon="school-outline" />
              ) : null}

              {student.streak > 0 ? (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={14} color={DetailAccent} />
                  <Typography.SmallStrong color={DetailAccent}>
                    {student.streak} Günlük Seri
                  </Typography.SmallStrong>
                </View>
              ) : null}

              {levelInfo.stars > 0 ? (
                <View style={styles.starBadge}>
                  <Ionicons name="star" size={12} color={Palette.gold} />
                  <Typography.Tiny color={Palette.gold} weight="bold">
                    {levelInfo.stars} Yıldız
                  </Typography.Tiny>
                </View>
              ) : null}

              {isPro ? (
                <View style={styles.proPillBadge}>
                  <Ionicons name="sparkles" size={11} color={Palette.bg} />
                  <Typography.Tiny color={Palette.bg} weight="bold">
                    PRO
                  </Typography.Tiny>
                </View>
              ) : (
                <PressScale onPress={() => void presentPaywall()} scaleTo={0.96}>
                  <View style={styles.proUpgradeBadge}>
                    <Ionicons name="diamond-outline" size={11} color={Accent} />
                    <Typography.Tiny color={Accent} weight="bold">
                      {"Pro'ya Geç"}
                    </Typography.Tiny>
                  </View>
                </PressScale>
              )}
            </View>
          </View>
        </View>

        {/* Zirve Savunması & Erime / Kalkan Bildirimi */}
        {decayWarning ? (
          <View style={[styles.defenseBanner, isShieldActive ? styles.shieldBanner : styles.decayAlertBanner]}>
            <Ionicons
              name={isShieldActive ? 'shield-checkmark' : 'shield-outline'}
              size={16}
              color={isShieldActive ? Palette.green : Palette.gold}
            />
            <Typography.Tiny color={Palette.text} style={styles.defenseBannerText}>
              {decayWarning}
            </Typography.Tiny>
          </View>
        ) : null}

        {/* Seviye & XP İlerleme Çubuğu */}
        <PressScale onPress={() => setInternalJourneyOpen(true)} scaleTo={0.98}>
          <View style={styles.levelProgressBox}>
            <View style={styles.levelLabelsRow}>
              <View style={styles.levelTitleWrap}>
                <Ionicons name="trophy-outline" size={14} color={DetailAccent} />
                <Typography.SmallStrong color={Palette.text} numberOfLines={1}>
                  Seviye {levelInfo.level} · {levelInfo.title}
                </Typography.SmallStrong>
              </View>
              <Typography.Tiny color={Palette.textDim} numberOfLines={1}>
                {levelInfo.isMaxLevel && levelInfo.stars >= 3
                  ? 'Efsane Zirve'
                  : `${levelInfo.currentLevelXp}/${levelInfo.nextLevelXp - levelInfo.floorXp} XP`}
              </Typography.Tiny>
            </View>
            <ProgressBar
              progress={levelInfo.progressPercent}
              height={7}
              color={DetailAccent}
              track={Palette.surfaceHi}
            />
          </View>
        </PressScale>
      </Card>

      {/* Koçum Pro Tanıtım Kartı */}
      {!isPro ? (
        <PressScale onPress={() => void presentPaywall()} scaleTo={0.98}>
          <Card accent={Accent} style={styles.proBannerCard}>
            <View style={styles.proBannerRow}>
              <View style={styles.proBannerIconWrap}>
                <Ionicons name="sparkles" size={20} color={Accent} />
              </View>
              <View style={styles.flex}>
                <Typography.BodyStrong color={Palette.text}>
                  Koçum Pro Avantajları
                </Typography.BodyStrong>
                <Typography.Tiny color={Palette.textDim}>
                  Sınırsız yapay zeka koçluğu, reklamsız deneyim ve aylık 60 adet görsel soru çözümü.
                </Typography.Tiny>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} />
            </View>
          </Card>
        </PressScale>
      ) : null}

      {/* Bento Grid: Haftalık Performans */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Typography.Section color={Palette.text}>
            Haftalık Performans
          </Typography.Section>
          <PressScale onPress={() => router.push('/stats')} scaleTo={0.96}>
            <View style={styles.sectionAction}>
              <Typography.SmallStrong color={DetailAccent}>
                Tüm Raporlar
              </Typography.SmallStrong>
              <Ionicons name="chevron-forward" size={14} color={DetailAccent} />
            </View>
          </PressScale>
        </View>

        <PressScale onPress={() => router.push('/stats')} scaleTo={0.99}>
          <View style={styles.bentoGrid}>
            {/* Bento Kutu 1: Toplam XP */}
            <Card style={styles.bentoCard}>
              <View style={[styles.bentoIconBubble, { backgroundColor: Palette.goldSoft }]}>
                <Ionicons name="sparkles" size={18} color={DetailAccent} />
              </View>
              <Typography.Section color={Palette.text} style={styles.bentoValue}>
                {xp}
              </Typography.Section>
              <Typography.Tiny color={Palette.textDim}>
                Toplam XP
              </Typography.Tiny>
            </Card>

            {/* Bento Kutu 2: Odak Süresi */}
            <Card style={styles.bentoCard}>
              <View style={[styles.bentoIconBubble, { backgroundColor: Palette.blueSoft }]}>
                <Ionicons name="time-outline" size={18} color={Palette.blue} />
              </View>
              <Typography.Section color={Palette.text} style={styles.bentoValue} numberOfLines={1}>
                {humanDuration((summary?.weekMinutes ?? 0) * 60)}
              </Typography.Section>
              <Typography.Tiny color={Palette.textDim}>
                Odak Süresi
              </Typography.Tiny>
            </Card>

            {/* Bento Kutu 3: Tamamlanan Görev */}
            <Card style={styles.bentoCard}>
              <View style={[styles.bentoIconBubble, { backgroundColor: Palette.greenSoft }]}>
                <Ionicons name="checkmark-done" size={18} color={Palette.green} />
              </View>
              <Typography.Section color={Palette.text} style={styles.bentoValue}>
                {summary?.tasksDone ?? 0}/{summary?.tasksTotal ?? 0}
              </Typography.Section>
              <Typography.Tiny color={Palette.textDim}>
                Görev Başarısı
              </Typography.Tiny>
            </Card>
          </View>
        </PressScale>
      </View>

      {/* Raporlar & Analizler Geçiş Kartı */}
      <PressScale onPress={() => router.push('/stats')} scaleTo={0.98}>
        <Card style={styles.reportsBanner}>
          <View style={styles.reportsIconBox}>
            <Ionicons name="stats-chart" size={20} color={DetailAccent} />
          </View>
          <View style={styles.reportsInfo}>
            <Typography.BodyStrong color={Palette.text}>
              Çalışma Raporları & Analizler
            </Typography.BodyStrong>
            <Typography.Tiny color={Palette.textDim}>
              Konu eksikleri, haftalık odak ve net başarı grafikleri
            </Typography.Tiny>
          </View>
          <View style={styles.reportsArrowCircle}>
            <Ionicons name="chevron-forward" size={16} color={DetailAccent} />
          </View>
        </Card>
      </PressScale>

      {/* En Büyük Hedefim Kartı */}
      {student.goal ? (
        <Card style={styles.goalCard}>
          <View style={styles.goalHeaderRow}>
            <View style={styles.goalIconBox}>
              <Ionicons name="compass" size={16} color={DetailAccent} />
            </View>
            <Typography.Caption color={DetailAccent} weight="bold" style={styles.goalEyebrow}>
              EN BÜYÜK HEDEFİM
            </Typography.Caption>
          </View>
          <Typography.Section color={Palette.text} style={styles.goalText}>
            {student.goal}
          </Typography.Section>
        </Card>
      ) : null}

      {/* Hayallerim (2x2 Bento Düzeni) */}
      {dreams.length > 0 ? (
        <View style={styles.section}>
          <Typography.Section color={Palette.text}>
            Gelecek Hayallerim
          </Typography.Section>

          <View style={styles.dreamsGrid}>
            {dreams.map((item) => (
              <Card key={item.label} style={styles.dreamCard}>
                <View style={[styles.dreamIconBox, { backgroundColor: item.softColor }]}>
                  <Ionicons name={item.icon} size={18} color={item.accentColor} />
                </View>
                <View style={styles.dreamContent}>
                  <Typography.Tiny color={Palette.textDim} numberOfLines={1}>
                    {item.label}
                  </Typography.Tiny>
                  <Typography.BodyStrong color={Palette.text} numberOfLines={2}>
                    {item.value}
                  </Typography.BodyStrong>
                </View>
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      {/* Disiplin ve Motivasyon Pusulam */}
      {discipline.length > 0 || motivation.length > 0 ? (
        <View style={styles.section}>
          <Typography.Section color={Palette.text}>
            Çalışma Pusulam
          </Typography.Section>

          <Card style={styles.compassCard}>
            {discipline.length > 0 ? (
              <View style={styles.compassBlock}>
                <View style={styles.compassSubhead}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={Accent} />
                  <Typography.SmallStrong color={Palette.text}>
                    Disiplin Benim İçin
                  </Typography.SmallStrong>
                </View>
                <View style={styles.pillsWrap}>
                  {discipline.map((item) => (
                    <Pill key={item} label={item} color={Accent} />
                  ))}
                </View>
              </View>
            ) : null}

            {discipline.length > 0 && motivation.length > 0 ? (
              <View style={styles.compassDivider} />
            ) : null}

            {motivation.length > 0 ? (
              <View style={styles.compassBlock}>
                <View style={styles.compassSubhead}>
                  <Ionicons name="star-outline" size={15} color={DetailAccent} />
                  <Typography.SmallStrong color={Palette.text}>
                    Beni Motive Edenler
                  </Typography.SmallStrong>
                </View>
                <View style={styles.pillsWrap}>
                  {motivation.map((item) => (
                    <Pill key={item} label={item} color={DetailAccent} />
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        </View>
      ) : null}

      {/* Hızlı Menü & Ayarlar */}
      <Card style={styles.shortcutsCard}>
        <PressScale onPress={() => router.push('/settings')} scaleTo={0.98}>
          <View style={styles.shortcutRow}>
            <View style={styles.shortcutLeft}>
              <View style={[styles.shortcutIconBox, { backgroundColor: Palette.surfaceHi }]}>
                <Ionicons name="settings-outline" size={18} color={Palette.text} />
              </View>
              <View>
                <Typography.BodyStrong color={Palette.text}>
                  Hesap & Tercihler
                </Typography.BodyStrong>
                <Typography.Tiny color={Palette.textDim}>
                  Bildirimler, parola ve sınav sayacı ayarları
                </Typography.Tiny>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textDim} />
          </View>
        </PressScale>

        <View style={styles.shortcutDivider} />

        <PressScale onPress={() => router.push('/help')} scaleTo={0.98}>
          <View style={styles.shortcutRow}>
            <View style={styles.shortcutLeft}>
              <View style={[styles.shortcutIconBox, { backgroundColor: Palette.surfaceHi }]}>
                <Ionicons name="help-circle-outline" size={18} color={Palette.text} />
              </View>
              <View>
                <Typography.BodyStrong color={Palette.text}>
                  Yardım & Destek
                </Typography.BodyStrong>
                <Typography.Tiny color={Palette.textDim}>
                  Sık sorulan sorular ve kullanım rehberi
                </Typography.Tiny>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textDim} />
          </View>
        </PressScale>
      </Card>

      {/* Seviye Yolculuğu ve Karakterler Modalı */}
      <Modal
        visible={journeyOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setInternalJourneyOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setInternalJourneyOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Typography.Title color={Palette.text}>
                  Seviye Yolculuğu
                </Typography.Title>
                <Typography.Tiny color={Palette.textDim}>
                  Sınav hazırlık maratonunda her basamak yeni bir unvan kazandırır
                </Typography.Tiny>
              </View>
              <PressScale onPress={() => setInternalJourneyOpen(false)} scaleTo={0.9}>
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={Palette.text} />
                </View>
              </PressScale>
            </View>

            <ScrollView
              contentContainerStyle={styles.journeyList}
              showsVerticalScrollIndicator={false}
            >
              {LEVEL_DEFINITIONS.map((def) => {
                const isCurrent = def.level === levelInfo.level;
                const isUnlocked = xp >= def.cumulativeXp;
                const charImg = LEVEL_CHARACTERS[def.level] || LEVEL_CHARACTERS[1];

                return (
                  <View
                    key={def.level}
                    style={[
                      styles.journeyItemCard,
                      isCurrent && styles.journeyItemActive,
                      !isUnlocked && styles.journeyItemLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.journeyThumbWrap,
                        isCurrent && styles.journeyThumbWrapActive,
                      ]}
                    >
                      <Image
                        source={charImg}
                        style={[
                          styles.journeyThumbImg,
                          !isUnlocked && styles.journeyThumbImgLocked,
                        ]}
                        contentFit="contain"
                      />
                    </View>

                    <View style={styles.journeyInfoWrap}>
                      <View style={styles.journeyTitleRow}>
                        <Typography.BodyStrong
                          color={isCurrent ? DetailAccent : Palette.text}
                        >
                          Seviye {def.level} · {def.title}
                        </Typography.BodyStrong>
                        {isCurrent ? (
                          <View style={styles.currentBadge}>
                            <Typography.Tiny color={OnColor} weight="bold">
                              Aktif
                            </Typography.Tiny>
                          </View>
                        ) : isUnlocked ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={Palette.green}
                          />
                        ) : (
                          <Ionicons
                            name="lock-closed"
                            size={14}
                            color={Palette.textDim}
                          />
                        )}
                      </View>
                      <Typography.Tiny color={Palette.textDim}>
                        {def.stage}
                      </Typography.Tiny>
                      <Typography.Tiny
                        color={isUnlocked ? DetailAccent : Palette.textDim}
                        weight="bold"
                      >
                        {def.cumulativeXp === 0
                          ? 'Başlangıç'
                          : `${def.cumulativeXp.toLocaleString('tr-TR')} XP`}
                      </Typography.Tiny>
                    </View>
                  </View>
                );
              })}

              {/* Kurallar Özeti Kartı */}
              <View style={styles.rulesCard}>
                <Typography.SmallStrong color={Palette.text}>
                  XP Kazanım & Savunma Kuralları
                </Typography.SmallStrong>
                <View style={styles.ruleItem}>
                  <Ionicons name="time" size={14} color={DetailAccent} />
                  <Typography.Tiny color={Palette.textDim} style={styles.ruleText}>
                    Odaklanma: 25 dk Pomodoro = {Rules.xpPerPomodoro} XP (Maks: {Rules.maxDailyPomodoroXp} XP/gün)
                  </Typography.Tiny>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="checkbox" size={14} color={Palette.green} />
                  <Typography.Tiny color={Palette.textDim} style={styles.ruleText}>
                    Görev ve Soru: Günlük hedef = {Rules.xpPerQuestionTarget} XP, Hata analizi = {Rules.xpPerErrorAnalysis} XP
                  </Typography.Tiny>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="flame" size={14} color={DetailAccent} />
                  <Typography.Tiny color={Palette.textDim} style={styles.ruleText}>
                    Giriş & Streak: Günlük check-in = {Rules.xpDailyCheckin} XP (7 gün+ %10, 30 gün+ %20 bonus)
                  </Typography.Tiny>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="trophy" size={14} color={Palette.gold} />
                  <Typography.Tiny color={Palette.textDim} style={styles.ruleText}>
                    Haftalık Deneme: {Rules.xpBonusTrialExam} XP, 7 Gün Seri Bonusu: {Rules.xpBonusStreak7} XP
                  </Typography.Tiny>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="shield-checkmark" size={14} color={Palette.blue} />
                  <Typography.Tiny color={Palette.textDim} style={styles.ruleText}>
                    Günlük Tavan: Maksimum {Rules.dailyHardCap} XP/gün. Seviye 10 Şampiyonluk Kalkanı ve erime koruması devrededir.
                  </Typography.Tiny>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Hero Karakter Kartı
  heroCard: {
    padding: Space.lg,
    borderRadius: Radius.xl,
    gap: Space.md,
    backgroundColor: Palette.surface,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarSquircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 174, 117, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 174, 117, 0.35)',
    overflow: 'hidden',
  },
  characterAvatarImage: {
    width: 70,
    height: 70,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: DetailAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  levelBadgeText: {
    fontSize: 11,
    lineHeight: 12,
  },
  heroInfoCol: {
    flex: 1,
    gap: 6,
  },
  characterTitleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(251, 174, 117, 0.16)',
    borderWidth: Border.thin,
    borderColor: 'rgba(251, 174, 117, 0.32)',
  },
  heroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Space.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(251, 174, 117, 0.14)',
    borderWidth: Border.thin,
    borderColor: 'rgba(251, 174, 117, 0.28)',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Palette.goldSoft,
    borderWidth: Border.thin,
    borderColor: Palette.gold,
  },
  defenseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    paddingVertical: Space.xs,
    paddingHorizontal: Space.sm,
    borderRadius: Radius.md,
    borderWidth: Border.thin,
  },
  shieldBanner: {
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.green,
  },
  decayAlertBanner: {
    backgroundColor: Palette.goldSoft,
    borderColor: Palette.gold,
  },
  defenseBannerText: {
    flex: 1,
    lineHeight: 16,
  },
  levelProgressBox: {
    paddingTop: Space.xs,
    gap: 6,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  levelLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  levelTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },

  // Bento İstatistik Kartları
  section: {
    gap: Space.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  bentoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space.md,
    paddingHorizontal: Space.xs,
    borderRadius: Radius.lg,
    gap: 4,
  },
  bentoIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bentoValue: {
    textAlign: 'center',
  },

  // Raporlar Banner
  reportsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.md,
    borderRadius: Radius.lg,
    gap: Space.md,
  },
  reportsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportsInfo: {
    flex: 1,
    gap: 2,
  },
  reportsArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // En Büyük Hedef Kartı
  goalCard: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    gap: Space.sm,
    backgroundColor: '#FFFDF9',
    borderColor: 'rgba(251, 174, 117, 0.35)',
    borderWidth: 1.2,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  goalIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEyebrow: {
    letterSpacing: 1.1,
  },
  goalText: {
    lineHeight: 24,
  },

  // Hayallerim Bento Izgarası
  dreamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  dreamCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.md,
    borderRadius: Radius.lg,
    gap: Space.sm,
  },
  dreamIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamContent: {
    flex: 1,
    gap: 2,
  },

  // Çalışma Pusulam Kartı
  compassCard: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    gap: Space.md,
  },
  compassBlock: {
    gap: Space.sm,
  },
  compassSubhead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compassDivider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.xs,
  },

  // Hızlı Menü & Ayarlar
  shortcutsCard: {
    padding: Space.sm,
    borderRadius: Radius.lg,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.sm,
  },
  shortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    flex: 1,
  },
  shortcutIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutDivider: {
    height: 1,
    backgroundColor: Palette.border,
    marginHorizontal: Space.sm,
  },

  // Seviye Yolculuğu Modal Stilleri
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '85%',
    paddingBottom: Space.xl,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.border,
    alignSelf: 'center',
    marginTop: Space.sm,
    marginBottom: Space.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderBottomWidth: Border.thin,
    borderBottomColor: Palette.border,
  },
  modalTitleBlock: {
    flex: 1,
    gap: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space.sm,
  },
  journeyList: {
    padding: Space.lg,
    gap: Space.sm,
  },
  journeyItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    gap: Space.md,
  },
  journeyItemActive: {
    backgroundColor: '#FFF8F1',
    borderColor: DetailAccent,
    borderWidth: 1.5,
  },
  journeyItemLocked: {
    opacity: 0.55,
  },
  journeyThumbWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  journeyThumbWrapActive: {
    borderColor: DetailAccent,
    backgroundColor: 'rgba(251, 174, 117, 0.2)',
  },
  journeyThumbImg: {
    width: 48,
    height: 48,
  },
  journeyThumbImgLocked: {
    tintColor: 'gray',
  },
  journeyInfoWrap: {
    flex: 1,
    gap: 2,
  },
  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentBadge: {
    backgroundColor: DetailAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  rulesCard: {
    marginTop: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    gap: Space.xs,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.xs,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    lineHeight: 16,
  },
  proPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Accent,
  },
  proUpgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Accent + '18',
    borderWidth: Border.thin,
    borderColor: Accent + '40',
  },
  flex: {
    flex: 1,
  },
  proBannerCard: {
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thick,
    borderColor: Accent + '50',
  },
  proBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  proBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
