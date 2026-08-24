import { useCallback, useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View, useWindowDimensions } from 'react-native';

import { NeonButton } from '@/components/button';
import { Txt } from '@/components/ui';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

import { isStuck, move, newGame, type Direction } from './logic-2048';

/** Tas degerine gore pastel renk. Buyuk sayilar doygunlasir. */
function tileStyle(value: number): { bg: string; fg: string } {
  switch (value) {
    case 0:
      return { bg: Palette.bgDeep, fg: 'transparent' };
    case 2:
      return { bg: Palette.purpleSoft, fg: Palette.text };
    case 4:
      return { bg: Palette.blueSoft, fg: Palette.text };
    case 8:
      return { bg: Palette.greenSoft, fg: Palette.text };
    case 16:
      return { bg: Palette.goldSoft, fg: Palette.text };
    case 32:
      return { bg: Palette.orangeSoft, fg: Palette.text };
    case 64:
      return { bg: Palette.pinkSoft, fg: Palette.text };
    case 128:
      return { bg: Palette.blue, fg: OnColor };
    case 256:
      return { bg: Palette.green, fg: OnColor };
    case 512:
      return { bg: Palette.orange, fg: OnColor };
    case 1024:
      return { bg: Palette.pink, fg: OnColor };
    default:
      return { bg: Palette.purple, fg: OnColor };
  }
}

export function Game2048({ onScore }: { onScore?: (score: number) => void }) {
  const { width } = useWindowDimensions();
  const [state, setState] = useState(newGame);
  const [best, setBest] = useState(0);

  const board = Math.min(width - Space.lg * 2, 420);
  const gap = Space.sm;
  const cell = (board - gap * 5) / 4;

  const apply = useCallback(
    (direction: Direction) => {
      setState((prev) => {
        const result = move(prev.grid, direction);
        if (!result.moved) return prev;

        const score = prev.score + result.gained;
        setBest((b) => Math.max(b, score));
        onScore?.(score);
        return { grid: result.grid, score };
      });
    },
    [onScore]
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 || Math.abs(g.dy) > 14,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > Math.abs(g.dy)) {
            apply(g.dx > 0 ? 'right' : 'left');
          } else {
            apply(g.dy > 0 ? 'down' : 'up');
          }
        },
      }),
    [apply]
  );

  const stuck = isStuck(state.grid);
  const won = state.grid.some((row) => row.some((v) => v >= 2048));

  return (
    <View style={styles.wrap}>
      <View style={styles.scoreRow}>
        <ScoreBox label="Puan" value={state.score} color={Palette.purple} />
        <ScoreBox label="En iyi" value={best} color={Palette.gold} />
      </View>

      <View
        style={[styles.board, { width: board, height: board, padding: gap, gap }]}
        {...responder.panHandlers}
      >
        {state.grid.map((row, r) => (
          <View key={r} style={[styles.row, { gap }]}>
            {row.map((value, c) => {
              const { bg, fg } = tileStyle(value);
              return (
                <View key={c} style={[styles.tile, { width: cell, height: cell, backgroundColor: bg }]}>
                  {value > 0 ? (
                    <Txt variant="title" color={fg} style={value >= 1000 ? styles.tileSmall : styles.tileText}>
                      {value}
                    </Txt>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {stuck || won ? (
        <View style={styles.note}>
          <Txt variant="section" center color={won ? Palette.green : Palette.pink}>
            {won ? '2048! Efsanesin' : 'Hamle kalmadı'}
          </Txt>
          <Txt variant="small" color={Palette.textDim} center>
            Puanın: {state.score}
          </Txt>
        </View>
      ) : (
        <Txt variant="small" color={Palette.textDim} center>
          Taşları birleştirmek için parmağını kaydır.
        </Txt>
      )}

      <NeonButton
        label="Yeniden başlat"
        icon="refresh"
        color={Palette.purple}
        onPress={() => setState(newGame())}
      />
    </View>
  );
}

function ScoreBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.scoreBox, { borderColor: color + '55' }]}>
      <Txt variant="tiny" color={Palette.textDim}>
        {label.toUpperCase()}
      </Txt>
      <Txt variant="section" color={color}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Space.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: Space.md,
  },
  scoreBox: {
    minWidth: 110,
    alignItems: 'center',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Palette.surface,
  },
  board: {
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.lg,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 28,
    lineHeight: 34,
  },
  tileSmall: {
    fontSize: 20,
    lineHeight: 26,
  },
  note: {
    alignItems: 'center',
    gap: 2,
  },
});
