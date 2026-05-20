import { createItem, getDefinitionById } from "../domain/factories";
import { Weapon } from "../domain/Weapon";
import type { InventoryStack } from "./GridInventory";
import { findFirstFit } from "./Placement";

function copyItemState(from: InventoryStack["item"], to: InventoryStack["item"]): void {
  if (from instanceof Weapon && to instanceof Weapon) {
    to.damage = from.damage;
    to.durability = from.durability;
    to.upgradeLevel = from.upgradeLevel;
    to.upgradeSlots.length = 0;
    to.upgradeSlots.push(...from.upgradeSlots);
  }
}

export function sortStacksByArea(stacks: InventoryStack[]): InventoryStack[] {
  return [...stacks].sort((a, b) => {
    const areaDiff = b.item.area - a.item.area;
    if (areaDiff !== 0) return areaDiff;
    const nameDiff = a.item.name.localeCompare(b.item.name, "uk");
    if (nameDiff !== 0) return nameDiff;
    return b.quantity - a.quantity;
  });
}

export function repackStacks(sorted: InventoryStack[]): InventoryStack[] {
  const result: InventoryStack[] = [];
  const occupied: { x: number; y: number; width: number; height: number }[] = [];

  for (const src of sorted) {
    const def = getDefinitionById(src.item.id);
    if (!def) continue;
    const pos = findFirstFit(occupied, src.item.slotSize);
    if (!pos) continue;

    const item = createItem(def);
    copyItemState(src.item, item);

    result.push({
      stackId: src.stackId,
      item,
      quantity: src.quantity,
      x: pos.x,
      y: pos.y,
    });
    occupied.push({
      x: pos.x,
      y: pos.y,
      width: src.item.slotSize.width,
      height: src.item.slotSize.height,
    });
  }

  return result;
}

export function sortAndRepack(stacks: InventoryStack[]): InventoryStack[] {
  return repackStacks(sortStacksByArea(stacks));
}
