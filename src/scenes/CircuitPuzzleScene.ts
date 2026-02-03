import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { TEXTURE_KEYS } from '../config/assets';
import { PuzzleLevel, TILE, getPuzzle } from '../config/puzzles';

/**
 * CircuitPuzzleScene: Chips Challenge style mini-game.
 * Player controls an "energy spark" navigating from SOURCE to TARGET.
 */
export class CircuitPuzzleScene extends Phaser.Scene {
  private level!: PuzzleLevel;
  private playerX = 0;
  private playerY = 0;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private gridContainer!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;

  // Touch swipe detection
  private touchStartX = 0;
  private touchStartY = 0;

  // Callback when puzzle is completed
  private onCompleteCallback?: () => void;

  constructor() {
    super({ key: 'CircuitPuzzleScene' });
  }

  init(data: { puzzleId: string; onComplete?: () => void }) {
    const puzzle = getPuzzle(data.puzzleId);
    if (!puzzle) {
      console.error(`Puzzle not found: ${data.puzzleId}`);
      this.scene.stop();
      return;
    }
    this.level = puzzle;
    this.onCompleteCallback = data.onComplete;
  }

  create() {
    // Dark overlay background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setOrigin(0, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, this.level.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, 55, 'Navigate the spark to the red target', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Calculate grid position to center it
    const gridPixelW = this.level.width * TILE_SIZE;
    const gridPixelH = this.level.height * TILE_SIZE;
    const offsetX = (GAME_WIDTH - gridPixelW) / 2;
    const offsetY = (GAME_HEIGHT - gridPixelH) / 2 + 20;

    // Create grid container
    this.gridContainer = this.add.container(offsetX, offsetY);

    // Render the grid
    this.renderGrid();

    // Create player sprite
    this.playerX = this.level.startX;
    this.playerY = this.level.startY;
    this.playerSprite = this.add.sprite(
      this.playerX * TILE_SIZE + TILE_SIZE / 2,
      this.playerY * TILE_SIZE + TILE_SIZE / 2,
      TEXTURE_KEYS.PUZZLE_SPARK
    );
    this.gridContainer.add(this.playerSprite);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Touch/swipe input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchStartX = p.x;
      this.touchStartY = p.y;
    });

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const dx = p.x - this.touchStartX;
      const dy = p.y - this.touchStartY;
      const threshold = 30;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        // Horizontal swipe
        this.tryMove(dx > 0 ? 1 : -1, 0);
      } else if (Math.abs(dy) > threshold) {
        // Vertical swipe
        this.tryMove(0, dy > 0 ? 1 : -1);
      }
    });

    // Escape to quit
    this.input.keyboard!.on('keydown-ESC', () => {
      this.exitPuzzle(false);
    });

    // Back button
    const backBtn = this.add.text(10, GAME_HEIGHT - 30, '< Back (ESC)', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setInteractive();
    backBtn.on('pointerdown', () => this.exitPuzzle(false));
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
  }

  update() {
    if (this.isMoving) return;

    // Keyboard movement
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.a)) {
      this.tryMove(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.d)) {
      this.tryMove(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.w)) {
      this.tryMove(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.s)) {
      this.tryMove(0, 1);
    }
  }

  private renderGrid(): void {
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        const tileType = this.level.grid[y][x];
        let textureKey: string;

        switch (tileType) {
          case TILE.WALL:
            textureKey = TEXTURE_KEYS.PUZZLE_WALL;
            break;
          case TILE.SOURCE:
            textureKey = TEXTURE_KEYS.PUZZLE_SOURCE;
            break;
          case TILE.TARGET:
            textureKey = TEXTURE_KEYS.PUZZLE_TARGET;
            break;
          default:
            textureKey = TEXTURE_KEYS.PUZZLE_FLOOR;
        }

        const sprite = this.add.sprite(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          textureKey
        );
        this.gridContainer.add(sprite);
      }
    }
  }

  private tryMove(dx: number, dy: number): void {
    const newX = this.playerX + dx;
    const newY = this.playerY + dy;

    // Bounds check
    if (newX < 0 || newX >= this.level.width || newY < 0 || newY >= this.level.height) {
      return;
    }

    // Wall check
    const tile = this.level.grid[newY][newX];
    if (tile === TILE.WALL) {
      return;
    }

    // Valid move - animate
    this.isMoving = true;
    this.playerX = newX;
    this.playerY = newY;

    this.tweens.add({
      targets: this.playerSprite,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        this.isMoving = false;
        this.checkWin();
      },
    });
  }

  private checkWin(): void {
    const tile = this.level.grid[this.playerY][this.playerX];
    if (tile === TILE.TARGET) {
      // Victory!
      this.showVictory();
    }
  }

  private showVictory(): void {
    // Disable input
    this.input.keyboard!.removeAllListeners();
    this.input.removeAllListeners();

    // Victory flash
    this.cameras.main.flash(300, 100, 255, 100);

    // Victory text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CIRCUIT CONNECTED!', {
      fontSize: '24px',
      color: '#44ff44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#000000aa',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    // Exit after delay
    this.time.delayedCall(1500, () => {
      this.exitPuzzle(true);
    });
  }

  private exitPuzzle(completed: boolean): void {
    if (completed && this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    this.scene.stop();
    this.scene.resume('OverworldScene');
  }
}
