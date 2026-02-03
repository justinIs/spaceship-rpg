import Phaser from 'phaser';

export interface DialogueMessage {
  speaker: string;
  text: string;
  duration?: number; // Auto-dismiss after duration (ms), or wait for dismiss
}

/**
 * DialogueSystem: Manages dialogue message queue with typewriter effect.
 * Emits events for UI to display.
 */
export class DialogueSystem extends Phaser.Events.EventEmitter {
  private queue: DialogueMessage[] = [];
  private currentMessage: DialogueMessage | null = null;
  private isDisplaying = false;

  constructor() {
    super();
  }

  /**
   * Queue a dialogue message
   */
  say(speaker: string, text: string, duration = 3000): void {
    this.queue.push({ speaker, text, duration });

    if (!this.isDisplaying) {
      this.showNext();
    }
  }

  /**
   * Queue multiple messages
   */
  sayMultiple(messages: DialogueMessage[]): void {
    this.queue.push(...messages);

    if (!this.isDisplaying) {
      this.showNext();
    }
  }

  /**
   * Show the next message in queue
   */
  private showNext(): void {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      this.currentMessage = null;
      this.emit('dialogue-end');
      return;
    }

    this.isDisplaying = true;
    this.currentMessage = this.queue.shift()!;
    this.emit('dialogue-show', this.currentMessage);
  }

  /**
   * Dismiss current message and show next (called by UI or auto-timer)
   */
  dismiss(): void {
    if (!this.isDisplaying) return;
    this.showNext();
  }

  /**
   * Get current message being displayed
   */
  getCurrent(): DialogueMessage | null {
    return this.currentMessage;
  }

  /**
   * Check if dialogue is active
   */
  isActive(): boolean {
    return this.isDisplaying;
  }

  /**
   * Clear all queued messages
   */
  clear(): void {
    this.queue = [];
    this.currentMessage = null;
    this.isDisplaying = false;
    this.emit('dialogue-end');
  }
}
