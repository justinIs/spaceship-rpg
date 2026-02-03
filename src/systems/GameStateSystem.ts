import Phaser from 'phaser';
import { InventorySystem } from './InventorySystem';
import { QuestSystem } from './QuestSystem';
import { DialogueSystem } from './DialogueSystem';

/**
 * GameStateSystem: Central singleton managing global game state.
 * Accessed via Phaser registry for cross-scene communication.
 */
export class GameStateSystem {
  private static instance: GameStateSystem | null = null;

  public inventory: InventorySystem;
  public quests: QuestSystem;
  public dialogue: DialogueSystem;

  // Game flags
  public powerRestored = false;
  public introComplete = false;

  private constructor() {
    this.inventory = new InventorySystem();
    this.quests = new QuestSystem();
    this.dialogue = new DialogueSystem();
  }

  static getInstance(): GameStateSystem {
    if (!GameStateSystem.instance) {
      GameStateSystem.instance = new GameStateSystem();
    }
    return GameStateSystem.instance;
  }

  /**
   * Register the game state in Phaser's registry for cross-scene access
   */
  static register(game: Phaser.Game): GameStateSystem {
    const state = GameStateSystem.getInstance();
    game.registry.set('gameState', state);
    return state;
  }

  /**
   * Get game state from a scene's registry
   */
  static fromScene(scene: Phaser.Scene): GameStateSystem {
    return scene.registry.get('gameState') as GameStateSystem;
  }

  /**
   * Reset all game state (for new game)
   */
  reset(): void {
    this.inventory.clear();
    this.quests.reset();
    this.dialogue.clear();
    this.powerRestored = false;
    this.introComplete = false;
  }
}
