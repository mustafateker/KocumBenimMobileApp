/**
 * 2048'in saf mantigi — gorunumden ayri tutuldu ki test edilebilsin.
 */

export const SIZE = 4;
export type Grid = number[][];
export type Direction = 'left' | 'right' | 'up' | 'down';

export function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => new Array<number>(SIZE).fill(0));
}

export function emptyCells(grid: Grid): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) out.push([r, c]);
    }
  }
  return out;
}

export function spawn(grid: Grid): Grid {
  const cells = emptyCells(grid);
  if (cells.length === 0) return grid;

  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function newGame(): { grid: Grid; score: number } {
  return { grid: spawn(spawn(emptyGrid())), score: 0 };
}

/** Tek bir satiri sola kaydirip birlestirir. Kazanilan puani da doner. */
export function collapseRow(row: number[]): { row: number[]; gained: number } {
  const values = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const sum = values[i] * 2;
      merged.push(sum);
      gained += sum;
      i++; // eslenen ikinci tasi atla
    } else {
      merged.push(values[i]);
    }
  }

  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

/** Saat yonunde 90 derece. */
export function rotate(grid: Grid): Grid {
  const out = emptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      out[c][SIZE - 1 - r] = grid[r][c];
    }
  }
  return out;
}

/**
 * Yon basina kac kez saat yonunde dondurup sola kaydiracagimiz.
 *
 * Saat yonunde bir dondurme, sol sutunu (yukaridan asagi) ust satira
 * (sagdan sola) tasir. Dolayisiyla "1 dondur + sola topla" orijinal gridde
 * ASAGI toplamaya karsilik gelir; yukari icin 3 dondurme gerekir.
 */
const ROTATIONS: Record<Direction, number> = { left: 0, down: 1, right: 2, up: 3 };

/** Yeni tas ekleme adimi disari alindi ki test deterministik olabilsin. */
export function slide(grid: Grid, direction: Direction): { grid: Grid; gained: number; moved: boolean } {
  let work = grid.map((row) => [...row]);
  const turns = ROTATIONS[direction];

  for (let i = 0; i < turns; i++) work = rotate(work);

  let gained = 0;
  work = work.map((row) => {
    const result = collapseRow(row);
    gained += result.gained;
    return result.row;
  });

  for (let i = 0; i < (4 - turns) % 4; i++) work = rotate(work);

  return { grid: work, gained, moved: JSON.stringify(work) !== JSON.stringify(grid) };
}

/** Oynanabilir hamle: kaydir, degistiyse yeni tas ekle. */
export function move(grid: Grid, direction: Direction): { grid: Grid; gained: number; moved: boolean } {
  const result = slide(grid, direction);
  return { ...result, grid: result.moved ? spawn(result.grid) : result.grid };
}

export function isStuck(grid: Grid): boolean {
  if (emptyCells(grid).length > 0) return false;
  const directions: Direction[] = ['left', 'right', 'up', 'down'];
  return directions.every((d) => !slide(grid, d).moved);
}
