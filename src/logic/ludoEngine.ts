export type PlayerColor = 'blue' | 'red' | 'green' | 'yellow';

export interface Pawn {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = in home nest, 0..50 = main track, 51..55 = home straight, 56 = finished
}

export interface Player {
  id: number;
  color: PlayerColor;
  name: string;
  isBot: boolean;
  pawns: Pawn[];
  hasFinished: boolean;
  hudPosition: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right';
}

// 52 track coordinate mapping on 15x15 grid (row, col)
export const TRACK_COORDS: Array<{ row: number; col: number; isSafe?: boolean }> = [
  // 0..4 (Blue start, moving UP)
  { row: 13, col: 6, isSafe: true }, // 0: Blue Start
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  // 5..10 (moving LEFT)
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2, isSafe: true }, // 8: Star
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  // 11..12 (moving UP)
  { row: 7, col: 0 }, // 11: Red home entry turn
  { row: 6, col: 0 },
  // 13..17 (Red start, moving RIGHT)
  { row: 6, col: 1, isSafe: true }, // 13: Red Start
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  // 18..23 (moving UP)
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6, isSafe: true }, // 21: Star
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  // 24..25 (moving RIGHT)
  { row: 0, col: 7 }, // 24: Green home entry turn
  { row: 0, col: 8 },
  // 26..30 (Green start, moving DOWN)
  { row: 1, col: 8, isSafe: true }, // 26: Green Start
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  // 31..36 (moving RIGHT)
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12, isSafe: true }, // 34: Star
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  // 37..38 (moving DOWN)
  { row: 7, col: 14 }, // 37: Yellow home entry turn
  { row: 8, col: 14 },
  // 39..43 (Yellow start, moving LEFT)
  { row: 8, col: 13, isSafe: true }, // 39: Yellow Start
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  // 44..49 (moving DOWN)
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8, isSafe: true }, // 47: Star
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  // 50..51 (moving LEFT)
  { row: 14, col: 7 }, // 50: Blue home entry turn
  { row: 14, col: 6 },
];

// Color specific constants
export const COLOR_OFFSETS: Record<PlayerColor, number> = {
  blue: 0,
  red: 13,
  green: 26,
  yellow: 39,
};

// Home Straight (5 steps + 1 center)
export const HOME_STRAIGHTS: Record<PlayerColor, Array<{ row: number; col: number }>> = {
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8.5, col: 7.5 }, // 56: Home center
  ],
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7.5, col: 6.5 }, // 56: Home center
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6.5, col: 7.5 }, // 56: Home center
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7.5, col: 8.5 }, // 56: Home center
  ],
};

// Home Base Nest Spot Coordinates (Centered in 2x2 grid inside 4x4 white box)
export const BASE_NEST_COORDS: Record<PlayerColor, Array<{ row: number; col: number }>> = {
  red: [
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
  ],
  green: [
    { row: 2, col: 11 },
    { row: 2, col: 12 },
    { row: 3, col: 11 },
    { row: 3, col: 12 },
  ],
  yellow: [
    { row: 11, col: 11 },
    { row: 11, col: 12 },
    { row: 12, col: 11 },
    { row: 12, col: 12 },
  ],
  blue: [
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 12, col: 2 },
    { row: 12, col: 3 },
  ],
};

/**
 * Convert pawn logical step to 15x15 board (row, col)
 */
export function getPawnBoardPosition(pawn: Pawn): { row: number; col: number } {
  if (pawn.step === -1) {
    return BASE_NEST_COORDS[pawn.color][pawn.id];
  }
  if (pawn.step <= 50) {
    const globalIdx = (COLOR_OFFSETS[pawn.color] + pawn.step) % 52;
    return TRACK_COORDS[globalIdx];
  }
  // Inside home straight (51..56)
  const homeStraightIdx = pawn.step - 51;
  return HOME_STRAIGHTS[pawn.color][Math.min(homeStraightIdx, 5)];
}

/**
 * Check if a pawn can make a move with the given dice roll
 */
export function canPawnMove(pawn: Pawn, dice: number): boolean {
  if (pawn.step === -1) {
    // Needs a 6 to leave home nest
    return dice === 6;
  }
  if (pawn.step === 56) {
    // Already finished
    return false;
  }
  // Must reach exactly 56 to enter home
  return pawn.step + dice <= 56;
}

/**
 * Return global track index (0..51) if pawn is on the main track, or null
 */
export function getPawnGlobalTrackIndex(pawn: Pawn): number | null {
  if (pawn.step >= 0 && pawn.step <= 50) {
    return (COLOR_OFFSETS[pawn.color] + pawn.step) % 52;
  }
  return null;
}
