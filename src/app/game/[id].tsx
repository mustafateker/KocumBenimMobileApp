import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/button';
import { ScreenBackground } from '@/components/screen';
import { EmptyState, Txt } from '@/components/ui';
import { todayMinutes } from '@/db/repo';
import { getGame } from '@/features/games/catalog';
import { Game2048 } from '@/features/games/game-2048';
import { GameMemory } from '@/features/games/game-memory';
import { GameSudoku } from '@/features/games/game-sudoku';
import { gameGate } from '@/lib/gamification';
import { useStudent } from '@/lib/session';
import { Palette, Space } from '@/theme/tokens';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const student = useStudent();
  const insets = useSafeAreaInsets();

  const game = getGame(id ?? '');
  const [gate, setGate] = useState<ReturnType<typeof gameGate> | null>(null);

  useEffect(() => {
    todayMinutes(db, student.id).then((m) => setGate(gameGate(m)));
  }, [db, student.id]);

  return (
    <ScreenBackground tint={game?.color ?? Palette.purple}>
      <View style={[styles.header, { paddingTop: insets.top + Space.sm }]}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <View style={styles.headerText}>
          <Txt variant="section">{game ? game.title : 'Oyun'}</Txt>
          {game ? (
            <Txt variant="tiny" color={Palette.textDim}>
              {game.skill}
            </Txt>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <GameBody id={id} unlocked={gate?.unlocked ?? null} remaining={gate?.remainingMinutes ?? 0} />
      </ScrollView>
    </ScreenBackground>
  );
}

function GameBody({
  id,
  unlocked,
  remaining,
}: {
  id?: string;
  /** null: kilit durumu henuz okunmadi */
  unlocked: boolean | null;
  remaining: number;
}) {
  if (unlocked === null) return null;

  if (!unlocked) {
    return (
      <EmptyState
        icon="lock-closed"
        title="Bu oyun henüz kilitli"
        subtitle={`Hedefine ${remaining} dakika kaldı. Odaklan, kilit kendiliğinden açılacak.`}
        color={Palette.purple}
      />
    );
  }

  switch (id) {
    case '2048':
      return <Game2048 />;
    case 'sudoku':
      return <GameSudoku />;
    case 'memory':
      return <GameMemory />;
    default:
      return (
        <EmptyState
          icon="help-circle"
          title="Oyun bulunamadı"
          subtitle="Bu bağlantı artık geçerli değil."
        />
      );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
  },
  headerText: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Space.lg,
  },
});
