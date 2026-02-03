import Phaser from 'phaser';
import { TILE_SIZE, PLAYER_SPEED, COLORS } from '../config/constants';
import {
    SPRITE_KEYS,
    SPRITE_CONFIG,
    TEXTURE_KEYS,
    DIRECTION_TO_ANIMS,
    getDirectionIndex
} from '../config/assets';
import { GameStateSystem } from '../systems/GameStateSystem';
import { ObjectiveTracker } from '../ui/ObjectiveTracker';
import { DialogueBox } from '../ui/DialogueBox';
import { QUESTS } from '../config/quests';

// World dimensions in tiles
const WORLD_W = 40;
const WORLD_H = 60;

/**
 * OverworldScene: The main game scene.
 * A scrollable Greenland landscape with the player's homestead at center,
 * mines to the north, open tundra to the south.
 */
// Interaction radius in pixels
const INTERACT_RANGE = TILE_SIZE * 2.5;

// How long the interact prompt stays visible (ms)
const PROMPT_DURATION = 2000;

interface Interactable {
    sprite: Phaser.GameObjects.Sprite;
    type: string;
    message: string;
    onInteract?: () => void;  // Callback when interacted
    oneTime?: boolean;        // Remove after interaction
    id?: string;              // Unique identifier
}

export class OverworldScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private robot!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private interactables: Interactable[] = [];
    private promptText!: Phaser.GameObjects.Text;
    private hintText!: Phaser.GameObjects.Text;
    private currentDirection = 0; // Track last facing direction (0-7)

    // Mobile touch state
    private touchStartX = 0;
    private touchStartY = 0;
    private touchDirX = 0;
    private touchDirY = 0;
    private isTouching = false;

    constructor() {
        super({ key: 'OverworldScene' });
    }


    preload() {
        const baseUrl = import.meta.env.BASE_URL;
        this.load.spritesheet(SPRITE_KEYS.PLAYER, `${baseUrl}sprites/player.png`, {
            frameWidth: SPRITE_CONFIG.PLAYER.frameWidth,
            frameHeight: SPRITE_CONFIG.PLAYER.frameHeight
        });
        this.load.spritesheet(SPRITE_KEYS.ROBOT, `${baseUrl}sprites/robot.png`, {
            frameWidth: SPRITE_CONFIG.ROBOT.frameWidth,
            frameHeight: SPRITE_CONFIG.ROBOT.frameHeight
        });
    }

    create() {
        const worldPxW = WORLD_W * TILE_SIZE;
        const worldPxH = WORLD_H * TILE_SIZE;

        // Set world bounds
        this.physics.world.setBounds(0, 0, worldPxW, worldPxH);

        // Draw the ground
        this.drawGround(worldPxW, worldPxH);

        // Place environment objects
        this.placeEnvironment();

        // Player (starts at homestead center)
        const homeX = (WORLD_W / 2) * TILE_SIZE;
        const homeY = (WORLD_H / 2) * TILE_SIZE;

        this.player = this.physics.add.sprite(homeX, homeY + TILE_SIZE * 2, SPRITE_KEYS.PLAYER);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        // Create all 8-direction animations
        this.createPlayerAnimations();

        // Robot follows player, starts next to them
        this.robot = this.physics.add.sprite(homeX + TILE_SIZE * 2, homeY + TILE_SIZE * 2, SPRITE_KEYS.ROBOT);
        this.robot.setCollideWorldBounds(true);
        this.robot.setDepth(10);

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldPxW, worldPxH);

        // Keyboard input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = {
            w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Mobile touch controls
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.touchStartX = p.x;
            this.touchStartY = p.y;
            this.isTouching = true;
            this.touchDirX = 0;
            this.touchDirY = 0;
        });
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.isTouching) return;
            this.touchDirX = p.x - this.touchStartX;
            this.touchDirY = p.y - this.touchStartY;
        });
        this.input.on('pointerup', () => {
            this.isTouching = false;
            this.touchDirX = 0;
            this.touchDirY = 0;
        });

        // Simple label
        this.add.text(homeX, homeY - TILE_SIZE * 6, 'Your Homestead', {
            fontSize: '14px',
            color: '#333333',
            fontFamily: 'monospace',
        }).setOrigin(0.5)
            .setDepth(5);

        // Interaction prompt text (follows camera, shown when near interactable)
        this.promptText = this.add.text(0, 0, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'monospace',
            backgroundColor: '#333333aa',
            padding: { x: 6, y: 4 },
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // Hint text shown at bottom of screen (fixed to camera)
        this.hintText = this.add.text(0, 0, '', {
            fontSize: '11px',
            color: '#eeeeee',
            fontFamily: 'monospace',
            backgroundColor: '#222222cc',
            padding: { x: 8, y: 4 },
        }).setOrigin(0.5, 1).setDepth(20).setScrollFactor(0).setVisible(false);

        // Initialize UI components
        new ObjectiveTracker(this);
        new DialogueBox(this);

        // Initialize game state and start intro
        this.initializeGameState();
    }

    private initializeGameState(): void {
        const gameState = GameStateSystem.fromScene(this);

        // Register the battery quest
        gameState.quests.addQuest(QUESTS.fix_battery);

        // Show intro dialogue after a short delay
        this.time.delayedCall(500, () => {
            if (!gameState.introComplete) {
                gameState.dialogue.say('Robot', "Power's out. The battery cells got scattered somehow.");
                gameState.dialogue.say('Robot', 'Help me find 3 battery cells around the homestead?');

                // Start the quest after dialogue
                gameState.dialogue.once('dialogue-end', () => {
                    gameState.introComplete = true;
                    gameState.quests.startQuest('fix_battery');
                });
            }
        });
    }

    update() {
        this.handlePlayerMovement();
        this.handleRobotFollow();
        this.handleInteraction();
    }

    /**
     * Create all 8-direction walk and idle animations for the player
     * Sprite sheet layout: 8 rows (directions) × 3 columns (frames)
     */
    private createPlayerAnimations() {
        const { frameRate } = SPRITE_CONFIG.PLAYER;

        // Create walk and idle animations for each of the 8 directions
        for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
            const startFrame = dirIndex * 3; // Each direction has 3 frames
            const { walk, idle } = DIRECTION_TO_ANIMS[dirIndex];

            // Walk animation (frames 0, 1, 2 for this direction)
            this.anims.create({
                key: walk,
                frames: this.anims.generateFrameNumbers(SPRITE_KEYS.PLAYER, {
                    start: startFrame,
                    end: startFrame + 2
                }),
                frameRate,
                repeat: -1
            });

            // Idle animation (frame 1 - the neutral standing pose)
            this.anims.create({
                key: idle,
                frames: [{ key: SPRITE_KEYS.PLAYER, frame: startFrame + 1 }],
                frameRate
            });
        }
    }

    private handlePlayerMovement() {
        // Don't move if dialogue is active
        const gameState = GameStateSystem.fromScene(this);
        if (gameState.dialogue.isActive()) {
            this.player.setVelocity(0, 0);
            return;
        }

        let vx = 0;
        let vy = 0;

        // Keyboard
        const left = this.cursors.left.isDown || this.wasd.a.isDown;
        const right = this.cursors.right.isDown || this.wasd.d.isDown;
        const up = this.cursors.up.isDown || this.wasd.w.isDown;
        const down = this.cursors.down.isDown || this.wasd.s.isDown;

        if (left) vx = -1;
        else if (right) vx = 1;
        if (up) vy = -1;
        else if (down) vy = 1;

        // Mobile touch (virtual joystick feel)
        if (this.isTouching && vx === 0 && vy === 0) {
            const deadzone = 20;
            if (Math.abs(this.touchDirX) > deadzone) vx = Math.sign(this.touchDirX);
            if (Math.abs(this.touchDirY) > deadzone) vy = Math.sign(this.touchDirY);
        }

        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const norm = 1 / Math.SQRT2;
            vx *= norm;
            vy *= norm;
        }

        // Play correct animation based on direction
        if (vx !== 0 || vy !== 0) {
            // Moving - get direction and play walk animation
            const dirIndex = getDirectionIndex(vx, vy);
            this.currentDirection = dirIndex;
            const animKey = DIRECTION_TO_ANIMS[dirIndex].walk;
            this.player.anims.play(animKey, true);
        } else {
            // Idle - play idle animation for last facing direction
            const animKey = DIRECTION_TO_ANIMS[this.currentDirection].idle;
            this.player.anims.play(animKey, true);
        }

        this.player.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
    }

    private handleRobotFollow() {
        const dx = this.player.x - this.robot.x;
        const dy = this.player.y - this.robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Robot follows at a distance
        const followDist = TILE_SIZE * 2;
        const robotSpeed = PLAYER_SPEED * 0.9;

        if (dist > followDist) {
            const angle = Math.atan2(dy, dx);
            this.robot.setVelocity(
                Math.cos(angle) * robotSpeed,
                Math.sin(angle) * robotSpeed
            );
        } else {
            this.robot.setVelocity(0, 0);
        }
    }

    private handleInteraction() {
        // Find the closest interactable within range
        let closest: Interactable | null = null;
        let closestDist = Infinity;

        for (const obj of this.interactables) {
            const dx = this.player.x - obj.sprite.x;
            const dy = this.player.y - obj.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < INTERACT_RANGE && dist < closestDist) {
                closest = obj;
                closestDist = dist;
            }
        }

        if (closest) {
            // Show "[E] ..." prompt above the object
            this.promptText.setText(`[E] ${closest.type}`);
            this.promptText.setPosition(closest.sprite.x, closest.sprite.y - TILE_SIZE);
            this.promptText.setVisible(true);

            // Check for E key press (justDown prevents repeat firing)
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                // Call custom callback if provided
                if (closest.onInteract) {
                    closest.onInteract();
                } else {
                    this.showHint(closest.message);
                }

                // Remove one-time interactables
                if (closest.oneTime) {
                    this.removeInteractable(closest);
                }
            }
        } else {
            this.promptText.setVisible(false);
        }

        // Position the hint text at bottom-center of the camera view
        const cam = this.cameras.main;
        this.hintText.setPosition(cam.width / 2, cam.height - 10);
    }

    private showHint(message: string) {
        this.hintText.setText(message);
        this.hintText.setVisible(true);

        // Hide after duration
        this.time.delayedCall(PROMPT_DURATION, () => {
            this.hintText.setVisible(false);
        });
    }

    private addInteractable(
        sprite: Phaser.GameObjects.Sprite,
        type: string,
        message: string,
        options?: { onInteract?: () => void; oneTime?: boolean; id?: string }
    ): Interactable {
        const interactable: Interactable = {
            sprite,
            type,
            message,
            ...options
        };
        this.interactables.push(interactable);
        return interactable;
    }

    private removeInteractable(interactable: Interactable): void {
        const index = this.interactables.indexOf(interactable);
        if (index !== -1) {
            this.interactables.splice(index, 1);
            interactable.sprite.destroy();
        }
    }

    private findInteractableById(id: string): Interactable | undefined {
        return this.interactables.find(i => i.id === id);
    }

    // --- World building ---

    private drawGround(worldPxW: number, worldPxH: number) {
        const gfx = this.add.graphics();

        // Base tundra fill
        gfx.fillStyle(COLORS.tundraLight, 1);
        gfx.fillRect(0, 0, worldPxW, worldPxH);

        // Darker patches for variety
        const rng = new Phaser.Math.RandomDataGenerator(['greenland']);
        for (let i = 0; i < 80; i++) {
            const px = rng.between(0, worldPxW);
            const py = rng.between(0, worldPxH);
            const pw = rng.between(TILE_SIZE * 2, TILE_SIZE * 6);
            const ph = rng.between(TILE_SIZE * 2, TILE_SIZE * 4);
            gfx.fillStyle(COLORS.tundraDark, 0.3);
            gfx.fillRect(px, py, pw, ph);
        }

        // Path from homestead to mine (vertical strip)
        const pathX = (WORLD_W / 2) * TILE_SIZE - TILE_SIZE / 2;
        gfx.fillStyle(COLORS.path, 0.6);
        gfx.fillRect(pathX, 4 * TILE_SIZE, TILE_SIZE, (WORLD_H / 2 - 4) * TILE_SIZE);

        gfx.setDepth(0);
    }

    private placeEnvironment() {
        const cx = (WORLD_W / 2) * TILE_SIZE;
        const cy = (WORLD_H / 2) * TILE_SIZE;

        // === Player's Lot (center of world) ===

        // House
        const house = this.add.sprite(cx - TILE_SIZE * 3, cy - TILE_SIZE, TEXTURE_KEYS.HOUSE).setOrigin(0, 0);
        house.setDepth(2);
        this.addLabel(cx - TILE_SIZE * 1.5, cy - TILE_SIZE * 1.5, 'House');
        this.addInteractable(house, 'Enter House', 'Home sweet home. Rest here to get robot tips.');

        // Garage (workshop)
        const garage = this.add.sprite(cx + TILE_SIZE * 2, cy - TILE_SIZE, TEXTURE_KEYS.GARAGE).setOrigin(0, 0);
        garage.setDepth(2);
        this.addLabel(cx + TILE_SIZE * 3.5, cy - TILE_SIZE * 1.5, 'Garage');
        this.addInteractable(garage, 'Open Garage', 'Your workshop. The spaceship awaits...');

        // Solar panel
        const solar = this.add.sprite(cx + TILE_SIZE * 6, cy, TEXTURE_KEYS.SOLAR).setDepth(2);
        this.addLabel(cx + TILE_SIZE * 6, cy - TILE_SIZE, 'Solar', '10px');
        this.addInteractable(solar, 'Check Solar', 'Solar panel is fine, but the battery needs repair.');

        // Terminal near solar panel - for jack-in puzzle
        const terminal = this.add.sprite(cx + TILE_SIZE * 6, cy + TILE_SIZE * 1.5, TEXTURE_KEYS.TERMINAL).setDepth(2);
        this.addLabel(cx + TILE_SIZE * 6, cy + TILE_SIZE * 2.5, 'Terminal', '10px');
        this.addInteractable(terminal, 'Jack In', 'Access the battery control system.', {
            id: 'terminal',
            onInteract: () => this.onTerminalInteract(),
        });

        // === Battery Cells (scattered around homestead) ===
        this.placeBatteryCells(cx, cy);

        // === Rocky area / scrap (between home and mine) ===
        const rockyY = cy - TILE_SIZE * 10;
        for (let i = 0; i < 6; i++) {
            const rx = cx + (i - 3) * TILE_SIZE * 2.5;
            const ry = rockyY + Math.sin(i) * TILE_SIZE * 2;
            this.add.sprite(rx, ry, TEXTURE_KEYS.ROCK).setDepth(1);
        }
        // Scattered scrap
        for (let i = 0; i < 4; i++) {
            const sx = cx + (i - 2) * TILE_SIZE * 3;
            const sy = rockyY + TILE_SIZE * 2 + Math.cos(i * 2) * TILE_SIZE;
            const scrap = this.add.sprite(sx, sy, TEXTURE_KEYS.SCRAP).setDepth(1);
            this.addInteractable(scrap, 'Pick Up Scrap', 'Scrap metal collected!', {
                oneTime: true,
                onInteract: () => {
                    const gameState = GameStateSystem.fromScene(this);
                    gameState.inventory.add('scrap_metal');
                    this.showHint('Scrap metal collected!');
                },
            });
        }
        this.addLabel(cx, rockyY - TILE_SIZE * 2, 'Rocky Outcrops');

        // === Iron Mine (north) ===
        const mineY = 6 * TILE_SIZE;
        const mine = this.add.sprite(cx - TILE_SIZE, mineY, TEXTURE_KEYS.MINE).setOrigin(0, 0).setDepth(2);
        this.addLabel(cx, mineY - TILE_SIZE, 'Iron Mine');
        this.addInteractable(mine, 'Enter Mine', 'The iron mine. Dark and full of ore.');

        // === Open Tundra (south) ===
        this.addLabel(cx, cy + TILE_SIZE * 12, 'Open Tundra');

        // A few rocks in the south
        for (let i = 0; i < 3; i++) {
            const rx = cx + (i - 1) * TILE_SIZE * 5;
            const ry = cy + TILE_SIZE * 15 + i * TILE_SIZE;
            this.add.sprite(rx, ry, TEXTURE_KEYS.ROCK).setDepth(1);
        }

        // === Mountains hint (far north) ===
        this.addLabel(cx, 2 * TILE_SIZE, 'Mountains (Deep Mines - future)');
    }

    private placeBatteryCells(cx: number, cy: number): void {
        const gameState = GameStateSystem.fromScene(this);
        const cellLocations = [
            { x: cx - TILE_SIZE * 4, y: cy + TILE_SIZE * 3, label: 'Near House' },
            { x: cx + TILE_SIZE * 7, y: cy - TILE_SIZE * 0.5, label: 'By Solar Panel' },
            { x: cx + TILE_SIZE * 4, y: cy - TILE_SIZE * 2, label: 'Inside Garage Area' },
        ];

        cellLocations.forEach((loc, index) => {
            // Add pulsing glow effect
            const glow = this.add.circle(loc.x, loc.y, TILE_SIZE * 0.6, 0x44ff44, 0.3);
            glow.setDepth(0);
            this.tweens.add({
                targets: glow,
                alpha: 0.1,
                scale: 1.2,
                duration: 800,
                yoyo: true,
                repeat: -1,
            });

            const cell = this.add.sprite(loc.x, loc.y, TEXTURE_KEYS.BATTERY_CELL).setDepth(3);
            this.addInteractable(cell, 'Pick Up Battery Cell', 'Battery cell collected!', {
                id: `battery_cell_${index}`,
                oneTime: true,
                onInteract: () => {
                    glow.destroy();
                    gameState.inventory.add('battery_cell');
                    gameState.quests.updateProgress('collect_cells', 1);

                    const count = gameState.inventory.getCount('battery_cell');
                    if (count < 3) {
                        this.showHint(`Battery cell collected! (${count}/3)`);
                    } else {
                        this.showHint('All battery cells collected! Use the terminal.');
                    }
                },
            });
        });
    }

    private onTerminalInteract(): void {
        const gameState = GameStateSystem.fromScene(this);
        const quest = gameState.quests.getActiveQuest();

        // Check if we have all battery cells
        if (!gameState.inventory.has('battery_cell', 3)) {
            const count = gameState.inventory.getCount('battery_cell');
            this.showHint(`Need 3 battery cells to repair. Found: ${count}/3`);
            return;
        }

        // Check if already on the terminal step
        const currentStep = gameState.quests.getCurrentStep();
        if (!currentStep || currentStep.id !== 'use_terminal') {
            this.showHint('Need all battery cells first!');
            return;
        }

        // Launch the puzzle
        this.scene.pause();
        this.scene.launch('CircuitPuzzleScene', {
            puzzleId: 'battery_repair',
            onComplete: () => this.onPuzzleComplete(),
        });
    }

    private onPuzzleComplete(): void {
        const gameState = GameStateSystem.fromScene(this);

        // Complete the quest
        gameState.quests.completeCurrentStep();
        gameState.powerRestored = true;

        // Remove battery cells from inventory (they were used)
        gameState.inventory.remove('battery_cell', 3);

        // Show completion dialogue
        this.time.delayedCall(500, () => {
            gameState.dialogue.say('Robot', "Power's back! Nice work, partner.");
            gameState.dialogue.say('Robot', "Now we can get to the real work. The spaceship won't build itself!");
        });
    }

    private addLabel(x: number, y: number, text: string, size = '11px') {
        this.add.text(x, y, text, {
            fontSize: size,
            color: '#444444',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setDepth(5);
    }
}
