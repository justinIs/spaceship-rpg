import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../config/constants';
import { TEXTURE_KEYS } from '../config/assets';

/**
 * BootScene: generates placeholder sprite textures so we don't need
 * external asset files yet. We'll swap these for real art later.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.generateTextures();
        this.scene.start('OverworldScene');
    }

    private generateTextures() {
        // Tundra ground tiles
        this.makeRect(TEXTURE_KEYS.GROUND_LIGHT, TILE_SIZE, TILE_SIZE, COLORS.tundraLight);
        this.makeRect(TEXTURE_KEYS.GROUND_DARK, TILE_SIZE, TILE_SIZE, COLORS.tundraDark);
        this.makeRect(TEXTURE_KEYS.PATH, TILE_SIZE, TILE_SIZE, COLORS.path);

        // Rock / scrap
        this.makeRect(TEXTURE_KEYS.ROCK, TILE_SIZE, TILE_SIZE, COLORS.rock);

        // House
        this.makeRect(TEXTURE_KEYS.HOUSE, TILE_SIZE * 3, TILE_SIZE * 2, COLORS.house);

        // Garage
        this.makeRect(TEXTURE_KEYS.GARAGE, TILE_SIZE * 3, TILE_SIZE * 2, COLORS.garage);

        // Solar panel
        this.makeRect(TEXTURE_KEYS.SOLAR, TILE_SIZE, TILE_SIZE, COLORS.solar);

        // Mine entrance
        this.makeRect(TEXTURE_KEYS.MINE, TILE_SIZE * 2, TILE_SIZE * 2, COLORS.mine);

        // Iron ore node
        const oreGfx = this.add.graphics();
        oreGfx.fillStyle(COLORS.rockDark, 1);
        oreGfx.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 2);
        oreGfx.fillStyle(0xcc8844, 1);
        oreGfx.fillCircle(TILE_SIZE / 2 - 4, TILE_SIZE / 2, 4);
        oreGfx.fillCircle(TILE_SIZE / 2 + 5, TILE_SIZE / 2 - 3, 3);
        oreGfx.generateTexture(TEXTURE_KEYS.ORE, TILE_SIZE, TILE_SIZE);
        oreGfx.destroy();

        // Scrap metal
        const scrapGfx = this.add.graphics();
        scrapGfx.fillStyle(0x888888, 1);
        scrapGfx.fillRect(4, 8, TILE_SIZE - 8, TILE_SIZE - 16);
        scrapGfx.fillStyle(0x666666, 1);
        scrapGfx.fillRect(8, 4, TILE_SIZE - 16, TILE_SIZE - 8);
        scrapGfx.generateTexture(TEXTURE_KEYS.SCRAP, TILE_SIZE, TILE_SIZE);
        scrapGfx.destroy();
    }

    private makeRect(key: string, w: number, h: number, color: number) {
        const gfx = this.add.graphics();
        gfx.fillStyle(color, 1);
        gfx.fillRect(0, 0, w, h);
        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }
}
