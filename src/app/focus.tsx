import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { AppDialog } from '@/components/app-dialog';
import { PressScale } from '@/components/button';
import { FocusRing } from '@/components/focus-ring';
import { Txt } from '@/components/ui';
import { logFocusSession } from '@/lib/api';
import { clockFormat } from '@/lib/date';
import { useSession, useStudent } from '@/lib/session';
import { useFocusTimer } from '@/lib/use-focus-timer';
import { Accent, Border, OnColor, Palette, Space, Type, pillRadius, softOf } from '@/theme/tokens';

/**
 * Tam ekran odak modu. Calisma ve mola ayni koyu mor zemini korur; durum
 * yalnizca ikon ve halka ile anlatilir. Boylece kullanici duraklattiginda
 * bile tum ekran renk degistirip dikkat cekmez.
 *
 * Calisma suresince ekranda dikkat dagitici hicbir sey yok; durum cubugu ve
 * Android gezinme cubugu gizlenir, ekran uyumaz.
 */
export default function Focus() {
  const router = useRouter();
  useStudent();
  const { refresh } = useSession();

  const { seconds } = useLocalSearchParams<{ seconds?: string }>();
  const plannedSec = Math.max(60, Number(seconds) || 25 * 60);

  const [result, setResult] = useState<{ minutes: number; xp: number } | null>(null);
  const [discarded, setDiscarded] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const startedRef = useRef(false);

  useKeepAwake();

  const handleComplete = useCallback(
    async (info: { plannedSec: number; actualSec: number; startedAt: string }) => {
      try {
        const reward = await logFocusSession(info);
        setResult(reward);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        await refresh();
      } catch {
        // Sunucu cok kisa oturumu reddettiyse (SESSION_TOO_SHORT) ya da aglama
        // hatasi olduysa XP uydurmaktansa "kaydedilmedi" ekranini goster.
        setDiscarded(true);
      }
    },
    [refresh]
  );

  const timer = useFocusTimer({ onComplete: handleComplete });

  const { start } = timer;
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start(plannedSec);
  }, [start, plannedSec]);

  const endNow = useCallback(() => {
    timer.stop();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setDiscarded(true);
  }, [timer]);

  const confirmEnd = useCallback(() => setEndDialogOpen(true), []);

  if (result) {
    return <SuccessScreen minutes={result.minutes} xp={result.xp} onDone={() => router.back()} />;
  }

  if (discarded) {
    return <DiscardedScreen onDone={() => router.back()} />;
  }

  const paused = timer.status === 'paused';

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}

      <View style={styles.center}>
        <View style={styles.pill}>
          <Ionicons name={paused ? 'cafe-outline' : 'timer-outline'} size={14} color={Palette.text} />
          <Txt variant="tiny" color={Palette.text}>
            {paused ? 'Mola' : 'Pomodoro'}
          </Txt>
        </View>

        <View style={styles.ringWrap}>
          <PulseGlow color={Palette.orange} />
          <FocusRing
            progress={timer.progress}
            color={Palette.orange}
            track="rgba(245,239,241,0.22)"
            size={280}
            strokeWidth={16}
          >
            <Txt style={styles.bigTimer}>{clockFormat(timer.remainingSec)}</Txt>
          </FocusRing>
        </View>

        {paused ? (
          <View style={styles.pausedNotice}>
            <Txt variant="bodyStrong" color={Palette.bg} center>
              Odak süreniz duraklatıldı ☕
            </Txt>
            <Txt variant="small" color={Palette.bg} center>
              Çayınızı alıp gelebilirsiniz, sizi bekliyoruz.
            </Txt>
          </View>
        ) : (
          <Txt variant="small" color={Palette.bg} center>
            Odak modundasın. Bildirimler devre dışı.
          </Txt>
        )}

        <View style={styles.controls}>
          <PressScale onPress={confirmEnd} scaleTo={0.92}>
            <View style={styles.endButton}>
              <Ionicons name="stop" size={20} color={Palette.text} />
              <Txt variant="tiny" color={Palette.text}>
                Bitir
              </Txt>
            </View>
          </PressScale>

          <PressScale onPress={paused ? timer.resume : timer.pause} scaleTo={0.92}>
            <View style={styles.pauseButton}>
              <Ionicons name={paused ? 'play' : 'pause'} size={30} color={Palette.text} />
            </View>
          </PressScale>

          <View style={styles.endButtonSpacer} />
        </View>
      </View>

      <AppDialog
        visible={endDialogOpen}
        icon="stop-circle-outline"
        title="Odak süreni bitirmek istiyor musun?"
        message="Şimdi bitirirsen bu oturum kaydedilmeyecek ve XP kazanamayacaksın."
        cancelLabel="Devam Et"
        confirmLabel="Odağı Bitir"
        onCancel={() => setEndDialogOpen(false)}
        onConfirm={() => {
          setEndDialogOpen(false);
          endNow();
        }}
      />
    </View>
  );
}

