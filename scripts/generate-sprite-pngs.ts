#!/usr/bin/env node
/**
 * Generates PNG sprite sheets from sprite definitions
 * Usage: npx tsx scripts/generate-sprite-pngs.ts [sprite-name]
 *
 * Output: Sprite sheet grid (rows = directions, cols = frames)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard direction order for sprite sheets
export const DIRECTIONS = [
  'down', 'down_right', 'right', 'up_right',
  'up', 'up_left', 'left', 'down_left'
] as const;

export type Direction = typeof DIRECTIONS[number];

// A single frame is a 2D pixel array
type Frame = number[][];

// Sprite definition interface - each direction has an array of frames
export interface SpriteDefinition {
  name: string;
  width: number;
  height: number;
  scale: number;
  palette: Record<number, number | null>;
  angles: Partial<Record<Direction, Frame[]>>; // Direction -> array of frames
}

function hexToRGBA(hex: number | null): [number, number, number, number] {
  if (hex === null || hex === -1) {
    return [0, 0, 0, 0];
  }
  const r = (hex >> 16) & 0xFF;
  const g = (hex >> 8) & 0xFF;
  const b = hex & 0xFF;
  return [r, g, b, 255];
}

function createPNGChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const chunkData = Buffer.concat([typeBuffer, data]);

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < chunkData.length; i++) {
    crc ^= chunkData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  crc ^= 0xFFFFFFFF;

  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

/**
 * Generate PNG sprite sheet from sprite definition
 * Layout: Grid with rows = directions, cols = frames
 */
export function generatePNG(sprite: SpriteDefinition, outputPath: string): { frameWidth: number; frameHeight: number; rows: number; cols: number } {
  const frameWidth = sprite.width * sprite.scale;
  const frameHeight = sprite.height * sprite.scale;

  const definedAngles = DIRECTIONS.filter(dir => sprite.angles[dir] !== undefined);
  const rows = definedAngles.length;

  if (rows === 0) {
    throw new Error(`Sprite "${sprite.name}" has no angles defined`);
  }

  // Find max frames across all directions
  const cols = Math.max(...definedAngles.map(dir => sprite.angles[dir]!.length));

  const totalWidth = frameWidth * cols;
  const totalHeight = frameHeight * rows;

  const rawData: number[] = [];

  for (let row = 0; row < rows; row++) {
    const direction = definedAngles[row];
    const frames = sprite.angles[direction]!;

    for (let y = 0; y < frameHeight; y++) {
      rawData.push(0); // PNG filter byte

      for (let col = 0; col < cols; col++) {
        // Use last frame if this direction has fewer frames
        const frameIdx = Math.min(col, frames.length - 1);
        const pixels = frames[frameIdx];

        for (let x = 0; x < frameWidth; x++) {
          const srcX = Math.floor(x / sprite.scale);
          const srcY = Math.floor(y / sprite.scale);
          const colorIdx = pixels[srcY][srcX];
          const [r, g, b, a] = hexToRGBA(sprite.palette[colorIdx]);
          rawData.push(r, g, b, a);
        }
      }
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(totalWidth, 0);
  ihdr.writeUInt32BE(totalHeight, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createPNGChunk('IHDR', ihdr);
  const idatChunk = createPNGChunk('IDAT', compressed);
  const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, png);

  console.log(`✓ ${sprite.name}.png (${totalWidth}x${totalHeight}, ${rows} directions × ${cols} frames)`);

  return { frameWidth, frameHeight, rows, cols };
}

async function loadSpriteDefinitions(definitionsPath: string): Promise<SpriteDefinition[]> {
  const sprites: SpriteDefinition[] = [];

  if (!fs.existsSync(definitionsPath)) {
    return sprites;
  }

  const files = fs.readdirSync(definitionsPath);

  for (const file of files) {
    if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.startsWith('_')) {
      const modulePath = path.join(definitionsPath, file);
      try {
        const module = await import(modulePath);

        for (const key of Object.keys(module)) {
          const value = module[key];
          if (value && typeof value === 'object' && 'name' in value && 'angles' in value) {
            sprites.push(value as SpriteDefinition);
          }
        }
      } catch (error) {
        console.warn(`⚠ Could not load ${file}:`, error);
      }
    }
  }

  return sprites;
}

async function main() {
  const args = process.argv.slice(2);
  const targetSprite = args[0];

  const projectRoot = path.join(__dirname, '..');
  const definitionsDir = path.join(projectRoot, 'src', 'sprites', 'definitions');
  const outputDir = path.join(projectRoot, 'src', 'assets', 'sprites');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sprites = await loadSpriteDefinitions(definitionsDir);

  if (sprites.length === 0) {
    console.error('No sprite definitions found in', definitionsDir);
    process.exit(1);
  }

  const toGenerate = targetSprite
    ? sprites.filter(s => s.name === targetSprite)
    : sprites;

  if (toGenerate.length === 0) {
    console.error(`Sprite "${targetSprite}" not found. Available: ${sprites.map(s => s.name).join(', ')}`);
    process.exit(1);
  }

  for (const sprite of toGenerate) {
    const outputPath = path.join(outputDir, `${sprite.name}.png`);
    generatePNG(sprite, outputPath);
  }
}

main();
