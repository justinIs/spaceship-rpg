/**
 * Pixel art character sprites defined as 2D color-index arrays.
 * Each number maps to a color in the palette. 0 = transparent.
 * Sprites are 16x16 pixels, rendered at 2x into a 32x32 texture.
 */

// Player palette: techno farmer / space explorer
const PLAYER_PALETTE: Record<number, number> = {
    0: -1,          // transparent
    1: 0x222233,    // dark outline
    2: 0xeeeeff,    // helmet white/light
    3: 0xccccdd,    // helmet shadow
    4: 0x1a3366,    // visor dark blue
    5: 0x44ccee,    // visor cyan accent
    6: 0x33aa55,    // suit green
    7: 0x227744,    // suit green shadow
    8: 0x55dd66,    // antenna tips / green highlights
    9: 0xe8b87a,    // skin tone
    10: 0x664422,   // boots brown
    11: 0x443311,   // boots dark
};

// Robot palette: friendly helper bot
const ROBOT_PALETTE: Record<number, number> = {
    0: -1,          // transparent
    1: 0x555566,    // dark metal outline
    2: 0x9999aa,    // body light
    3: 0x777788,    // body shadow
    4: 0x44eeff,    // visor/eyes (cyan glow)
    5: 0x33bbcc,    // visor shadow
    6: 0xff4444,    // antenna light
    7: 0xffcc44,    // chest indicator
    8: 0x666677,    // arms/treads
    9: 0xaabbcc,    // highlight
};

// 16x16 player sprite (front-facing, chibi proportions)
// Techno farmer: big helmet with blue visor, green suit, antenna nubs
const PLAYER_PIXELS = [
    [0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
    [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0],
    [0, 0, 1, 1, 4, 4, 5, 4, 5, 4, 4, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 4, 4, 5, 4, 5, 4, 4, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 9, 9, 9, 9, 9, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 6, 6, 6, 6, 6, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 6, 6, 6, 8, 6, 6, 6, 1, 0, 0, 0, 0],
    [0, 0, 1, 7, 6, 6, 6, 8, 6, 6, 6, 7, 1, 0, 0, 0],
    [0, 0, 0, 1, 7, 6, 6, 6, 6, 6, 7, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 7, 7, 0, 7, 7, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 10, 10, 1, 0, 1, 10, 10, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 10, 11, 0, 0, 0, 11, 10, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 11, 11, 0, 0, 0, 11, 11, 0, 0, 0, 0, 0],
];

// 16x16 robot sprite (top-down, facing down)
// Compact friendly bot with antenna, visor, treads
const ROBOT_PIXELS = [
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
];

/**
 * Renders a pixel array + palette onto a Phaser texture at 2x scale.
 * Each pixel in the array becomes a 2x2 block in the final 32x32 texture.
 */
export function createPixelTexture(
    scene: Phaser.Scene,
    key: string,
    pixels: number[][],
    palette: Record<number, number>,
    scale = 2
) {
    const h = pixels.length;
    const w = pixels[0].length;
    const gfx = scene.add.graphics();

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const colorIdx = pixels[y][x];
            if (colorIdx === 0) continue; // transparent
            const color = palette[colorIdx];
            if (color === undefined || color === -1) continue;
            gfx.fillStyle(color, 1);
            gfx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    gfx.generateTexture(key, w * scale, h * scale);
    gfx.destroy();
}

export function createPlayerTexture(scene: Phaser.Scene) {
    createPixelTexture(scene, 'player', PLAYER_PIXELS, PLAYER_PALETTE);
}

export function createRobotTexture(scene: Phaser.Scene) {
    createPixelTexture(scene, 'robot', ROBOT_PIXELS, ROBOT_PALETTE);
}
