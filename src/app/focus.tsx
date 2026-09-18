import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { PressScale } from '@/components/button';
import { Confetti } from '@/components/confetti';
import { FocusRing } from '@/components/focus-ring';
import { Txt } from '@/components/ui';
import { logFocusSession } from '@/lib/api';
import { clockFormat } from '@/lib/date';
import { useSession, useStudent } from '@/lib/session';
import { useFocusTimer } from '@/lib/use-focus-timer';
import { deepOf, OnColor, Palette, Space, Type, pillRadius } from '@/theme/tokens';

/**
 * Tam ekran odak modu — uc durum: calisiyor (mor), duraklatildi (turuncu —
 * zemin, halka rengi ve mesaj hep birlikte degisir), tamamlandi (mor->pembe,
 * konfeti), elle bitirildi (pembe, kaydedilmez).
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

  const confirmEnd = useCallback(() => {
    Alert.alert(
      'Odak süreni bitirmek istediğine emin misin?',
      'Süreni şimdi bitirirsen bu oturum kaydedilmeyecek ve XP kazanamayacaksın.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Odağı Bitir', style: 'destructive', onPress: endNow },
      ]
    );
  }, [endNow]);

  if (result) {
    return <SuccessScreen minutes={result.minutes} xp={result.xp} onDone={() => router.back()} />;
  }

  if (discarded) {
    return <DiscardedScreen onDone={() => router.back()} />;
  }

  const paused = timer.status === 'paused';
  const themeColor = paused ? Palette.orange : Palette.purple;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}
      <LinearGradient colors={[themeColor, deepOf(themeColor)]} style={StyleSheet.absoluteFill} />

      <View style={styles.center}>
        <View style={styles.pill}>
          <Ionicons name={paused ? 'cafe-outline' : 'timer-outline'} size={14} color={OnColor} />
          <Txt variant="tiny" color={OnColor}>
            {paused ? 'Mola' : 'Pomodoro'}
          </Txt>
        </View>

        <View style={styles.ringWrap}>
          <PulseGlow color={paused ? Palette.gold : OnColor} />
          <FocusRing
            progress={timer.progress}
            color={paused ? Palette.gold : OnColor}
            track="rgba(255,255,255,0.22)"
            size={280}
            strokeWidth={16}
          >
            <Txt style={styles.bigTimer}>{clockFormat(timer.remainingSec)}</Txt>
          </FocusRing>
        </View>

        {paused ? (
          <View style={styles.pausedNotice}>
            <Txt variant="bodyStrong" color={OnColor} center>
              Odak süreniz duraklatıldı ☕
            </Txt>
            <Txt variant="small" color="rgba(255,255,255,0.8)" center>
              Çayınızı alıp gelebilirsiniz, sizi bekliyoruz.
            </Txt>
          </View>
        ) : (
          <Txt variant="small" color="rgba(255,255,255,0.75)" center>
            Odak modundasın. Bildirimler devre dışı.
          </Txt>
        )}

        <View style={styles.controls}>
          <PressScale onPress={confirmEnd} scaleTo={0.92}>
            <View style={styles.endButton}>
              <Ionicons name="stop" size={20} color={OnColor} />
              <Txt variant="tiny" color={OnColor}>
                Bitir
              </Txt>
            </View>
          </PressScale>

          <PressScale onPress={paused ? timer.resume : timer.pause} scaleTo={0.92}>
            <View style={styles.pauseButton}>
              <Ionicons name={paused ? 'play' : 'pause'} size={30} color={themeColor} />
            </View>
          </PressScale>

          <View style={styles.endButtonSpacer} />
        </View>
      </View>
    </View>
  );
}

/** Halkanin arkasinda yavasca nefes alan dekoratif parilti — "havali loop" hissi. */
function PulseGlow({ color }: { color: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, false);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pulse.value * 0.2,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulseGlow, { backgroundColor: color }, animatedStyle]} />;
}

/* ------------------------------- basari ekrani ------------------------------ */

function SuccessScreen({ minutes, xp, onDone }: { minutes: number; xp: number; onDone: () => void }) {
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}
      <LinearGradient colors={[Palette.purple, Palette.pink]} style={StyleSheet.absoluteFill} />
      <Confetti trigger={1} />

      <View style={styles.center}>
        <View style={styles.starCircle}>
          <Ionicons name="star" size={44} color={Palette.gold} />
        </View>
        <Txt variant="hero" color={OnColor} center>
          Harika! 🎉
        </Txt>
        <Txt variant="body" color="rgba(255,255,255,0.85)" center>
          Odak süren tamamlandı. {minutes} dakika.
        </Txt>

        <View style={styles.xpChip}>
          <Txt variant="section" color={Palette.purple}>
            +{xp} XP
          </Txt>
        </View>

        <SolidButton label="Devam Et" color={Palette.purple} onPress={onDone} />
      </View>
    </View>
  );
}

/* ------------------------------ durduruldu ekrani ---------------------------- */

function DiscardedScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={[styles.root, { backgroundColor: Palette.pink }]}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}

      <View style={styles.center}>
        <View style={styles.starCircle}>
          <Ionicons name="alarm" size={40} color={Palette.pink} />
        </View>
        <Txt variant="title" color={OnColor} center>
          Odak süren bitirildi.
        </Txt>
        <Txt variant="body" color="rgba(255,255,255,0.85)" center>
          Süre kaydedilmedi.
        </Txt>

        <SolidButton label="Tamam" color={Palette.pink} onPress={onDone} style={styles.gapTop} />
      </View>
    </View>
  );
}

/** Renkli tam ekranlar uzerindeki beyaz zeminli birincil buton. */
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
      <View style={styles.solidButtonInner}>
        <Txt variant="section" color={color}>
          {label}
        </Txt>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.purple,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
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
    color: OnColor,
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
    backgroundColor: OnColor,
  },
  endButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
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
    backgroundColor: OnColor,
  },
  xpChip: {
    paddingHorizontal: Space.xl,
    height: 46,
    borderRadius: pillRadius(46),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnColor,
  },
  solidButton: {
    alignSelf: 'stretch',
  },
  solidButtonInner: {
    height: 56,
    borderRadius: pillRadius(56),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnColor,
    paddingHorizontal: Space.xl,
  },
  gapTop: {
    marginTop: Space.md,
  },
});
