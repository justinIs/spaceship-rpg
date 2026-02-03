import type { SpriteDefinition } from '../../../scripts/generate-sprite-pngs';

/**
 * Robot Companion: Friendly Helper Bot
 * Compact bot with cyan visor, metal body, antenna light.
 */
export const RobotSprite: SpriteDefinition = {
  name: 'robot',
  width: 16,
  height: 16,
  scale: 2,

  palette: {
    0: null,       // transparent
    1: 0x555566,   // dark metal outline
    2: 0x9999aa,   // body light
    3: 0x777788,   // body shadow
    4: 0x44eeff,   // visor/eyes cyan
    5: 0x33bbcc,   // visor shadow
    6: 0xff4444,   // antenna light
    7: 0xffcc44,   // chest indicator
    8: 0x666677,   // arms/treads
    9: 0xaabbcc,   // highlight
  },

  angles: {
    down: [[
      [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 6, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 9, 2, 2, 2, 2, 2, 9, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 2, 4, 4, 5, 4, 4, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 2, 4, 4, 5, 4, 4, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 3, 2, 2, 2, 2, 2, 3, 1, 0, 0, 0, 0],
      [0, 0, 1, 8, 1, 1, 1, 1, 1, 1, 1, 8, 1, 0, 0, 0],
      [0, 0, 1, 8, 1, 3, 3, 7, 3, 3, 1, 8, 1, 0, 0, 0],
      [0, 0, 1, 8, 1, 3, 3, 7, 3, 3, 1, 8, 1, 0, 0, 0],
      [0, 0, 1, 8, 1, 3, 2, 2, 2, 3, 1, 8, 1, 0, 0, 0],
      [0, 0, 1, 8, 1, 1, 1, 1, 1, 1, 1, 8, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 8, 8, 0, 8, 8, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 8, 8, 8, 0, 8, 8, 8, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]],
  },
};
