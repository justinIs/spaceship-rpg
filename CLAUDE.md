# Spaceship RPG - Project Guide

## Project Overview
A 2D browser-based spaceship RPG built with TypeScript and Phaser 3. The player works alongside an AI robot companion to mine resources, complete tasks, and ultimately build a spaceship.

## Tech Stack
- **Engine**: Phaser 3 (2D HTML5 game framework)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm

## Commands
- `npm install` - Install dependencies
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Production build to `dist/`
- `npm run preview` - Preview production build

## Project Structure
```
src/
  main.ts           - Game entry point, Phaser config
  scenes/           - Phaser scenes (game states/screens)
    BootScene.ts    - Asset loading
    OverworldScene.ts - Main 2D overworld (primary gameplay)
    MiniGameScene.ts - Base class for mini-game scenes
  entities/         - Game objects (player, robot, resources)
  systems/          - Game systems (inventory, tasks, automation)
  ui/               - HUD and UI components
  assets/           - Sprites, audio, tilemaps
  config/           - Game constants and balance tuning
```

## Architecture Notes
- Each Phaser Scene is a self-contained game state. The overworld is the hub; mini-games launch as overlay or replacement scenes.
- Entity classes extend Phaser.GameObjects and contain their own logic.
- Systems are singletons managed via Phaser's registry/events for cross-scene communication.
- Mobile-first responsive design: touch controls + keyboard/mouse fallback.

## Game Design Summary
See `docs/GAME_DESIGN.md` for full details. Key concepts:
- **Setting**: Rural Greenland homestead — house, garage, mines nearby. Quiet, cozy, optimistic sci-fi.
- **Player Character**: Direct control, can mine, explore, interact, earn/spend money, manage power
- **Robot Companion**: Battery-powered AI assistant, automates tasks, offers tips, player can "jack in" for mini-games
- **Core Loop**: Explore -> Gather -> Process -> Build/Sell -> Manage Power
- **Resources**: Iron Ore, Scrap Metal, Rare Earth Minerals, Components, Money ($)
- **Power System**: Everything battery-powered. Solar (primary), fuel generator (backup), nuclear (late-game). Battery capacity upgradeable.
- **Spaceship**: Long-term carrot-on-stick in the garage. Flexible build order, cosmetic/performance upgrades, trial runs for money.
- **Mini-games**: Lighthearted/non-violent — pest control, robot wrangling, alien visitors, trial runs
- **Future scope**: Neighbours, fishing, water activities, weather/seasons, other planets

## Code Style
- Phaser conventions: PascalCase for scenes/classes, camelCase for methods/variables
- Keep game config/balance values in `src/config/` so they're easy to tune
- Prefer composition over deep inheritance for entities

## Sprite Workflow
- Sprite definitions live in `src/sprites/definitions/` as TypeScript files
- Each sprite has a palette (color index -> hex) and pixel map (2D array)
- Generate PNGs: `npx tsx scripts/generate-sprite-pngs.ts`
- Output: `src/assets/sprites/[name].png`
- User describes sprite → Claude generates palette/pixels → script creates PNG → optional Piskel touchups
