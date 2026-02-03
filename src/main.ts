import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { OverworldScene } from './scenes/OverworldScene';
import { CircuitPuzzleScene } from './scenes/CircuitPuzzleScene';
import { GameStateSystem } from './systems/GameStateSystem';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#87ceeb',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, OverworldScene, CircuitPuzzleScene],
  callbacks: {
    postBoot: (game) => {
      // Register global game state
      GameStateSystem.register(game);
    },
  },
};

new Phaser.Game(config);
