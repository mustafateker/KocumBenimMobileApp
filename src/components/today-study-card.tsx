import { useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { Border, DetailAccent, Elevation, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

type TodayStudyCardProps = {
  pomodoroMinutes: number;
  questionsSolved: number;
  correctCount: number;
};

export function TodayStudyCard({
  pomodoroMinutes,
  questionsSolved,
  correctCount,
}: TodayStudyCardProps) {
  const router = useRouter();

  // Soldan kayarak acilma animasyonu
  const translateX = useSharedValue(-36);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 14, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 350 });
  }, [translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const hasActivity = pomodoroMinutes > 0 || questionsSolved > 0 || correctCount > 0;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <PressScale onPress={() => router.push('/stats')} scaleTo={0.98}>
        <View
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel="Bugünün çalışma istatistikleri ve detaylı raporlar"
        >
          {/* Ust Baslik ve Rapor Butonu */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconChip}>
                <Calendar size={14} color={DetailAccent} strokeWidth={2.2} />
              </View>
              <Txt variant="smallStrong" color={Palette.text}>
                Bugünün Çalışması
              </Txt>
            </View>

            <View style={styles.reportBadge}>
              <Txt variant="tiny" color={DetailAccent} style={styles.reportBadgeText}>
                Raporlar
              </Txt>
              <ChevronRight size={13} color={DetailAccent} strokeWidth={2.4} />
            </View>
          </View>

          {/* Istatistik Kolonlari: Pomodoro, Soru, Dogru */}
          <View style={styles.statsRow}>
            {/* 1. Pomodoro */}
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <Timer size={15} color={DetailAccent} strokeWidth={2.2} />
                <Txt variant="tiny" color={Palette.textDim}>
                  Pomodoro
                </Txt>
              </View>
              <Txt variant="bodyStrong" color={Palette.text}>
                {pomodoroMinutes} dk
              </Txt>
            </View>

            <View style={styles.divider} />

            {/* 2. Soru */}
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <BookOpen size={15} color={DetailAccent} strokeWidth={2.2} />
                <Txt variant="tiny" color={Palette.textDim}>
                  Soru
                </Txt>
              </View>
              <Txt variant="bodyStrong" color={Palette.text}>
                {questionsSolved}
              </Txt>
            </View>

            <View style={styles.divider} />

            {/* 3. Dogru */}
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <CheckCircle2 size={15} color={DetailAccent} strokeWidth={2.2} />
                <Txt variant="tiny" color={Palette.textDim}>
                  Doğru
                </Txt>
              </View>
              <Txt variant="bodyStrong" color={Palette.text}>
                {correctCount}
              </Txt>
            </View>
          </View>

          {/* Alt Bilgi / Motive Edici Cizgi */}
          <View style={styles.footerRow}>
            {hasActivity ? (
              <>
                <Sparkles size={12} color={DetailAccent} strokeWidth={2} />
                <Txt variant="tiny" color={Palette.textDim} numberOfLines={1} style={styles.footerText}>
                  İstikrarlı ilerliyorsun · Detaylar için dokun
                </Txt>
              </>
            ) : (
              <>
                <Target size={12} color={Palette.textFaint} strokeWidth={2} />
                <Txt variant="tiny" color={Palette.textFaint} numberOfLines={1} style={styles.footerText}>
                  Günün ilk oturumunu başlat ve serini koru
                </Txt>
              </>
            )}
          </View>
        </View>
      </PressScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Space.sm,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.lg,
    gap: Space.md,
    ...Elevation.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: pillRadius(22),
    backgroundColor: Palette.surfaceHi,
  },
  reportBadgeText: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
  },
  footerText: {
    flex: 1,
  },
});
