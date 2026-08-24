import type { Ionicons } from '@expo/vector-icons';

import { Palette } from '@/theme/tokens';

export type GameId = '2048' | 'sudoku' | 'memory';

export type GameMeta = {
  id: GameId;
  title: string;
  tagline: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  /** Oyunun hangi zihinsel beceriyi calistirdigi — kilit ekraninda gosterilir. */
  skill: string;
};

export const GAMES: GameMeta[] = [
  {
    id: '2048',
    title: '2048',
    tagline: 'Kaydır, birleştir, 2048’e ulaş',
    icon: 'grid',
    color: Palette.orange,
    skill: 'Sayı örüntüsü ve planlama',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    tagline: 'Her satır, sütun ve kutuda 1-9',
    icon: 'apps',
    color: Palette.blue,
    skill: 'Mantık yürütme ve eleme',
  },
  {
    id: 'memory',
    title: 'Hafıza',
    tagline: 'Eşleri bul, süreyi kır',
    icon: 'copy',
    color: Palette.green,
    skill: 'Görsel hafıza ve dikkat',
  },
];

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
