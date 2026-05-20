import type { RecipeDefinition } from "../domain/types";

export const RECIPE_DEFINITIONS: RecipeDefinition[] = [
  {
    id: "handgun-ammo-recipe",
    name: "Набої 9mm (Gunpowder + Chemical Fluid)",
    ingredients: [
      { itemId: "gunpowder", count: 1 },
      { itemId: "chemical-fluid", count: 1 },
    ],
    result: { itemId: "handgun-ammo", count: 15 },
    craftTimeMs: 500,
  },
  {
    id: "first-aid-spray-recipe",
    name: "Спрей (Herb + Chemical Fluid)",
    ingredients: [
      { itemId: "herb-green", count: 2 },
      { itemId: "chemical-fluid", count: 1 },
    ],
    result: { itemId: "spray", count: 1 },
    craftTimeMs: 800,
  },
  {
    id: "grenade-recipe",
    name: "Граната (Gunpowder + Explosive)",
    ingredients: [
      { itemId: "gunpowder", count: 2 },
      { itemId: "explosive-compound", count: 1 },
    ],
    result: { itemId: "grenade", count: 1 },
    craftTimeMs: 1200,
  },
];
