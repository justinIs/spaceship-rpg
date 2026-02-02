# Spaceship RPG - Game Design Document

## Concept
You're an aspiring space explorer living on a quiet homestead in Greenland. You have a house, a garage (your workshop), and your AI robot companion. The land is vast, sparse, and beautiful — rolling green tundra, rocky outcrops, distant mountains, and clear skies. Nearby mines hold iron ore and rare earth minerals. You gather resources, earn money, manage power, and slowly build your dream spaceship in the garage.

## Setting
- **Location**: Rural Greenland — open tundra, rocky terrain, sparse vegetation, clear skies
- **Player's lot**: House + garage (workshop) on a nice patch of land
- **Nearby**: Mines (iron, rare earth), scattered scrap, distant neighbours
- **Tone**: Quiet, cozy, optimistic. Think peaceful homesteading meets sci-fi tinkering.
- **Future scope**: Other planets, water activities, fishing, neighbour interactions

## World Map (Overworld Layout - Initial)
```
 [Mountains / Deep Mines]     (far north - rare earth, advanced)
         |
    [Iron Mine]               (north - main ore source)
         |
  [Rocky Outcrops / Scrap]    (mid - scrap metal scattered)
         |
   [Player's Land]            (center)
   - House (save, rest, robot tips)
   - Garage (workshop, spaceship build)
   - Solar panels (power)
         |
   [Open Tundra]              (south - exploration, events)
         |
  [Distant Neighbours]        (far south - future: trade, jobs, help)
         |
    [Coast / Water]            (far future scope)
```

## Characters

### Player
- Moves freely in the 2D overworld
- Can mine basic resources (ore, scrap metal)
- Interacts with environment objects
- Can issue commands to the robot
- Takes direct control of robot for mini-games
- Earns and spends money
- Manages power budget

### Robot Companion (AI Assistant)
- Battery-powered (draws from shared power supply)
- Follows the player or can be sent to locations
- Offers contextual tips and hints via dialogue
- Handles automated tasks (smelting, crafting queue, scanning)
- Player can "jack in" to control robot directly for mini-games
- More capable with better batteries/power supply

## Core Game Loop

```
EXPLORE -> GATHER -> PROCESS -> BUILD/SELL -> MANAGE POWER -> (repeat)
```

1. **Explore**: Move around the overworld, discover resource nodes and points of interest
2. **Gather**: Mine raw materials, collect scrap (some require player, some can be automated)
3. **Process**: Robot processes raw materials into components (uses power)
4. **Build or Sell**: Use components to build spaceship parts OR sell for money
5. **Manage Power**: Keep batteries charged, expand solar capacity, fuel backup generators

## Resources
| Resource | Where | Used For |
|----------|-------|----------|
| Iron Ore | Iron Mine | Components, hull plates |
| Scrap Metal | Scattered in rocky areas, junkyard | Basic parts, sell for money |
| Rare Earth Minerals | Deep Mines (advanced) | Batteries, electronics, high-tech parts |
| Components | Robot processes ore/scrap | Spaceship parts, sellable |
| Money ($) | Sell goods, jobs, mini-games | Buy parts, upgrades, fuel, supplies |

## Power / Energy System
Everything runs on batteries. Power is a core management mechanic.

### Power Sources
| Source | Details |
|--------|---------|
| **Solar Panels** | Primary goal. Free energy when sun is up. Start with 1 small panel. Buy/build more. |
| **Fuel Generator** | Backup. Burns fuel ($$ to buy). Noisy, reliable. Available early. |
| **Nuclear** | Late-game. Expensive to build, cheap to run. Requires rare earth minerals. |

### Power Consumers
- Robot operations (following, processing, automation)
- Workshop tools (crafting, smelting)
- Lights (house, garage — cosmetic but affects mood/tips)
- Spaceship systems (testing, trial runs)

### Battery System
- Batteries store energy for use when solar isn't generating (night, cloudy)
- Start with basic battery. Upgrade capacity with rare earth minerals.
- Battery quality affects robot range and capability
- Low power = robot slows down, can't automate, limited tips

## Economy
- Selling processed components pays more than raw scrap
- Mini-game rewards pay out money (pest control contracts, robot arena, trial runs)
- Some spaceship parts can only be bought (rare electronics, fuel)
- Robot upgrades cost money (faster processing, better automation)
- Power infrastructure costs money (panels, generators, batteries)
- **Trial runs**: Once partial spaceship is built, test flights for money (risk/reward)

## Spaceship Build Progression
The spaceship sits in the garage, visually updating as parts are added. Always visible, always one more part away.

1. **Hull Frame** - 20 Iron Ore worth of Components (or buy for $500)
2. **Navigation System** - Buy for $800 (rare electronics)
3. **Engine** - 15 Components + $300
4. **Life Support** - 10 Components + $200
5. **Fuel Tank** - 10 Components (or buy for $400)
6. **Power Core** - Rare Earth Minerals + Components (ties into energy system)
7. **Fuel** - Buy for $$ (ongoing cost for trial runs)
8. **Cosmetic upgrades** - Paint, decals, fins (money sink)
9. **Performance upgrades** - Better engine, shields (affect trial runs)

Build order is flexible — player chooses what to work on next.

## Mini-Games
All lighthearted, non-violent:

- **Pest Control**: Arctic bugs/critters in the garage — robot shoos them away. Wave-based, earn money.
- **Robot Wrangling**: Stray robots wandering the tundra — herd them back. Like catching escaped roombas.
- **Alien Visitors**: Curious aliens poking around your land — non-violently redirect them. Comedy tone.
- **Trial Runs**: Test flights once spaceship has parts. Dodge/navigate mini-game. Good runs = money.

## Future Scope (not for first iteration)
- **Neighbours**: Live far-ish away. Trade, ask for help, do jobs for them.
- **Fishing**: At the coast. Relaxing activity, sells for money, rare catches.
- **Water activities**: Boat building, underwater exploration.
- **Other planets**: Once spaceship is complete, new worlds to explore.
- **Weather**: Affects solar output, mining conditions, visibility.
- **Seasons**: Greenland daylight varies dramatically — affects solar power.

## UI Layout
- **Overworld**: Top-down 2D view, player + robot visible, house + garage on lot
- **HUD**: Money + resources (top), power/battery meter (top-right), robot status (corner)
- **Action buttons**: Bottom of screen (mobile-friendly)
- **Dialogue**: Robot tips as speech bubbles or bottom panel
- **Inventory**: Slide-out panel — resources, money, power stats, build progress
- **Garage View**: Spaceship with parts highlighted, build menu
- **Mini-games**: Full-screen takeover with back button

## Controls
- **Desktop**: WASD/Arrow keys to move, mouse click to interact, E for nearby objects
- **Mobile**: Virtual joystick (left), action buttons (right), tap to interact

## Visual Style
- Minimal, clean pixel art or simple vector style
- Greenland palette: muted greens, grays, sky blues, rocky browns
- Clear skies, low horizon, wide open spaces
- Small cozy house, garage with visible spaceship silhouette
- UI is clean and uncluttered

## Milestone Plan
- [x] M0: Project setup, basic scene with player movement
- [ ] M1: Robot companion follows player, basic dialogue
- [ ] M2: Resource nodes, mining mechanic, scrap collection
- [ ] M3: Inventory system, resource processing, money
- [ ] M4: Power/battery system, solar panels
- [ ] M5: Build system, spaceship progress in garage
- [ ] M6: Selling/economy loop
- [ ] M7: First mini-game (pest control)
- [ ] M8: Trial runs mini-game
- [ ] M9: Polish, mobile controls, full loop playable
