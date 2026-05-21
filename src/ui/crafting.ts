import type { AppState } from "../app/state";
import { showToast } from "./toast";

export function renderCrafting(panel: HTMLElement, state: AppState): void {
  const recipes = state.crafting.getRecipes();
  const selectedId = state.selectedRecipeId ?? recipes[0]?.id ?? null;

  panel.innerHTML = `
    <h3>Крафт</h3>
    <ul class="recipe-list" id="recipe-list">
      ${recipes
        .map(
          (r) => `
        <li data-recipe="${r.id}" class="${r.id === selectedId ? "active" : ""}">
          ${r.name}
        </li>`
        )
        .join("")}
    </ul>
    <button class="btn btn-add" id="btn-craft" style="width:100%">Створити</button>
  `;

  panel.querySelectorAll("[data-recipe]").forEach((li) => {
    li.addEventListener("click", () => {
      state.selectedRecipeId = (li as HTMLElement).dataset.recipe ?? null;
      state.notify();
    });
  });

  panel.querySelector("#btn-craft")?.addEventListener("click", async () => {
    if (!selectedId) {
      showToast("Оберіть рецепт", "error");
      return;
    }
    const btn = panel.querySelector("#btn-craft") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Крафт…";
    const result = await state.crafting.craft(selectedId);
    btn.disabled = false;
    btn.textContent = "Створити";
    showToast(result.message, result.ok ? "success" : "error");
    state.notify();
  });
}
