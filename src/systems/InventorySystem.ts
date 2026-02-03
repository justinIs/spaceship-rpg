import Phaser from 'phaser';

export interface InventoryItem {
  id: string;
  count: number;
}

/**
 * InventorySystem: Manages player inventory with item add/remove/check operations.
 * Emits events when inventory changes.
 */
export class InventorySystem extends Phaser.Events.EventEmitter {
  private items: Map<string, number> = new Map();

  constructor() {
    super();
  }

  /**
   * Add items to inventory
   */
  add(itemId: string, count = 1): void {
    const current = this.items.get(itemId) || 0;
    this.items.set(itemId, current + count);
    this.emit('item-added', itemId, count, this.getCount(itemId));
    this.emit('change');
  }

  /**
   * Remove items from inventory
   * Returns true if successful, false if not enough items
   */
  remove(itemId: string, count = 1): boolean {
    const current = this.items.get(itemId) || 0;
    if (current < count) return false;

    const newCount = current - count;
    if (newCount === 0) {
      this.items.delete(itemId);
    } else {
      this.items.set(itemId, newCount);
    }
    this.emit('item-removed', itemId, count, newCount);
    this.emit('change');
    return true;
  }

  /**
   * Check if player has at least `count` of an item
   */
  has(itemId: string, count = 1): boolean {
    return (this.items.get(itemId) || 0) >= count;
  }

  /**
   * Get the count of an item
   */
  getCount(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  /**
   * Get all items as an array
   */
  getAll(): InventoryItem[] {
    return Array.from(this.items.entries()).map(([id, count]) => ({ id, count }));
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.items.clear();
    this.emit('change');
  }
}
