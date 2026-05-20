import { Weapon } from "../domain/Weapon";
import { GRID_COLS, GRID_ROWS } from "../domain/types";
import type { AppState } from "../app/state";
import type { InventoryStack } from "../inventory/GridInventory";
import { showToast } from "./toast";
import { renderCrafting } from "./crafting";
import { renderUpgrades } from "./upgrades";

export function renderInventory(panel: HTMLElement, state: AppState): void {
  const grid = state.inventory.getGrid();
  const stats = grid.getStats();
  const stacks = grid.getStacks();
  const selected = state.selectedStackId;

  panel.innerHTML = `
    <h2 class="panel-title">Поточний стан інвентаря</h2>
    <p class="panel-desc">Сітка 10×8. Кожен предмет займає окреме місце — без стекування в комірках.</p>
    <div class="stats-row">
      <div class="stat-box"><div class="stat-label">Слоти</div><div class="stat-value">${stats.cols} × ${stats.rows}</div></div>
      <div class="stat-box"><div class="stat-label">Зайнято</div><div class="stat-value">${stats.occupiedCells} / ${stats.totalCells}</div></div>
      <div class="stat-box"><div class="stat-label">Предметів</div><div class="stat-value">${stats.stackCount}</div></div>
      <div class="stat-box"><div class="stat-label">Апгрейди</div><div class="stat-value">${stats.upgradeCount}</div></div>
    </div>
    <div class="inventory-actions">
      <button class="btn btn-secondary" id="btn-sort">Сортувати</button>
      <button class="btn btn-warn" id="btn-clear">Очистити</button>
    </div>
    <div class="grid-wrap">
      <div class="inventory-grid" id="inv-grid"></div>
    </div>
    <div class="selection-panel" id="selection-panel"></div>
    <div class="sub-panels" id="sub-panels"></div>
  `;

  const gridEl = panel.querySelector("#inv-grid") as HTMLElement;
  gridEl.style.setProperty("--grid-cols", String(GRID_COLS));
  gridEl.style.setProperty("--grid-rows", String(GRID_ROWS));

  for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    gridEl.appendChild(cell);
  }

  for (const stack of stacks) {
    const el = document.createElement("div");
    el.className = "stack-item" + (stack.stackId === selected ? " selected" : "");
    el.style.gridColumn = `${stack.x + 1} / span ${stack.item.slotSize.width}`;
    el.style.gridRow = `${stack.y + 1} / span ${stack.item.slotSize.height}`;
    el.dataset.stackId = stack.stackId;

    const shortName = stack.item.name.slice(0, 10);
    el.innerHTML = `
      <span class="stack-icon">${stack.item.icon}</span>
      <span class="stack-label">${shortName}</span>
    `;

    el.addEventListener("click", () => {
      state.selectedStackId = stack.stackId;
      state.notify();
    });
    gridEl.appendChild(el);
  }

  renderSelection(panel.querySelector("#selection-panel")!, state, stacks, selected);
  renderSubPanels(panel.querySelector("#sub-panels")!, state);

  panel.querySelector("#btn-sort")?.addEventListener("click", () => {
    const { packed, dropped } = state.inventory.sort();
    showToast(
      dropped > 0
        ? `Відсортовано. ${dropped} предмет(ів) не помістились`
        : `Відсортовано ${packed} предметів`,
      dropped > 0 ? "error" : "success"
    );
    state.notify();
  });

  panel.querySelector("#btn-clear")?.addEventListener("click", () => {
    state.inventory.clear();
    state.selectedStackId = null;
    showToast("Інвентар очищено", "info");
    state.notify();
  });
}

function renderSelection(
  el: HTMLElement,
  state: AppState,
  stacks: readonly InventoryStack[],
  selectedId: string | null
): void {
  const stack = stacks.find((s) => s.stackId === selectedId);
  if (!stack) {
    el.innerHTML = `
      <div class="selection-title">Нічого не вибрано</div>
      <div class="selection-desc">Клікніть предмет у сітці, щоб побачити деталі або видалити.</div>
      <div class="selection-actions">
        <button class="btn btn-secondary" disabled>Видалити</button>
        <button class="btn btn-warn" disabled>Видалити з інвентаря</button>
      </div>
    `;
    return;
  }

  const item = stack.item;
  let extra = "";
  if (item instanceof Weapon) {
    extra = ` · шкода ${item.damage} · міцність ${item.durability} · апгрейд ${item.upgradeLevel}/${item.maxUpgradeSlots}`;
  }
  const isKey = item.type === "key";

  el.innerHTML = `
    <div class="selection-title">${item.icon} ${item.name}</div>
    <div class="selection-desc">${item.inspect()}${extra}</div>
    <div class="selection-actions">
      <button class="btn btn-secondary" id="btn-minus-one" ${isKey ? "disabled" : ""}>Видалити</button>
      <button class="btn btn-warn" id="btn-remove-stack" ${isKey ? "disabled" : ""}>Видалити з інвентаря</button>
    </div>
  `;

  el.querySelector("#btn-minus-one")?.addEventListener("click", () => {
    const r = state.inventory.removeOne(stack.stackId);
    showToast(r.message, r.ok ? "success" : "error");
    if (!state.inventory.getGrid().getStackById(stack.stackId)) {
      state.selectedStackId = null;
    }
    state.notify();
  });

  el.querySelector("#btn-remove-stack")?.addEventListener("click", () => {
    const r = state.inventory.removeStack(stack.stackId);
    showToast(r.message, r.ok ? "success" : "error");
    state.selectedStackId = null;
    state.notify();
  });
}

function renderSubPanels(el: HTMLElement, state: AppState): void {
  el.innerHTML = `<div id="craft-slot"></div><div id="upgrade-slot"></div>`;
  const craftSlot = el.querySelector("#craft-slot") as HTMLElement;
  const upgradeSlot = el.querySelector("#upgrade-slot") as HTMLElement;
  craftSlot.className = "sub-panel";
  upgradeSlot.className = "sub-panel";
  renderCrafting(craftSlot, state);
  renderUpgrades(upgradeSlot, state);
}
