import { createItem, getDefinitionById } from "../domain/factories";
import type { Item } from "../domain/Item";
import { Weapon } from "../domain/Weapon";
import { GRID_COLS, GRID_ROWS } from "../domain/types";
import { canPlace, findFirstFit, type Rect } from "./Placement";

export interface InventoryStack {
  stackId: string;
  item: Item;
  quantity: number;
  x: number;
  y: number;
}

let stackCounter = 0;

function nextStackId(): string {
  stackCounter += 1;
  return `stack-${stackCounter}`;
}

export class GridInventory {
  private stacks: InventoryStack[] = [];

  getStacks(): readonly InventoryStack[] {
    return [...this.stacks];
  }

  getStackById(stackId: string): InventoryStack | undefined {
    return this.stacks.find((s) => s.stackId === stackId);
  }

  getOccupiedRects(excludeStackId?: string): Rect[] {
    return this.stacks
      .filter((s) => s.stackId !== excludeStackId)
      .map((s) => ({
        x: s.x,
        y: s.y,
        width: s.item.slotSize.width,
        height: s.item.slotSize.height,
      }));
  }

  getTotalCount(itemId: string): number {
    return this.stacks
      .filter((s) => s.item.id === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }

  addQuantity(itemId: string, count: number): { added: number; requested: number } {
    let remaining = count;
    let added = 0;
    const def = getDefinitionById(itemId);
    if (!def) return { added: 0, requested: count };

    // Кожна одиниця — окремий слот у сітці, без об'єднання в стеки.
    while (remaining > 0) {
      const newItem = createItem(def);
      const pos = findFirstFit(this.getOccupiedRects(), newItem.slotSize);
      if (!pos) break;

      this.stacks.push({
        stackId: nextStackId(),
        item: newItem,
        quantity: 1,
        x: pos.x,
        y: pos.y,
      });
      remaining -= 1;
      added += 1;
    }

    return { added, requested: count };
  }

  removeQuantity(itemId: string, count: number): boolean {
    let left = count;
    const matching = this.stacks
      .filter((s) => s.item.id === itemId)
      .sort((a, b) => b.quantity - a.quantity);

    for (const stack of matching) {
      if (left <= 0) break;
      const take = Math.min(left, stack.quantity);
      stack.quantity -= take;
      left -= take;
      if (stack.quantity <= 0) {
        this.stacks = this.stacks.filter((s) => s.stackId !== stack.stackId);
      }
    }
    return left === 0;
  }

  removeOneFromStack(stackId: string): boolean {
    const stack = this.getStackById(stackId);
    if (!stack) return false;
    if (stack.item.type === "key") return false;
    this.stacks = this.stacks.filter((s) => s.stackId !== stackId);
    return true;
  }

  removeStack(stackId: string): boolean {
    const stack = this.getStackById(stackId);
    if (!stack) return false;
    if (stack.item.type === "key") return false;
    this.stacks = this.stacks.filter((s) => s.stackId !== stackId);
    return true;
  }

  moveStack(stackId: string, x: number, y: number): boolean {
    const stack = this.getStackById(stackId);
    if (!stack) return false;
    if (stack.x === x && stack.y === y) return true;
    const occupied = this.getOccupiedRects(stackId);
    if (!canPlace(occupied, stack.item.slotSize, x, y)) return false;
    stack.x = x;
    stack.y = y;
    return true;
  }

  canMoveStack(stackId: string, x: number, y: number): boolean {
    const stack = this.getStackById(stackId);
    if (!stack) return false;
    if (stack.x === x && stack.y === y) return true;
    return canPlace(this.getOccupiedRects(stackId), stack.item.slotSize, x, y);
  }

  clear(): void {
    this.stacks = [];
  }

  setStacks(stacks: InventoryStack[]): void {
    this.stacks = stacks.map((s) => ({
      ...s,
      item: s.item,
    }));
  }

  getStats(): {
    cols: number;
    rows: number;
    totalCells: number;
    occupiedCells: number;
    stackCount: number;
    upgradeCount: number;
  } {
    let occupiedCells = 0;
    let upgradeCount = 0;
    for (const s of this.stacks) {
      occupiedCells += s.item.slotSize.width * s.item.slotSize.height;
      if (s.item instanceof Weapon) {
        upgradeCount += s.item.upgradeLevel;
      }
    }
    return {
      cols: GRID_COLS,
      rows: GRID_ROWS,
      totalCells: GRID_COLS * GRID_ROWS,
      occupiedCells,
      stackCount: this.stacks.length,
      upgradeCount,
    };
  }

  getWeaponStacks(): InventoryStack[] {
    return this.stacks.filter((s) => s.item instanceof Weapon);
  }

  getUpgradePartStacks(): InventoryStack[] {
    return this.stacks.filter((s) => s.item.type === "upgrade");
  }
}
