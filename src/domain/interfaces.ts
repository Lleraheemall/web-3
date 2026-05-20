import type { Item } from "./Item";

export interface IInspectable {
  inspect(): string;
}

export interface IUsable {
  use(): string;
}

export interface ICombinable {
  combine(other: Item): string | null;
}

export interface IUpgradeable {
  upgrade(partName: string): string;
  readonly upgradeLevel: number;
  readonly maxUpgradeSlots: number;
}

export interface IInventoryAccess {
  getTotalCount(itemId: string): number;
  removeQuantity(itemId: string, count: number): boolean;
  addByDefinition(itemId: string, count: number): { added: number; requested: number };
}
