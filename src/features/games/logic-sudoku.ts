/**
 * Sudoku uretimi ve kural denetimi. Gorunumden ayri, saf fonksiyonlar.
 * 0 = bos hucre.
 */

export type Board = number[][];
export type Difficulty = 'kolay' | 'orta' | 'zor';

/** Zorluga gore bosaltilacak hucre sayisi (81 uzerinden). */
const BLANKS: Record<Difficulty, number> = { kolay: 36, orta: 46, zor: 54 };

function shuffled(values: number[]): number[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => new Array<number>(9).fill(0));
}

/** value, (row,col) hucresine Sudoku kurallarina gore konabilir mi? */
export function canPlace(board: Board, row: number, col: number, value: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === value) return false;
    if (i !== row && board[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false;
    }
  }
  return true;
}

/** Geri izlemeli cozucu. Tahtayi yerinde doldurur. */
function solve(board: Board, randomize = false): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;

      const candidates = randomize ? shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (const value of candidates) {
        if (!canPlace(board, r, c, value)) continue;
        board[r][c] = value;
        if (solve(board, randomize)) return true;
        board[r][c] = 0;
      }
      return false;
    }
  }
  return true;
}

export function generateSolved(): Board {
  const board = emptyBoard();
  solve(board, true);
  return board;
}

/**
 * Cozum sayisini `limit`'e kadar sayar. Tek cozumlu bulmaca uretmek icin
 * kullanilir: birden fazla cozumu olan bir sudoku bozuk sayilir.
 */
function countSolutions(board: Board, limit = 2): number {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;

      let found = 0;
      for (let value = 1; value <= 9; value++) {
        if (!canPlace(board, r, c, value)) continue;
        board[r][c] = value;
        found += countSolutions(board, limit - found);
        board[r][c] = 0;
        if (found >= limit) return found;
      }
      return found;
    }
  }
  return 1;
}

export type Puzzle = {
  /** Oynanacak tahta — bos hucreler 0 */
  board: Board;
  /** Tam cozum, ipucu ve dogrulama icin */
  solution: Board;
  /** Baslangicta dolu gelen (degistirilemez) hucreler */
  fixed: boolean[][];
};

export function generatePuzzle(difficulty: Difficulty = 'kolay'): Puzzle {
  const solution = generateSolved();
  const board = solution.map((row) => [...row]);

  // Hucreleri rastgele sirayla bosalt; ancak bulmaca tek cozumlu kaldigi
  // surece. Aksi halde sayiyi geri koyariz.
  const cells = shuffled(Array.from({ length: 81 }, (_, i) => i));
  let removed = 0;
  for (const index of cells) {
    if (removed >= BLANKS[difficulty]) break;

    const r = Math.floor(index / 9);
    const c = index % 9;
    if (board[r][c] === 0) continue;

    const backup = board[r][c];
    board[r][c] = 0;
    if (countSolutions(board.map((row) => [...row])) === 1) {
      removed++;
    } else {
      board[r][c] = backup;
    }
  }

  return {
    board,
    solution,
    fixed: board.map((row) => row.map((v) => v !== 0)),
  };
}

/** Kural ihlali olan hucreler — arayuz bunlari kirmizi gosterir. */
export function conflicts(board: Board): boolean[][] {
  const flags = Array.from({ length: 9 }, () => new Array<boolean>(9).fill(false));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = board[r][c];
      if (value !== 0 && !canPlace(board, r, c, value)) flags[r][c] = true;
    }
  }
  return flags;
}

export function isComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
      if (!canPlace(board, r, c, board[r][c])) return false;
    }
  }
  return true;
}

/** Kalan bos hucre sayisi — ilerleme gostergesi icin. */
export function remainingCells(board: Board): number {
  return board.reduce((sum, row) => sum + row.filter((v) => v === 0).length, 0);
}
