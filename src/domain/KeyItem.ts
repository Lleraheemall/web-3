import type { ItemDefinition } from "./types";
import { Item } from "./Item";

export class KeyItem extends Item {
  constructor(def: ItemDefinition) {
    super(def);
  }

  inspect(): string {
    return `${this.name} (ключовий предмет): ${this.description}`;
  }
}
