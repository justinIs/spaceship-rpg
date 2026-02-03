import Phaser from 'phaser';
import { GameStateSystem } from '../systems/GameStateSystem';

/**
 * ObjectiveTracker: Top-left quest display showing current quest and progress.
 */
export class ObjectiveTracker {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create container (fixed to camera)
    this.container = scene.add.container(10, 10);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    // Background
    this.background = scene.add.rectangle(0, 0, 200, 50, 0x000000, 0.6);
    this.background.setOrigin(0, 0);

    // Quest title
    this.titleText = scene.add.text(8, 6, '', {
      fontSize: '12px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Objective text
    this.objectiveText = scene.add.text(8, 24, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    this.container.add([this.background, this.titleText, this.objectiveText]);

    // Initially hidden
    this.container.setVisible(false);

    // Listen for quest changes
    const gameState = GameStateSystem.fromScene(scene);
    gameState.quests.on('change', () => this.update());
  }

  update(): void {
    const gameState = GameStateSystem.fromScene(this.scene);
    const quest = gameState.quests.getActiveQuest();

    if (!quest) {
      this.container.setVisible(false);
      return;
    }

    this.container.setVisible(true);
    this.titleText.setText(quest.name);
    this.objectiveText.setText(gameState.quests.getObjectiveText());

    // Resize background to fit content
    const maxWidth = Math.max(
      this.titleText.width + 16,
      this.objectiveText.width + 16,
      120
    );
    this.background.setSize(maxWidth, 50);
  }

  destroy(): void {
    this.container.destroy();
  }
}
