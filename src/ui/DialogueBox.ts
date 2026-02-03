import Phaser from 'phaser';
import { GameStateSystem } from '../systems/GameStateSystem';
import { DialogueMessage } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

/**
 * DialogueBox: Bottom panel speech bubble for robot dialogue with typewriter effect.
 */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private speakerText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;

  private fullText = '';
  private displayedText = '';
  private charIndex = 0;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private autoDismissTimer: Phaser.Time.TimerEvent | null = null;
  private currentDuration = 0;

  private readonly CHAR_DELAY = 30; // ms per character
  private readonly BOX_HEIGHT = 80;
  private readonly PADDING = 12;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create container (fixed to camera, at bottom)
    this.container = scene.add.container(0, GAME_HEIGHT - this.BOX_HEIGHT);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    // Background
    this.background = scene.add.rectangle(0, 0, GAME_WIDTH, this.BOX_HEIGHT, 0x222244, 0.9);
    this.background.setOrigin(0, 0);
    this.background.setStrokeStyle(2, 0x4444aa);

    // Speaker name
    this.speakerText = scene.add.text(this.PADDING, 8, '', {
      fontSize: '12px',
      color: '#88ccff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Message text
    this.messageText = scene.add.text(this.PADDING, 28, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - this.PADDING * 2 },
    });

    // Continue prompt
    this.continueText = scene.add.text(GAME_WIDTH - this.PADDING, this.BOX_HEIGHT - 12, '[E] or tap to continue', {
      fontSize: '10px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    this.continueText.setOrigin(1, 1);

    this.container.add([this.background, this.speakerText, this.messageText, this.continueText]);

    // Initially hidden
    this.container.setVisible(false);

    // Listen for dialogue events
    const gameState = GameStateSystem.fromScene(scene);
    gameState.dialogue.on('dialogue-show', (msg: DialogueMessage) => this.showMessage(msg));
    gameState.dialogue.on('dialogue-end', () => this.hide());

    // Input to dismiss
    scene.input.keyboard!.on('keydown-E', () => this.onDismiss());
    scene.input.keyboard!.on('keydown-SPACE', () => this.onDismiss());
    scene.input.on('pointerdown', () => this.onDismiss());
  }

  private showMessage(message: DialogueMessage): void {
    this.container.setVisible(true);
    this.speakerText.setText(message.speaker);
    this.fullText = message.text;
    this.displayedText = '';
    this.charIndex = 0;
    this.currentDuration = message.duration || 0;
    this.messageText.setText('');
    this.continueText.setVisible(false);

    // Clear existing timers
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
    }
    if (this.autoDismissTimer) {
      this.autoDismissTimer.destroy();
    }

    // Start typewriter effect
    this.typewriterTimer = this.scene.time.addEvent({
      delay: this.CHAR_DELAY,
      callback: this.typeNextChar,
      callbackScope: this,
      loop: true,
    });
  }

  private typeNextChar(): void {
    if (this.charIndex >= this.fullText.length) {
      // Done typing
      this.typewriterTimer?.destroy();
      this.typewriterTimer = null;
      this.onTypeComplete();
      return;
    }

    this.displayedText += this.fullText[this.charIndex];
    this.charIndex++;
    this.messageText.setText(this.displayedText);
  }

  private onTypeComplete(): void {
    this.continueText.setVisible(true);

    // Auto-dismiss after duration if set
    if (this.currentDuration > 0) {
      this.autoDismissTimer = this.scene.time.delayedCall(this.currentDuration, () => {
        const gameState = GameStateSystem.fromScene(this.scene);
        gameState.dialogue.dismiss();
      });
    }
  }

  private onDismiss(): void {
    if (!this.container.visible) return;

    // If still typing, complete immediately
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
      this.displayedText = this.fullText;
      this.messageText.setText(this.displayedText);
      this.onTypeComplete();
      return;
    }

    // Otherwise dismiss and show next
    if (this.autoDismissTimer) {
      this.autoDismissTimer.destroy();
      this.autoDismissTimer = null;
    }
    const gameState = GameStateSystem.fromScene(this.scene);
    gameState.dialogue.dismiss();
  }

  private hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    if (this.typewriterTimer) this.typewriterTimer.destroy();
    if (this.autoDismissTimer) this.autoDismissTimer.destroy();
    this.container.destroy();
  }
}
