import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/button';
import { Confetti } from '@/components/confetti';
import { FocusRing } from '@/components/focus-ring';
import { Txt } from '@/components/ui';
import { logFocusSession } from '@/lib/api';
import { clockFormat } from '@/lib/date';
import { useSession, useStudent } from '@/lib/session';
import { useFocusTimer } from '@/lib/use-focus-timer';
import { OnColor, Palette, Radius, Space, Type } from '@/theme/tokens';

/**
 * Tam ekran odak modu — uc durum: calisiyor/duraklatildi (mor), tamamlandi
 * (mor->pembe, konfeti), elle durduruldu (pembe, kaydedilmez).
 *
 * Calisma suresince ekranda dikkat dagitici hicbir sey yok; durum cubugu ve
 * Android gezinme cubugu gizlenir, ekran uyumaz.
 */
export default function Focus() {
  const router = useRouter();
  useStudent();
  const { refresh } = useSession();
  const insets = useSafeAreaInsets();

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

  const stopEarly = useCallback(() => {
    timer.stop();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setDiscarded(true);
  }, [timer]);

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
      <LinearGradient colors={[Palette.purple, '#5C4699']} style={StyleSheet.absoluteFill} />

      <PressScale onPress={stopEarly} style={[styles.close, { top: insets.top + Space.md }]}>
        <View style={styles.closeCircle}>
          <Ionicons name="close" size={20} color={OnColor} />
        </View>
      </PressScale>

      <View style={styles.center}>
        <View style={styles.pill}>
          <Ionicons name="timer-outline" size={14} color={OnColor} />
          <Txt variant="tiny" color={OnColor}>
            Pomodoro
          </Txt>
        </View>

        <FocusRing progress={timer.progress} color={OnColor} track="rgba(255,255,255,0.22)" size={280} strokeWidth={16}>
          <Txt style={styles.bigTimer}>{clockFormat(timer.remainingSec)}</Txt>
          {paused ? (
            <Txt variant="small" color="rgba(255,255,255,0.75)">
              duraklatıldı
            </Txt>
          ) : null}
        </FocusRing>

        <PressScale onPress={paused ? timer.resume : timer.pause} scaleTo={0.92}>
          <View style={styles.pauseButton}>
            <Ionicons name={paused ? 'play' : 'pause'} size={26} color={Palette.purple} />
          </View>
        </PressScale>

        <View style={styles.footerText}>
          <Txt variant="small" color="rgba(255,255,255,0.75)" center>
            Bildirimler devre dışı
          </Txt>
          <Txt variant="small" color="rgba(255,255,255,0.75)" center>
            {paused ? 'Duraklatıldı.' : 'Odak modundasın.'}
          </Txt>
        </View>
      </View>
    </View>
  );
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
    <View style={styles.root}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}
      <View style={[styles.root, { backgroundColor: Palette.pink }]} />

      <View style={styles.center}>
        <View style={styles.starCircle}>
          <Ionicons name="alarm" size={40} color={Palette.pink} />
        </View>
        <Txt variant="title" color={OnColor} center>
          Odak süren durduruldu.
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
  close: {
    position: 'absolute',
    left: Space.lg,
    zIndex: 1,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
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
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bigTimer: {
    ...Type.timer,
    fontSize: 64,
    lineHeight: 72,
    color: OnColor,
  },
  pauseButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnColor,
  },
  footerText: {
    gap: 2,
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
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnColor,
  },
  solidButton: {
    alignSelf: 'stretch',
  },
  solidButtonInner: {
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnColor,
    paddingHorizontal: Space.xl,
  },
  gapTop: {
    marginTop: Space.md,
  },
});
