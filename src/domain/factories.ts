import type { ItemDefinition } from "./types";
import { Consumable } from "./Consumable";
import { CraftMaterial } from "./CraftMaterial";
import { Item } from "./Item";
import { KeyItem } from "./KeyItem";
import { UpgradePart } from "./UpgradePart";
import { Weapon } from "./Weapon";

export function createItem(def: ItemDefinition): Item {
  switch (def.type) {
    case "weapon":
      return new Weapon(def);
    case "consumable":
      return new Consumable(def);
    case "craft":
    case "ammo":
      return def.type === "ammo"
        ? new CraftMaterial(def)
        : new CraftMaterial(def);
    case "key":
      return new KeyItem(def);
    case "upgrade":
      return new UpgradePart(def);
    default:
      return new Item(def);
  }
}

let catalog: ItemDefinition[] = [];

export function setCatalog(defs: ItemDefinition[]): void {
  catalog = defs;
}

export function getDefinitionById(id: string): ItemDefinition | undefined {
  return catalog.find((d) => d.id === id);
}

export function getAllDefinitions(): ItemDefinition[] {
  return [...catalog];
}
