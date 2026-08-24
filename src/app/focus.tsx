import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { GhostButton, NeonButton } from '@/components/button';
import { FocusRing } from '@/components/focus-ring';
import { ScreenBackground } from '@/components/screen';
import { Txt } from '@/components/ui';
import { logSession } from '@/db/repo';
import { clockFormat } from '@/lib/date';
import { useSession, useStudent } from '@/lib/session';
import { useFocusTimer } from '@/lib/use-focus-timer';
import { Palette, Space } from '@/theme/tokens';

/**
 * Tam ekran odak modu.
 *
 * Calisma suresince ekranda yalnizca geri sayim ve iki dugme bulunur; durum
 * cubugu ve Android gezinme cubugu gizlenir, ekran uyumaz. Bu, dikkat dagitan
 * her seyi kapatmak icindir — ancak baska uygulamalarin acilir bildirimlerini
 * engellemek sistemin "Rahatsiz Etmeyin" iznini gerektirir; bir Expo Go
 * uygulamasi bu izni kendi kendine alamaz.
 */
export default function Focus() {
  const router = useRouter();
  const db = useSQLiteContext();
  const student = useStudent();
  const { refresh } = useSession();

  const { seconds } = useLocalSearchParams<{ seconds?: string }>();
  const plannedSec = Math.max(60, Number(seconds) || 25 * 60);

  const [result, setResult] = useState<{ minutes: number; xp: number } | null>(null);
  const startedRef = useRef(false);

  useKeepAwake();

  const handleComplete = useCallback(
    async (info: { plannedSec: number; actualSec: number; startedAt: string }) => {
      const reward = await logSession(db, {
        studentId: student.id,
        plannedSec: info.plannedSec,
        actualSec: info.actualSec,
        startedAt: info.startedAt,
      });
      setResult(reward);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      await refresh();
    },
    [db, student.id, refresh]
  );

  const timer = useFocusTimer({ onComplete: handleComplete });

  // Ekran acilir acilmaz sayaci baslat. Efekt icinde, cunku render saf kalmali.
  const { start } = timer;
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start(plannedSec);
  }, [start, plannedSec]);

  const finishEarly = useCallback(() => {
    // 30 saniyeden kisa oturumlar kaydedilmez; o durumda ozet gostermeden
    // dogrudan cikariz. stop() gecen sureyi dondurdugu icin state'in
    // guncellenmesini beklemeye gerek yok.
    const elapsed = timer.stop();
    if (elapsed < 30) router.back();
  }, [timer, router]);

  if (result) {
    return (
      <ScreenBackground tint={Palette.green}>
        <StatusBar hidden />
        {Platform.OS === 'android' ? <NavigationBar hidden /> : null}
        <View style={styles.center}>
          <Txt variant="hero" center color={Palette.green}>
            {result.minutes} dk
          </Txt>
          <Txt variant="section" center>
            Odaklandın
          </Txt>
          <Txt variant="body" color={Palette.textDim} center style={styles.gap}>
            +{result.xp} XP kazandın
          </Txt>
          <NeonButton
            label="Bitir"
            color={Palette.green}
            size="lg"
            onPress={() => router.back()}
            style={styles.gap}
          />
        </View>
      </ScreenBackground>
    );
  }

  const paused = timer.status === 'paused';

  return (
    <ScreenBackground tint={Palette.purple}>
      <StatusBar hidden />
      {Platform.OS === 'android' ? <NavigationBar hidden /> : null}

      <View style={styles.center}>
        <FocusRing progress={timer.progress} color={Palette.purple} size={300} strokeWidth={18}>
          <Txt variant="timer" style={styles.bigTimer}>
            {clockFormat(timer.remainingSec)}
          </Txt>
          {paused ? (
            <Txt variant="small" color={Palette.textDim}>
              duraklatıldı
            </Txt>
          ) : null}
        </FocusRing>

        <View style={styles.controls}>
          <GhostButton
            label={paused ? 'Devam et' : 'Duraklat'}
            icon={paused ? 'play' : 'pause'}
            color={Palette.purple}
            onPress={paused ? timer.resume : timer.pause}
            style={styles.flex}
            full
          />
          <GhostButton
            label="Bitir"
            icon="stop"
            color={Palette.pink}
            onPress={finishEarly}
            style={styles.flex}
            full
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xl,
    gap: Space.xxl,
  },
  bigTimer: {
    fontSize: 64,
    lineHeight: 72,
  },
  controls: {
    flexDirection: 'row',
    gap: Space.md,
    alignSelf: 'stretch',
  },
  gap: {
    marginTop: Space.md,
  },
});
