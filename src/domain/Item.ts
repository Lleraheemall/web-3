import type { IInspectable } from "./interfaces";
import type { ItemDefinition, ItemType, Rarity, SlotSize } from "./types";

export class Item implements IInspectable {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly stackSize: number;
  readonly slotSize: SlotSize;
  readonly type: ItemType;
  readonly rarity: Rarity;
  readonly categoryLabel: string;

  constructor(def: ItemDefinition) {
    this.id = def.id;
    this.name = def.name;
    this.description = def.description;
    this.icon = def.icon;
    this.stackSize = def.stackSize;
    this.slotSize = { ...def.slotSize };
    this.type = def.type;
    this.rarity = def.rarity;
    this.categoryLabel = def.categoryLabel;
  }

  get area(): number {
    return this.slotSize.width * this.slotSize.height;
  }

  inspect(): string {
    return `${this.name}: ${this.description} (${this.slotSize.width}×${this.slotSize.height}, стек до ${this.stackSize})`;
  }
}
