import type { IInventoryAccess } from "../domain/interfaces";
import { UpgradePart } from "../domain/UpgradePart";
import { Weapon } from "../domain/Weapon";
import type { GridInventory } from "../inventory/GridInventory";

export class UpgradeService {
  constructor(
    _inventory: IInventoryAccess,
    private getGrid: () => GridInventory
  ) {}

  apply(weaponStackId: string, partStackId: string): { ok: boolean; message: string } {
    const grid = this.getGrid();
    const weaponStack = grid.getStackById(weaponStackId);
    const partStack = grid.getStackById(partStackId);

    if (!weaponStack || !(weaponStack.item instanceof Weapon)) {
      return { ok: false, message: "Оберіть зброю в інвентарі" };
    }
    if (!partStack || !(partStack.item instanceof UpgradePart)) {
      return { ok: false, message: "Оберіть частину апгрейду" };
    }

    const weapon = weaponStack.item;
    const part = partStack.item;

    if (weapon.upgradeSlots.length >= weapon.maxUpgradeSlots) {
      return { ok: false, message: "Немає вільних слотів апгрейду на зброї" };
    }

    const msg = part.applyUpgrade(weapon);
    grid.removeStack(partStackId);
    return { ok: true, message: msg };
  }
}
