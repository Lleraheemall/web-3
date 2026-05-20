export type ItemType =
  | "weapon"
  | "consumable"
  | "ammo"
  | "craft"
  | "key"
  | "upgrade";

export type Rarity = "common" | "uncommon" | "rare";

export interface SlotSize {
  width: number;
  height: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  stackSize: number;
  slotSize: SlotSize;
  type: ItemType;
  rarity: Rarity;
  categoryLabel: string;
  weapon?: {
    damage: number;
    ammoType: string;
    durability: number;
    maxUpgradeSlots: number;
  };
  consumable?: {
    healAmount?: number;
    buffType?: string;
  };
  upgrade?: {
    stat: string;
    bonus: number;
  };
}

export interface RecipeDefinition {
  id: string;
  name: string;
  ingredients: { itemId: string; count: number }[];
  result: { itemId: string; count: number };
  craftTimeMs?: number;
}

export const CATEGORY_LABELS: Record<ItemType, string> = {
  weapon: "Зброя",
  consumable: "Споживні",
  ammo: "Боєприпаси",
  craft: "Матеріали",
  key: "Ключові",
  upgrade: "Апгрейди",
};

export const GRID_COLS = 10;
export const GRID_ROWS = 8;
