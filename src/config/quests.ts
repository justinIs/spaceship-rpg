/**
 * Quest definitions for the game
 */

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    description: string;
    target?: number;
  }[];
}

export const QUESTS: Record<string, QuestDefinition> = {
  fix_battery: {
    id: 'fix_battery',
    name: 'Fix the Battery',
    description: 'Power is out. Find the scattered battery cells and restore power.',
    steps: [
      {
        id: 'collect_cells',
        description: 'Find Battery Cells',
        target: 3,
      },
      {
        id: 'use_terminal',
        description: 'Use the Terminal to restore power',
      },
    ],
  },
};

export function getQuest(id: string): QuestDefinition | undefined {
  return QUESTS[id];
}
