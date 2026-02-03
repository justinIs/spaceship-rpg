import Phaser from 'phaser';
import { TILE_SIZE, PLAYER_SPEED, COLORS } from '../config/constants';

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
        this.load.spritesheet('player', 'src/assets/sprites/player.png', {
            frameWidth: 32,
            frameHeight: 32
        })
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

        this.player = this.physics.add.sprite(homeX, homeY + TILE_SIZE * 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);


        // Create walk animation
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10
        })

        // Robot follows player, starts next to them
        this.robot = this.physics.add.sprite(homeX + TILE_SIZE * 2, homeY + TILE_SIZE * 2, 'robot');
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
        const label = this.add.text(homeX, homeY - TILE_SIZE * 6, 'Your Homestead', {
            fontSize: '14px',
            color: '#333333',
            fontFamily: 'monospace',
        }).setOrigin(0.5);
        label.setDepth(5);

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
    }

    update() {
        this.handlePlayerMovement();
        this.handleRobotFollow();
        this.handleInteraction();
    }

    private handlePlayerMovement() {
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

        // Play correct animation
        if (down) {
            this.player.anims.play('walk-down', true)
        } else {
            this.player.anims.play('idle', true)
        }

        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const norm = 1 / Math.SQRT2;
            vx *= norm;
            vy *= norm;
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
                this.showHint(closest.message);
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

    private addInteractable(sprite: Phaser.GameObjects.Sprite, type: string, message: string) {
        this.interactables.push({ sprite, type, message });
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
        const house = this.add.sprite(cx - TILE_SIZE * 3, cy - TILE_SIZE, 'house').setOrigin(0, 0);
        house.setDepth(2);
        this.addLabel(cx - TILE_SIZE * 1.5, cy - TILE_SIZE * 1.5, 'House');
        this.addInteractable(house, 'Enter House', 'Home sweet home. Rest here to get robot tips.');

        // Garage (workshop)
        const garage = this.add.sprite(cx + TILE_SIZE * 2, cy - TILE_SIZE, 'garage').setOrigin(0, 0);
        garage.setDepth(2);
        this.addLabel(cx + TILE_SIZE * 3.5, cy - TILE_SIZE * 1.5, 'Garage');
        this.addInteractable(garage, 'Open Garage', 'Your workshop. The spaceship awaits...');

        // Solar panel
        const solar = this.add.sprite(cx + TILE_SIZE * 6, cy, 'solar').setDepth(2);
        this.addLabel(cx + TILE_SIZE * 6, cy - TILE_SIZE, 'Solar', '10px');
        this.addInteractable(solar, 'Check Solar', 'Solar panel generating power. Battery: OK');

        // === Rocky area / scrap (between home and mine) ===
        const rockyY = cy - TILE_SIZE * 10;
        for (let i = 0; i < 6; i++) {
            const rx = cx + (i - 3) * TILE_SIZE * 2.5;
            const ry = rockyY + Math.sin(i) * TILE_SIZE * 2;
            this.add.sprite(rx, ry, 'rock').setDepth(1);
        }
        // Scattered scrap
        for (let i = 0; i < 4; i++) {
            const sx = cx + (i - 2) * TILE_SIZE * 3;
            const sy = rockyY + TILE_SIZE * 2 + Math.cos(i * 2) * TILE_SIZE;
            const scrap = this.add.sprite(sx, sy, 'scrap').setDepth(1);
            this.addInteractable(scrap, 'Pick Up Scrap', 'Scrap metal collected! (inventory coming soon)');
        }
        this.addLabel(cx, rockyY - TILE_SIZE * 2, 'Rocky Outcrops');

        // === Iron Mine (north) ===
        const mineY = 6 * TILE_SIZE;
        const mine = this.add.sprite(cx - TILE_SIZE, mineY, 'mine').setOrigin(0, 0).setDepth(2);
        this.addLabel(cx, mineY - TILE_SIZE, 'Iron Mine');
        this.addInteractable(mine, 'Enter Mine', 'The iron mine. Dark and full of ore.');

        // Ore nodes near the mine
        for (let i = 0; i < 5; i++) {
            const ox = cx + (i - 2) * TILE_SIZE * 2;
            const oy = mineY + TILE_SIZE * 3 + (i % 2) * TILE_SIZE;
            const ore = this.add.sprite(ox, oy, 'ore').setDepth(1);
            this.addInteractable(ore, 'Mine Ore', 'Iron ore mined! (inventory coming soon)');
        }

        // === Open Tundra (south) ===
        this.addLabel(cx, cy + TILE_SIZE * 12, 'Open Tundra');

        // A few rocks in the south
        for (let i = 0; i < 3; i++) {
            const rx = cx + (i - 1) * TILE_SIZE * 5;
            const ry = cy + TILE_SIZE * 15 + i * TILE_SIZE;
            this.add.sprite(rx, ry, 'rock').setDepth(1);
        }

        // === Mountains hint (far north) ===
        this.addLabel(cx, 2 * TILE_SIZE, 'Mountains (Deep Mines - future)');
    }

    private addLabel(x: number, y: number, text: string, size = '11px') {
        this.add.text(x, y, text, {
            fontSize: size,
            color: '#444444',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setDepth(5);
    }
}
