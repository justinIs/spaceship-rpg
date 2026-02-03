import Phaser from 'phaser';

export type QuestStatus = 'inactive' | 'active' | 'completed';

export interface QuestStep {
  id: string;
  description: string;
  target?: number;  // For countable objectives
  current?: number; // Current progress
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: QuestStatus;
  steps: QuestStep[];
  currentStepIndex: number;
}

/**
 * QuestSystem: Manages quest progression and step tracking.
 * Emits events when quests update.
 */
export class QuestSystem extends Phaser.Events.EventEmitter {
  private quests: Map<string, Quest> = new Map();
  private activeQuestId: string | null = null;

  constructor() {
    super();
  }

  /**
   * Register a quest from a definition
   */
  addQuest(quest: Omit<Quest, 'status' | 'currentStepIndex'>): void {
    this.quests.set(quest.id, {
      ...quest,
      status: 'inactive',
      currentStepIndex: 0,
    });
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = 'active';
    quest.currentStepIndex = 0;
    this.activeQuestId = questId;
    this.emit('quest-started', quest);
    this.emit('change', quest);
  }

  /**
   * Get the currently active quest
   */
  getActiveQuest(): Quest | null {
    if (!this.activeQuestId) return null;
    return this.quests.get(this.activeQuestId) || null;
  }

  /**
   * Get a specific quest
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get current step of active quest
   */
  getCurrentStep(): QuestStep | null {
    const quest = this.getActiveQuest();
    if (!quest) return null;
    return quest.steps[quest.currentStepIndex] || null;
  }

  /**
   * Update progress on a countable objective
   */
  updateProgress(stepId: string, amount = 1): void {
    const quest = this.getActiveQuest();
    if (!quest) return;

    const step = quest.steps.find(s => s.id === stepId);
    if (!step || step.target === undefined) return;

    step.current = (step.current || 0) + amount;
    this.emit('step-progress', quest, step);
    this.emit('change', quest);

    // Check if step is complete
    if (step.current >= step.target) {
      this.advanceStep();
    }
  }

  /**
   * Manually complete current step and advance
   */
  completeCurrentStep(): void {
    const quest = this.getActiveQuest();
    if (!quest) return;

    this.advanceStep();
  }

  /**
   * Advance to next step or complete quest
   */
  private advanceStep(): void {
    const quest = this.getActiveQuest();
    if (!quest) return;

    quest.currentStepIndex++;

    if (quest.currentStepIndex >= quest.steps.length) {
      // Quest complete
      quest.status = 'completed';
      this.emit('quest-completed', quest);
      this.activeQuestId = null;
    } else {
      this.emit('step-advanced', quest, quest.steps[quest.currentStepIndex]);
    }
    this.emit('change', quest);
  }

  /**
   * Check if a quest is completed
   */
  isCompleted(questId: string): boolean {
    const quest = this.quests.get(questId);
    return quest?.status === 'completed';
  }

  /**
   * Get formatted objective text for display
   */
  getObjectiveText(): string {
    const quest = this.getActiveQuest();
    if (!quest) return '';

    const step = this.getCurrentStep();
    if (!step) return '';

    if (step.target !== undefined) {
      const current = step.current || 0;
      return `${step.description} [${current}/${step.target}]`;
    }
    return step.description;
  }

  /**
   * Reset all quest state
   */
  reset(): void {
    this.quests.clear();
    this.activeQuestId = null;
    this.emit('change', null);
  }
}
