/**
 * Asset keys and sprite configuration constants
 * Centralizes all magic strings for sprites, textures, and animations
 */

// Sprite sheet keys
export const SPRITE_KEYS = {
  PLAYER: 'player',
  ROBOT: 'robot',
} as const;

// Texture keys for procedurally generated textures
export const TEXTURE_KEYS = {
  GROUND_LIGHT: 'ground_light',
  GROUND_DARK: 'ground_dark',
  PATH: 'path',
  ROCK: 'rock',
  HOUSE: 'house',
  GARAGE: 'garage',
  SOLAR: 'solar',
  MINE: 'mine',
  ORE: 'ore',
  SCRAP: 'scrap',
} as const;

// Player animation keys
export const PLAYER_ANIMS = {
  WALK_DOWN: 'player-walk-down',
  WALK_DOWN_RIGHT: 'player-walk-down-right',
  WALK_RIGHT: 'player-walk-right',
  WALK_UP_RIGHT: 'player-walk-up-right',
  WALK_UP: 'player-walk-up',
  WALK_UP_LEFT: 'player-walk-up-left',
  WALK_LEFT: 'player-walk-left',
  WALK_DOWN_LEFT: 'player-walk-down-left',

  IDLE_DOWN: 'player-idle-down',
  IDLE_DOWN_RIGHT: 'player-idle-down-right',
  IDLE_RIGHT: 'player-idle-right',
  IDLE_UP_RIGHT: 'player-idle-up-right',
  IDLE_UP: 'player-idle-up',
  IDLE_UP_LEFT: 'player-idle-up-left',
  IDLE_LEFT: 'player-idle-left',
  IDLE_DOWN_LEFT: 'player-idle-down-left',
} as const;

// Sprite sheet configuration
export const SPRITE_CONFIG = {
  PLAYER: {
    frameWidth: 32,
    frameHeight: 32,
    rows: 8,              // 8 directions
    cols: 3,              // 3 frames per direction
    frameRate: 8,         // Animation speed (frames per second)
    // Direction order in sprite sheet (matches DIRECTIONS in generate-sprite-pngs.ts)
    directions: [
      'down',
      'down_right',
      'right',
      'up_right',
      'up',
      'up_left',
      'left',
      'down_left'
    ] as const,
  },
  ROBOT: {
    frameWidth: 32,
    frameHeight: 32,
    rows: 1,              // Currently 1 direction (down only)
    cols: 1,              // Currently 1 frame per direction
    frameRate: 8,
  },
} as const;

/**
 * Maps direction index (0-7) to animation keys
 */
export const DIRECTION_TO_ANIMS = [
  { walk: PLAYER_ANIMS.WALK_DOWN, idle: PLAYER_ANIMS.IDLE_DOWN },           // 0: down
  { walk: PLAYER_ANIMS.WALK_DOWN_RIGHT, idle: PLAYER_ANIMS.IDLE_DOWN_RIGHT }, // 1: down-right
  { walk: PLAYER_ANIMS.WALK_RIGHT, idle: PLAYER_ANIMS.IDLE_RIGHT },         // 2: right
  { walk: PLAYER_ANIMS.WALK_UP_RIGHT, idle: PLAYER_ANIMS.IDLE_UP_RIGHT },   // 3: up-right
  { walk: PLAYER_ANIMS.WALK_UP, idle: PLAYER_ANIMS.IDLE_UP },               // 4: up
  { walk: PLAYER_ANIMS.WALK_UP_LEFT, idle: PLAYER_ANIMS.IDLE_UP_LEFT },     // 5: up-left
  { walk: PLAYER_ANIMS.WALK_LEFT, idle: PLAYER_ANIMS.IDLE_LEFT },           // 6: left
  { walk: PLAYER_ANIMS.WALK_DOWN_LEFT, idle: PLAYER_ANIMS.IDLE_DOWN_LEFT }, // 7: down-left
] as const;

/**
 * Get direction index (0-7) from velocity components
 * Returns index for DIRECTION_TO_ANIMS array
 *
 * Sprite sheet order: down(0), down-right(1), right(2), up-right(3),
 *                     up(4), up-left(5), left(6), down-left(7)
 */
export function getDirectionIndex(vx: number, vy: number): number {
  // Handle stopped state
  if (vx === 0 && vy === 0) return -1;

  // Calculate angle in radians
  // In screen coords: +Y is down, +X is right
  // atan2 gives: down=90°, right=0°, up=-90°, left=180°
  const angle = Math.atan2(vy, vx);

  // Convert to degrees and normalize to 0-360
  let degrees = angle * (180 / Math.PI);
  if (degrees < 0) degrees += 360;

  // Convert so down=0°, going clockwise
  // (subtract from 90° because down is 90° in atan2)
  let adjusted = 90 - degrees;
  if (adjusted < 0) adjusted += 360;

  // Map to 8 directions (45° per direction)
  const directionIndex = Math.round(adjusted / 45) % 8;

  return directionIndex;
}
