/**
 * Item definitions for the game
 */

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  stackable: boolean;
  maxStack: number;
  textureKey: string;
}

export const ITEMS: Record<string, ItemDefinition> = {
  battery_cell: {
    id: 'battery_cell',
    name: 'Battery Cell',
    description: 'A power cell for the main battery. Collect 3 to restore power.',
    stackable: true,
    maxStack: 99,
    textureKey: 'battery_cell',
  },
  scrap_metal: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    description: 'Salvaged metal. Useful for crafting.',
    stackable: true,
    maxStack: 99,
    textureKey: 'scrap',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    description: 'Raw iron ore from the mines.',
    stackable: true,
    maxStack: 99,
    textureKey: 'ore',
  },
};

export function getItem(id: string): ItemDefinition | undefined {
  return ITEMS[id];
}
