/**
 * Puzzle level definitions for Circuit Connect mini-game
 */

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  SOURCE: 2,
  TARGET: 3,
} as const;

export interface PuzzleLevel {
  id: string;
  name: string;
  width: number;
  height: number;
  grid: number[][];  // 2D array of TILE values
  startX: number;    // Player start position (on SOURCE tile)
  startY: number;
}

export const PUZZLES: Record<string, PuzzleLevel> = {
  battery_repair: {
    id: 'battery_repair',
    name: 'Battery Repair',
    width: 8,
    height: 8,
    startX: 1,
    startY: 1,
    grid: [
      // 0=floor, 1=wall, 2=source, 3=target
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
};

export function getPuzzle(id: string): PuzzleLevel | undefined {
  return PUZZLES[id];
}
