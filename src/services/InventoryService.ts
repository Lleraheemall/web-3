import type { IInventoryAccess } from "../domain/interfaces";
import { GridInventory } from "../inventory/GridInventory";
import { sortAndRepack } from "../inventory/Sorter";

export class InventoryService implements IInventoryAccess {
  private grid = new GridInventory();

  getGrid(): GridInventory {
    return this.grid;
  }

  addItem(itemId: string, count: number): {
    added: number;
    requested: number;
    message: string;
  } {
    const result = this.grid.addQuantity(itemId, count);
    const message =
      result.added === result.requested
        ? `Додано ${result.added} шт.`
        : result.added > 0
          ? `Додано лише ${result.added} з ${result.requested} (немає місця)`
          : "Недостатньо місця в інвентарі";
    return { ...result, message };
  }

  getTotalCount(itemId: string): number {
    return this.grid.getTotalCount(itemId);
  }

  removeQuantity(itemId: string, count: number): boolean {
    return this.grid.removeQuantity(itemId, count);
  }

  addByDefinition(itemId: string, count: number): { added: number; requested: number } {
    return this.grid.addQuantity(itemId, count);
  }

  sort(): { packed: number; dropped: number } {
    const before = this.grid.getStacks().length;
    const repacked = sortAndRepack([...this.grid.getStacks()]);
    this.grid.setStacks(repacked);
    return { packed: repacked.length, dropped: before - repacked.length };
  }

  clear(): void {
    this.grid.clear();
  }

  removeOne(stackId: string): { ok: boolean; message: string } {
    const stack = this.grid.getStackById(stackId);
    if (!stack) return { ok: false, message: "Стек не знайдено" };
    if (stack.item.type === "key") {
      return { ok: false, message: "Ключові предмети не можна витратити" };
    }
    const ok = this.grid.removeOneFromStack(stackId);
    return ok
      ? { ok: true, message: "Знято 1 одиницю" }
      : { ok: false, message: "Не вдалося зняти" };
  }

  removeStack(stackId: string): { ok: boolean; message: string } {
    const stack = this.grid.getStackById(stackId);
    if (!stack) return { ok: false, message: "Стек не знайдено" };
    if (stack.item.type === "key") {
      return { ok: false, message: "Ключові предмети не можна видалити" };
    }
    const ok = this.grid.removeStack(stackId);
    return ok
      ? { ok: true, message: "Стек видалено" }
      : { ok: false, message: "Не вдалося видалити" };
  }

  moveStack(stackId: string, x: number, y: number): { ok: boolean; message: string } {
    const stack = this.grid.getStackById(stackId);
    if (!stack) return { ok: false, message: "Стек не знайдено" };
    if (stack.x === x && stack.y === y) {
      return { ok: true, message: "" };
    }
    const ok = this.grid.moveStack(stackId, x, y);
    return ok
      ? { ok: true, message: "Предмет переміщено" }
      : { ok: false, message: "Тут немає місця" };
  }

  canMoveStack(stackId: string, x: number, y: number): boolean {
    return this.grid.canMoveStack(stackId, x, y);
  }
}
