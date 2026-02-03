import type { SpriteDefinition } from '../../../scripts/generate-sprite-pngs';

/**
 * [Sprite Name]: [Brief Description]
 *
 * Description: [Detailed description of what this sprite represents,
 * its visual characteristics, and any important notes]
 *
 * Directions: down, down_right, right, up_right, up, up_left, left, down_left
 * Frames: Array of pixel grids per direction (for animation)
 *
 * Output: npx tsx scripts/generate-sprite-pngs.ts
 */
export const TemplateSprite: SpriteDefinition = {
  name: 'template', // Must be unique, used for filename
  width: 16,        // Original width (before scaling)
  height: 16,       // Original height (before scaling)
  scale: 2,         // Render scale (2 = double size, 32x32 output)

  // Color palette: index -> hex color (null = transparent)
  // Tip: Use descriptive comments for each color
  palette: {
    0: null,       // transparent
    1: 0x000000,   // black / outline
    2: 0xffffff,   // white / highlight
    3: 0x808080,   // gray / shadow
    // Add more colors as needed (up to any index)...
  },

  // Angles: Each direction contains an array of animation frames
  // Each frame is a 2D array of palette indices
  // Sprite sheet output: rows = directions, columns = frames
  angles: {
    // Minimal example: 1 direction, 1 frame
    down: [
      // Frame 1 (can add more frames for animation)
      [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    ],

    // Add more directions as needed:
    // down_right: [/* frames */],
    // right: [/* frames */],
    // up_right: [/* frames */],
    // up: [/* frames */],
    // up_left: [/* frames */],
    // left: [/* frames */],
    // down_left: [/* frames */],
  },
};

/*
 * ANIMATION EXAMPLE (3-frame walk cycle):
 *
 * down: [
 *   // Frame 1: Left foot forward
 *   [[...pixels...]],
 *   // Frame 2: Neutral standing
 *   [[...pixels...]],
 *   // Frame 3: Right foot forward
 *   [[...pixels...]],
 * ],
 *
 * Output sprite sheet for 8 directions × 3 frames:
 * - Width: 32px × 3 = 96px
 * - Height: 32px × 8 = 256px
 * - Phaser loads with frameWidth: 32, frameHeight: 32
 */
