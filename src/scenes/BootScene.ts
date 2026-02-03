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

        // Battery cell - glowing yellow/green cylinder
        const batteryGfx = this.add.graphics();
        batteryGfx.fillStyle(0x44aa44, 1);
        batteryGfx.fillRoundedRect(6, 4, TILE_SIZE - 12, TILE_SIZE - 8, 4);
        batteryGfx.fillStyle(0x88ff88, 1);
        batteryGfx.fillRoundedRect(8, 6, TILE_SIZE - 16, TILE_SIZE - 12, 2);
        batteryGfx.fillStyle(0xffff44, 1);
        batteryGfx.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, 4);
        batteryGfx.generateTexture(TEXTURE_KEYS.BATTERY_CELL, TILE_SIZE, TILE_SIZE);
        batteryGfx.destroy();

        // Terminal - computer screen
        const terminalGfx = this.add.graphics();
        terminalGfx.fillStyle(0x333333, 1);
        terminalGfx.fillRect(4, 2, TILE_SIZE - 8, TILE_SIZE - 4);
        terminalGfx.fillStyle(0x222288, 1);
        terminalGfx.fillRect(6, 4, TILE_SIZE - 12, TILE_SIZE - 12);
        terminalGfx.fillStyle(0x44ff44, 1);
        terminalGfx.fillRect(8, 6, 4, 2);
        terminalGfx.fillRect(8, 10, 6, 2);
        terminalGfx.fillRect(8, 14, 5, 2);
        terminalGfx.generateTexture(TEXTURE_KEYS.TERMINAL, TILE_SIZE, TILE_SIZE);
        terminalGfx.destroy();

        // Generate puzzle textures
        this.generatePuzzleTextures();
    }

    private generatePuzzleTextures() {
        const size = TILE_SIZE;

        // Puzzle floor - dark circuit board pattern
        const floorGfx = this.add.graphics();
        floorGfx.fillStyle(0x1a1a2e, 1);
        floorGfx.fillRect(0, 0, size, size);
        floorGfx.lineStyle(1, 0x2a2a4e, 0.5);
        floorGfx.strokeRect(2, 2, size - 4, size - 4);
        floorGfx.generateTexture(TEXTURE_KEYS.PUZZLE_FLOOR, size, size);
        floorGfx.destroy();

        // Puzzle wall - solid block
        const wallGfx = this.add.graphics();
        wallGfx.fillStyle(0x4a4a6a, 1);
        wallGfx.fillRect(0, 0, size, size);
        wallGfx.fillStyle(0x5a5a7a, 1);
        wallGfx.fillRect(2, 2, size - 4, size - 8);
        wallGfx.fillStyle(0x3a3a5a, 1);
        wallGfx.fillRect(2, size - 6, size - 4, 4);
        wallGfx.generateTexture(TEXTURE_KEYS.PUZZLE_WALL, size, size);
        wallGfx.destroy();

        // Puzzle source - green starting point
        const sourceGfx = this.add.graphics();
        sourceGfx.fillStyle(0x1a1a2e, 1);
        sourceGfx.fillRect(0, 0, size, size);
        sourceGfx.fillStyle(0x22aa22, 1);
        sourceGfx.fillCircle(size / 2, size / 2, size / 3);
        sourceGfx.fillStyle(0x44ff44, 1);
        sourceGfx.fillCircle(size / 2, size / 2, size / 5);
        sourceGfx.generateTexture(TEXTURE_KEYS.PUZZLE_SOURCE, size, size);
        sourceGfx.destroy();

        // Puzzle target - red endpoint
        const targetGfx = this.add.graphics();
        targetGfx.fillStyle(0x1a1a2e, 1);
        targetGfx.fillRect(0, 0, size, size);
        targetGfx.fillStyle(0xaa2222, 1);
        targetGfx.fillCircle(size / 2, size / 2, size / 3);
        targetGfx.fillStyle(0xff4444, 1);
        targetGfx.fillCircle(size / 2, size / 2, size / 5);
        targetGfx.generateTexture(TEXTURE_KEYS.PUZZLE_TARGET, size, size);
        targetGfx.destroy();

        // Puzzle spark (player) - yellow energy ball
        const sparkGfx = this.add.graphics();
        sparkGfx.fillStyle(0xffaa00, 1);
        sparkGfx.fillCircle(size / 2, size / 2, size / 3);
        sparkGfx.fillStyle(0xffff44, 1);
        sparkGfx.fillCircle(size / 2, size / 2, size / 5);
        sparkGfx.generateTexture(TEXTURE_KEYS.PUZZLE_SPARK, size, size);
        sparkGfx.destroy();
    }

    private makeRect(key: string, w: number, h: number, color: number) {
        const gfx = this.add.graphics();
        gfx.fillStyle(color, 1);
        gfx.fillRect(0, 0, w, h);
        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }
}
