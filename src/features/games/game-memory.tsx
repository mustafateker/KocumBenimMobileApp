import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { NeonButton, PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { clockFormat } from '@/lib/date';
import { Palette, Radius, Space } from '@/theme/tokens';

/** Emoji yerine harf cifleri: sade ve her cihazda ayni gorunuyor. */
const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type Card = {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
};

function deal(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  // Fisher-Yates
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
}

export function GameMemory() {
  const { width } = useWindowDimensions();
  const [cards, setCards] = useState<Card[]>(deal);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  /** Acik duran (henuz eslesmemis) kartlarin indexleri. */
  const openRef = useRef<number[]>([]);
  const lockRef = useRef(false);

  const board = Math.min(width - Space.lg * 2, 400);
  const gap = Space.sm;
  const cell = (board - gap * 3) / 4;

  const won = cards.every((c) => c.matched);

  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  const restart = useCallback(() => {
    openRef.current = [];
    lockRef.current = false;
    setCards(deal());
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }, []);

  const flip = useCallback(
    (index: number) => {
      if (lockRef.current) return;

      setCards((prev) => {
        const card = prev[index];
        if (card.flipped || card.matched) return prev;

        const next = prev.map((c, i) => (i === index ? { ...c, flipped: true } : c));
        openRef.current = [...openRef.current, index];

        if (openRef.current.length === 2) {
          const [a, b] = openRef.current;
          setMoves((m) => m + 1);

          if (next[a].symbol === next[b].symbol) {
            openRef.current = [];
            return next.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
          }

          // Eslesmedi: kisa bir sure gosterip geri kapat.
          lockRef.current = true;
          setTimeout(() => {
            setCards((current) =>
              current.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
            );
            openRef.current = [];
            lockRef.current = false;
          }, 700);
        }

        return next;
      });

      setRunning(true);
    },
    []
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.statsRow}>
        <Stat label="Hamle" value={String(moves)} color={Palette.purple} />
        <Stat label="Süre" value={clockFormat(seconds)} color={Palette.blue} />
        <Stat label="Eşleşen" value={`${cards.filter((c) => c.matched).length / 2}/8`} color={Palette.green} />
      </View>

      <View style={[styles.board, { width: board, gap }]}>
        {cards.map((card, index) => {
          const face = card.flipped || card.matched;
          return (
            <PressScale
              key={card.id}
              onPress={() => flip(index)}
              disabled={face}
              scaleTo={0.92}
            >
              <View
                style={[
                  styles.card,
                  { width: cell, height: cell },
                  face && styles.cardOpen,
                  card.matched && styles.cardMatched,
                ]}
              >
                <Txt variant="title">{face ? card.symbol : '?'}</Txt>
              </View>
            </PressScale>
          );
        })}
      </View>

      {won ? (
        <View style={styles.note}>
          <Txt variant="section" color={Palette.green} center>
            Hepsini buldun!
          </Txt>
          <Txt variant="small" color={Palette.textDim} center>
            {moves} hamle · {clockFormat(seconds)}
          </Txt>
        </View>
      ) : (
        <Txt variant="small" color={Palette.textDim} center>
          Kartlara dokun, eşleri bul.
        </Txt>
      )}

      <NeonButton label="Yeniden karıştır" icon="shuffle" color={Palette.green} onPress={restart} />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { borderColor: color + '55' }]}>
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
  statsRow: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  stat: {
    minWidth: 96,
    alignItems: 'center',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Palette.surface,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgDeep,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cardOpen: {
    backgroundColor: Palette.surface,
    borderColor: Palette.purple + '66',
  },
  cardMatched: {
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.green,
  },
  note: {
    alignItems: 'center',
    gap: 2,
  },
});