/** Halkanin arkasinda cok hafif nefes alan durum geri bildirimi. */
function PulseGlow({ color }: { color: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, false);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.07 + pulse.value * 0.08,
    transform: [{ scale: 1 + pulse.value * 0.035 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulseGlow, { backgroundColor: color }, animatedStyle]} />;
}

/* ------------------------------- basari ekrani ------------------------------ */

function SuccessScreen({ minutes, xp, onDone }: { minutes: number; xp: number; onDone: () => void }) {
  return (
    <View style={[styles.root, styles.resultRoot]}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}
      <View style={styles.center}>
        <View style={[styles.starCircle, { backgroundColor: Palette.orange }]}>
          <Ionicons name="checkmark" size={44} color={Palette.green} />
        </View>
        <Txt variant="hero" center>
          Harika!
        </Txt>
        <Txt variant="body" color={Palette.textDim} center>
          Odak süren tamamlandı. {minutes} dakika.
        </Txt>

        <View style={styles.xpChip}>
          <Txt variant="section" color={Accent}>
            +{xp} XP
          </Txt>
        </View>

        <SolidButton label="Devam Et" color={Accent} onPress={onDone} />
      </View>
    </View>
  );
}

/* ------------------------------ durduruldu ekrani ---------------------------- */

function DiscardedScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={[styles.root, styles.resultRoot]}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}

      <View style={styles.center}>
        <View style={[styles.starCircle, { backgroundColor: Palette.orange }]}>
          <Ionicons name="alarm" size={40} color={Palette.pink} />
        </View>
        <Txt variant="title" center>
          Odak süren bitirildi.
        </Txt>
        <Txt variant="body" color={Palette.textDim} center>
          Süre kaydedilmedi.
        </Txt>

        <SolidButton label="Tamam" color={Palette.pink} onPress={onDone} style={styles.gapTop} />
      </View>
    </View>
  );
}

/** Sonuc ekranlarindaki yuksek kontrastli birincil buton. */
function SolidButton({
  label,
  color,
  onPress,
  style,
}: {
  label: string;
  color: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressScale onPress={onPress} style={[styles.solidButton, style]} hapticStyle={Haptics.ImpactFeedbackStyle.Medium}>
      <View style={[styles.solidButtonInner, { backgroundColor: color }]}>
        <Txt variant="section" color={OnColor}>
          {label}
        </Txt>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.focusBg,
  },
  resultRoot: {
    backgroundColor: Palette.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xl,
    gap: Space.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Space.lg,
    height: 32,
    borderRadius: pillRadius(32),
    backgroundColor: Palette.orange,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  bigTimer: {
    ...Type.timer,
    fontSize: 64,
    lineHeight: 72,
    color: Palette.orange,
  },
  pausedNotice: {
    gap: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xl,
  },
  pauseButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.orange,
  },
  endButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: Palette.surface,
  },
  endButtonSpacer: {
    width: 52,
  },
  starCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  xpChip: {
    paddingHorizontal: Space.xl,
    height: 46,
    borderRadius: pillRadius(46),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: softOf(Accent),
    borderWidth: Border.thin,
    borderColor: Palette.border,
  },
  solidButton: {
    alignSelf: 'stretch',
  },
  solidButtonInner: {
    height: 56,
    borderRadius: pillRadius(56),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xl,
  },
  gapTop: {
    marginTop: Space.md,
  },
});
