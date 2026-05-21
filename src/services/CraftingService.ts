import type { IInventoryAccess } from "../domain/interfaces";
import type { RecipeDefinition } from "../domain/types";
import { RECIPE_DEFINITIONS } from "../data/recipes";

export class CraftingService {
  constructor(private inventory: IInventoryAccess) {}

  getRecipes(): RecipeDefinition[] {
    return [...RECIPE_DEFINITIONS];
  }

  canCraft(recipeId: string): boolean {
    const recipe = RECIPE_DEFINITIONS.find((r) => r.id === recipeId);
    if (!recipe) return false;
    return recipe.ingredients.every(
      (ing) => this.inventory.getTotalCount(ing.itemId) >= ing.count
    );
  }

  async craft(recipeId: string): Promise<{ ok: boolean; message: string }> {
    const recipe = RECIPE_DEFINITIONS.find((r) => r.id === recipeId);
    if (!recipe) return { ok: false, message: "Рецепт не знайдено" };

    if (!this.canCraft(recipeId)) {
      return { ok: false, message: "Недостатньо матеріалів" };
    }

    if (recipe.craftTimeMs) {
      await new Promise((r) => setTimeout(r, recipe.craftTimeMs));
    }

    for (const ing of recipe.ingredients) {
      const removed = this.inventory.removeQuantity(ing.itemId, ing.count);
      if (!removed) {
        return { ok: false, message: "Помилка зняття інгредієнтів" };
      }
    }

    const { added, requested } = this.inventory.addByDefinition(
      recipe.result.itemId,
      recipe.result.count
    );

    if (added === 0) {
      return {
        ok: false,
        message: "Крафт виконано, але в інвентарі немає місця для результату",
      };
    }

    if (added < requested) {
      return {
        ok: true,
        message: `Створено ${added} з ${requested} (обмеження місця)`,
      };
    }

    return { ok: true, message: `Успішно: ${recipe.name}` };
  }
}
