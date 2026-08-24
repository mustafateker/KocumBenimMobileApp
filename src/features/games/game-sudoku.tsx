import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

import {
  conflicts,
  generatePuzzle,
  isComplete,
  remainingCells,
  type Board,
  type Difficulty,
} from './logic-sudoku';

const DIFFICULTIES: Difficulty[] = ['kolay', 'orta', 'zor'];

type Cell = { row: number; col: number } | null;

export function GameSudoku() {
  const { width } = useWindowDimensions();
  const [difficulty, setDifficulty] = useState<Difficulty>('kolay');
  const [puzzle, setPuzzle] = useState(() => generatePuzzle('kolay'));
  const [board, setBoard] = useState<Board>(() => puzzle.board.map((r) => [...r]));
  const [selected, setSelected] = useState<Cell>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const boardSize = Math.min(width - Space.lg * 2, 380);
  const cellSize = boardSize / 9;

  const flags = useMemo(() => conflicts(board), [board]);
  const done = useMemo(() => isComplete(board), [board]);
  const left = remainingCells(board);

  const restart = useCallback((level: Difficulty) => {
    const next = generatePuzzle(level);
    setDifficulty(level);
    setPuzzle(next);
    setBoard(next.board.map((r) => [...r]));
    setSelected(null);
    setHintsUsed(0);
  }, []);

  const write = useCallback(
    (value: number) => {
      if (!selected) return;
      const { row, col } = selected;
      if (puzzle.fixed[row][col]) return;

      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        // Ayni sayiya tekrar basmak hucreyi temizler.
        next[row][col] = next[row][col] === value ? 0 : value;
        return next;
      });
    },
    [selected, puzzle.fixed]
  );

  const erase = useCallback(() => {
    if (!selected) return;
    const { row, col } = selected;
    if (puzzle.fixed[row][col]) return;
    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = 0;
      return next;
    });
  }, [selected, puzzle.fixed]);

  const hint = useCallback(() => {
    if (!selected) return;
    const { row, col } = selected;
    if (puzzle.fixed[row][col]) return;

    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = puzzle.solution[row][col];
      return next;
    });
    setHintsUsed((h) => h + 1);
  }, [selected, puzzle]);

  return (
    <View style={styles.wrap}>
      {/* Zorluk */}
      <View style={styles.levels}>
        {DIFFICULTIES.map((d) => {
          const active = d === difficulty;
          return (
            <PressScale key={d} onPress={() => restart(d)} style={styles.flex} scaleTo={0.97}>
              <View style={[styles.level, active && styles.levelActive]}>
                <Txt variant="smallStrong" color={active ? OnColor : Palette.textDim}>
                  {d}
                </Txt>
              </View>
            </PressScale>
          );
        })}
      </View>

      {/* Tahta */}
      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {board.map((row, r) => (
          <View key={r} style={styles.boardRow}>
            {row.map((value, c) => {
              const isFixed = puzzle.fixed[r][c];
              const isSelected = selected?.row === r && selected?.col === c;
              const inScope =
                selected !== null &&
                (selected.row === r ||
                  selected.col === c ||
                  (Math.floor(selected.row / 3) === Math.floor(r / 3) &&
                    Math.floor(selected.col / 3) === Math.floor(c / 3)));
              const sameValue = value !== 0 && selected !== null && board[selected.row][selected.col] === value;
              const bad = flags[r][c];

              return (
                <Pressable
                  key={c}
                  onPress={() => setSelected({ row: r, col: c })}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      borderRightWidth: c % 3 === 2 && c !== 8 ? 2 : 1,
                      borderBottomWidth: r % 3 === 2 && r !== 8 ? 2 : 1,
                    },
                    inScope && styles.cellScope,
                    sameValue && styles.cellSame,
                    isSelected && styles.cellSelected,
                  ]}
                >
                  <Txt
                    variant="section"
                    color={bad ? Palette.pink : isFixed ? Palette.text : Palette.purple}
                    style={isFixed ? styles.fixedText : undefined}
                  >
                    {value === 0 ? '' : String(value)}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Durum */}
      {done ? (
        <Txt variant="section" color={Palette.green} center>
          Bitti! {hintsUsed > 0 ? `${hintsUsed} ipucu kullandın.` : 'Hem de ipuçsuz.'}
        </Txt>
      ) : (
        <Txt variant="small" color={Palette.textDim} center>
          {left} hücre kaldı{hintsUsed > 0 ? ` · ${hintsUsed} ipucu` : ''}
        </Txt>
      )}

      {/* Tuş takımı */}
      <View style={styles.pad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <PressScale key={n} onPress={() => write(n)} scaleTo={0.9} style={styles.padItem}>
            <View style={styles.padKey}>
              <Txt variant="section" color={Palette.purple}>
                {n}
              </Txt>
            </View>
          </PressScale>
        ))}
      </View>

      <View style={styles.actions}>
        <GhostButton label="Sil" icon="backspace-outline" onPress={erase} style={styles.flex} full />
        <GhostButton
          label="İpucu"
          icon="bulb-outline"
          color={Palette.gold}
          onPress={hint}
          style={styles.flex}
          full
        />
      </View>

      <NeonButton
        label="Yeni bulmaca"
        icon="refresh"
        color={Palette.blue}
        onPress={() => restart(difficulty)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    alignItems: 'center',
    gap: Space.md,
  },
  levels: {
    flexDirection: 'row',
    gap: Space.sm,
    alignSelf: 'stretch',
  },
  level: {
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelActive: {
    backgroundColor: Palette.blue,
    borderColor: Palette.blue,
  },
  board: {
    borderWidth: 2,
    borderColor: Palette.text,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Palette.surface,
  },
  boardRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Palette.border,
    borderRightColor: Palette.text,
    borderBottomColor: Palette.text,
  },
  cellScope: {
    backgroundColor: Palette.bg,
  },
  cellSame: {
    backgroundColor: Palette.purpleSoft,
  },
  cellSelected: {
    backgroundColor: Palette.blueSoft,
  },
  fixedText: {
    fontFamily: 'Poppins_700Bold',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
    alignSelf: 'stretch',
  },
  padItem: {
    width: '10.5%',
    flexGrow: 1,
  },
  padKey: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Space.md,
    alignSelf: 'stretch',
  },
});
