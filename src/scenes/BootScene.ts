import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../config/constants';

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
    // Player - simple character (blue-ish figure)
    this.makeRect('player', TILE_SIZE, TILE_SIZE, 0x3366cc);

    // Robot companion (silver/gray with antenna dot)
    const robotGfx = this.add.graphics();
    robotGfx.fillStyle(0xaaaacc, 1);
    robotGfx.fillRect(0, 4, TILE_SIZE, TILE_SIZE - 4);
    robotGfx.fillStyle(0xff4444, 1);
    robotGfx.fillCircle(TILE_SIZE / 2, 3, 3); // antenna
    robotGfx.generateTexture('robot', TILE_SIZE, TILE_SIZE);
    robotGfx.destroy();

    // Tundra ground tiles
    this.makeRect('ground_light', TILE_SIZE, TILE_SIZE, COLORS.tundraLight);
    this.makeRect('ground_dark', TILE_SIZE, TILE_SIZE, COLORS.tundraDark);
    this.makeRect('path', TILE_SIZE, TILE_SIZE, COLORS.path);

    // Rock / scrap
    this.makeRect('rock', TILE_SIZE, TILE_SIZE, COLORS.rock);

    // House
    this.makeRect('house', TILE_SIZE * 3, TILE_SIZE * 2, COLORS.house);

    // Garage
    this.makeRect('garage', TILE_SIZE * 3, TILE_SIZE * 2, COLORS.garage);

    // Solar panel
    this.makeRect('solar', TILE_SIZE, TILE_SIZE, COLORS.solar);

    // Mine entrance
    this.makeRect('mine', TILE_SIZE * 2, TILE_SIZE * 2, COLORS.mine);

    // Iron ore node
    const oreGfx = this.add.graphics();
    oreGfx.fillStyle(COLORS.rockDark, 1);
    oreGfx.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 2);
    oreGfx.fillStyle(0xcc8844, 1);
    oreGfx.fillCircle(TILE_SIZE / 2 - 4, TILE_SIZE / 2, 4);
    oreGfx.fillCircle(TILE_SIZE / 2 + 5, TILE_SIZE / 2 - 3, 3);
    oreGfx.generateTexture('ore', TILE_SIZE, TILE_SIZE);
    oreGfx.destroy();

    // Scrap metal
    const scrapGfx = this.add.graphics();
    scrapGfx.fillStyle(0x888888, 1);
    scrapGfx.fillRect(4, 8, TILE_SIZE - 8, TILE_SIZE - 16);
    scrapGfx.fillStyle(0x666666, 1);
    scrapGfx.fillRect(8, 4, TILE_SIZE - 16, TILE_SIZE - 8);
    scrapGfx.generateTexture('scrap', TILE_SIZE, TILE_SIZE);
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
