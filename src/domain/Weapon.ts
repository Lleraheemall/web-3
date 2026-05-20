import type { IUpgradeable, IUsable } from "./interfaces";
import type { ItemDefinition } from "./types";
import { Item } from "./Item";

export class Weapon extends Item implements IUsable, IUpgradeable {
  damage: number;
  ammoType: string;
  durability: number;
  upgradeLevel = 0;
  readonly maxUpgradeSlots: number;
  readonly upgradeSlots: string[] = [];

  constructor(def: ItemDefinition) {
    super(def);
    const w = def.weapon!;
    this.damage = w.damage;
    this.ammoType = w.ammoType;
    this.durability = w.durability;
    this.maxUpgradeSlots = w.maxUpgradeSlots;
  }

  use(): string {
    return `${this.name}: постріл (${this.damage} шкоди, ${this.ammoType})`;
  }

  shoot(): string {
    if (this.durability <= 0) return `${this.name}: зброя зламалась`;
    this.durability = Math.max(0, this.durability - 1);
    return `Постріл з ${this.name}, міцність ${this.durability}`;
  }

  reload(): string {
    return `Перезарядка ${this.name} (${this.ammoType})`;
  }

  upgrade(partName: string): string {
    if (this.upgradeSlots.length >= this.maxUpgradeSlots) {
      return `${this.name}: немає вільних слотів апгрейду`;
    }
    this.upgradeSlots.push(partName);
    this.upgradeLevel += 1;
    return `${this.name}: встановлено «${partName}» (рівень ${this.upgradeLevel})`;
  }
}
