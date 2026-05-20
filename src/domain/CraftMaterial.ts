import type { ICombinable } from "./interfaces";
import type { ItemDefinition } from "./types";
import { Item } from "./Item";

export class CraftMaterial extends Item implements ICombinable {
  constructor(def: ItemDefinition) {
    super(def);
  }

  combine(other: Item): string | null {
    if (other.type !== "craft" && other.type !== "ammo") {
      return null;
    }
    return `Комбінування ${this.name} + ${other.name} — використайте верстат крафту`;
  }
}
