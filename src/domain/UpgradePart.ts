import type { ItemDefinition } from "./types";
import { Item } from "./Item";
import type { Weapon } from "./Weapon";

export class UpgradePart extends Item {
  readonly stat: string;
  readonly bonus: number;

  constructor(def: ItemDefinition) {
    super(def);
    const u = def.upgrade!;
    this.stat = u.stat;
    this.bonus = u.bonus;
  }

  applyUpgrade(weapon: Weapon): string {
    if (weapon.upgradeSlots.length >= weapon.maxUpgradeSlots) {
      return `На ${weapon.name} немає вільних слотів`;
    }
    const msg = weapon.upgrade(this.name);
    if (this.stat === "damage") {
      weapon.damage += this.bonus;
    }
    return msg;
  }
}
