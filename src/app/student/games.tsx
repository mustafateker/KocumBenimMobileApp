import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PressScale } from '@/components/button';
import { Confetti } from '@/components/confetti';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, Pill, ProgressBar, Txt } from '@/components/ui';
import { todayMinutes } from '@/db/repo';
import { GAMES, type GameMeta } from '@/features/games/catalog';
import { gameGate, Rules } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import { OnColor, Palette, Radius, Space, softOf } from '@/theme/tokens';

export default function GameRoom() {
  const db = useSQLiteContext();
  const student = useStudent();

  const [minutes, setMinutes] = useState(0);
  const [celebrate, setCelebrate] = useState(0);

  /** Kilit bu ekranda ilk kez acildiginda bir kez konfeti patlatiriz. */
  const celebratedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      todayMinutes(db, student.id).then((m) => {
        setMinutes(m);
        if (m >= Rules.gameUnlockMinutes && !celebratedRef.current) {
          celebratedRef.current = true;
          setCelebrate((c) => c + 1);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      });
    }, [db, student.id])
  );

  const gate = gameGate(minutes);

  return (
    <>
      <Screen tint={gate.unlocked ? Palette.green : Palette.purple}>
        <ScreenHeader
          title="Zeka Molası"
          subtitle={
            gate.unlocked
              ? 'Hakkını verdin, oyun zamanı.'
              : 'Önce odaklan, sonra oyna. Kilitler kendiliğinden açılır.'
          }
        />

        {/* Kilit durumu */}
        <Card accent={gate.unlocked ? Palette.green : Palette.purple} style={styles.gateCard}>
          <IconBubble
            name={gate.unlocked ? 'lock-open' : 'lock-closed'}
            color={gate.unlocked ? Palette.green : Palette.purple}
            size={52}
          />
          <View style={styles.flex}>
            <Txt variant="section" color={gate.unlocked ? Palette.green : Palette.text}>
              {gate.unlocked ? 'Oyun odası açık' : `${gate.remainingMinutes} dakika kaldı`}
            </Txt>
            <Txt variant="small" color={Palette.textDim}>
              Bugün {minutes} / {Rules.gameUnlockMinutes} dk odaklandın
            </Txt>
            <View style={styles.gateBar}>
              <ProgressBar
                progress={gate.progress}
                color={gate.unlocked ? Palette.green : Palette.purple}
              />
            </View>
          </View>
        </Card>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} unlocked={gate.unlocked} remaining={gate.remainingMinutes} />
          ))}
        </View>

        <Card style={styles.noteCard}>
          <Ionicons name="information-circle" size={18} color={Palette.textFaint} />
          <Txt variant="small" color={Palette.textDim} style={styles.flex}>
            Oyunlar her gün yeniden kilitlenir. Günlük odak hedefini tutturduğunda tekrar açılır.
          </Txt>
        </Card>
      </Screen>

      <Confetti trigger={celebrate} />
    </>
  );
}

function GameCard({
  game,
  unlocked,
  remaining,
}: {
  game: GameMeta;
  unlocked: boolean;
  remaining: number;
}) {
  const router = useRouter();
  const [nudge, setNudge] = useState(false);
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const onPress = useCallback(() => {
    if (unlocked) {
      router.push({ pathname: '/game/[id]', params: { id: game.id } });
      return;
    }

    // Kilitliyken dokunulunca kilit titrer ve ne kadar kaldigini soyler.
    setNudge(true);
    // Reanimated paylasilan degerleri mutasyon icin tasarlandi.
    // eslint-disable-next-line react-hooks/immutability
    shake.value = withSequence(
      withTiming(-7, { duration: 50 }),
      withTiming(7, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setTimeout(() => setNudge(false), 2200);
  }, [unlocked, router, game.id, shake]);

  return (
    <PressScale onPress={onPress} style={styles.gridItem} scaleTo={0.97}>
      <Animated.View
        style={[
          styles.gameCard,
          shakeStyle,
          unlocked
            ? { backgroundColor: softOf(game.color), borderColor: game.color + '66' }
            : styles.gameCardLocked,
        ]}
      >
        <View style={styles.gameTop}>
          <View
            style={[
              styles.gameIcon,
              { backgroundColor: unlocked ? game.color + '26' : Palette.bgDeep },
            ]}
          >
            <Ionicons
              name={game.icon}
              size={26}
              color={unlocked ? game.color : Palette.textFaint}
            />
          </View>
          {!unlocked ? (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={Palette.textFaint} />
            </View>
          ) : null}
        </View>

        <Txt variant="section" color={unlocked ? Palette.text : Palette.textDim}>
          {game.title}
        </Txt>
        <Txt variant="tiny" color={unlocked ? Palette.textDim : Palette.textFaint}>
          {unlocked ? game.tagline : game.skill}
        </Txt>

        {nudge ? (
          <View style={styles.nudge}>
            <Txt variant="tiny" color={OnColor}>
              Hedefine {remaining} dk kaldı!
            </Txt>
          </View>
        ) : unlocked ? (
          <Pill label="Oyna" color={game.color} icon="play" style={styles.playPill} />
        ) : null}
      </Animated.View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  gateBar: {
    marginTop: Space.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },
  gameCard: {
    minHeight: 176,
    gap: 4,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  gameCardLocked: {
    backgroundColor: Palette.surfaceHi,
    borderColor: Palette.border,
  },
  gameTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gameIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgDeep,
  },
  playPill: {
    marginTop: Space.sm,
  },
  nudge: {
    marginTop: Space.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Space.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Palette.pink,
  },
  noteCard: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
    paddingVertical: Space.md,
  },
});
