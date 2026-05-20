import { ITEM_DEFINITIONS } from "../data/items";
import { setCatalog } from "../domain/factories";
import type { ItemType } from "../domain/types";
import { InventoryService } from "../services/InventoryService";
import { CraftingService } from "../services/CraftingService";
import { UpgradeService } from "../services/UpgradeService";

setCatalog(ITEM_DEFINITIONS);

export class AppState {
  readonly inventory = new InventoryService();
  readonly crafting = new CraftingService(this.inventory);
  readonly upgrades = new UpgradeService(this.inventory, () => this.inventory.getGrid());

  catalogSearch = "";
  catalogFilter: ItemType | "all" = "all";
  selectedStackId: string | null = null;
  selectedRecipeId: string | null = null;

  listeners: Set<() => void> = new Set();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const appState = new AppState();
