import type { IUsable } from "./interfaces";
import type { ItemDefinition } from "./types";
import { Item } from "./Item";

export class Consumable extends Item implements IUsable {
  readonly healAmount: number;
  readonly buffType?: string;

  constructor(def: ItemDefinition) {
    super(def);
    this.healAmount = def.consumable?.healAmount ?? 0;
    this.buffType = def.consumable?.buffType;
  }

  use(): string {
    return this.heal();
  }

  heal(): string {
    return `Використано ${this.name}: +${this.healAmount} HP`;
  }

  buff(): string {
    if (!this.buffType) return `${this.name}: немає ефекту бафу`;
    return `Активовано ${this.buffType} через ${this.name}`;
  }
}
