import { getAllDefinitions } from "../domain/factories";
import type { ItemDefinition, ItemType } from "../domain/types";
import { CATEGORY_LABELS } from "../domain/types";
import type { AppState } from "../app/state";
import { showToast } from "./toast";

const TYPE_ORDER: ItemType[] = [
  "weapon",
  "consumable",
  "ammo",
  "craft",
  "key",
  "upgrade",
];

function groupByCategory(items: ItemDefinition[]): Map<string, ItemDefinition[]> {
  const map = new Map<string, ItemDefinition[]>();
  for (const item of items) {
    const list = map.get(item.categoryLabel) ?? [];
    list.push(item);
    map.set(item.categoryLabel, list);
  }
  return map;
}

export function renderCatalog(panel: HTMLElement, state: AppState): void {
  const search = state.catalogSearch.toLowerCase().trim();
  const filter = state.catalogFilter;

  let items = getAllDefinitions().filter((d) => {
    if (filter !== "all" && d.type !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search)) return false;
    return true;
  });

  items = [...items].sort((a, b) => a.name.localeCompare(b.name, "uk"));

  const filterOptions = [
    { value: "all", label: "Усі категорії" },
    ...TYPE_ORDER.map((t) => ({ value: t, label: CATEGORY_LABELS[t] })),
  ];

  panel.innerHTML = `
    <h2 class="panel-title">Каталог предметів</h2>
    <p class="panel-desc">Зліва — каталог RE Requiem. Справа — інвентар 8×10. Кількість задається на картці.</p>
    <div class="toolbar">
      <input type="search" id="catalog-search" placeholder="Пошук предмета..." value="${escapeAttr(state.catalogSearch)}" />
      <select id="catalog-filter">
        ${filterOptions
          .map(
            (o) =>
              `<option value="${o.value}" ${o.value === filter ? "selected" : ""}>${o.label}</option>`
          )
          .join("")}
      </select>
    </div>
    <div id="catalog-list"></div>
  `;

  const listEl = panel.querySelector("#catalog-list")!;
  const grouped = groupByCategory(items);

  for (const type of TYPE_ORDER) {
    const label = CATEGORY_LABELS[type];
    const groupItems = grouped.get(label);
    if (!groupItems?.length) continue;

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `<span>${label}</span><span class="badge">${groupItems.length}</span>`;
    listEl.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "catalog-grid";

    for (const def of groupItems) {
      const inInv = state.inventory.getTotalCount(def.id);
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-name">${escapeHtml(def.name)}</span>
          <span class="badge">${escapeHtml(def.categoryLabel)}</span>
        </div>
        <div class="item-card-meta">${def.slotSize.width}×${def.slotSize.height} · окремі слоти · в інвентарі: ${inInv}</div>
        <div class="item-card-actions">
          <label>К-сть <input type="number" min="1" max="99" value="1" data-qty-for="${def.id}" /></label>
          <button class="btn btn-add" data-add="${def.id}">Додати</button>
        </div>
      `;
      grid.appendChild(card);
    }
    listEl.appendChild(grid);
  }

  panel.querySelector("#catalog-search")?.addEventListener("input", (e) => {
    state.catalogSearch = (e.target as HTMLInputElement).value;
    state.notify();
  });

  panel.querySelector("#catalog-filter")?.addEventListener("change", (e) => {
    state.catalogFilter = (e.target as HTMLSelectElement).value as ItemType | "all";
    state.notify();
  });

  panel.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.add!;
      const input = panel.querySelector(`[data-qty-for="${id}"]`) as HTMLInputElement;
      const qty = Math.max(1, parseInt(input?.value ?? "1", 10) || 1);
      const result = state.inventory.addItem(id, qty);
      showToast(result.message, result.added > 0 ? "success" : "error");
      state.notify();
    });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
