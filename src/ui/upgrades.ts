import type { AppState } from "../app/state";
import { Weapon } from "../domain/Weapon";
import { showToast } from "./toast";

export function renderUpgrades(panel: HTMLElement, state: AppState): void {
  const grid = state.inventory.getGrid();
  const weapons = grid.getWeaponStacks();
  const parts = grid.getUpgradePartStacks();

  panel.innerHTML = `
    <h3>Апгрейди</h3>
    <label>Зброя</label>
    <select id="upgrade-weapon">
      <option value="">— оберіть —</option>
      ${weapons
        .map((w) => {
          const weapon = w.item as Weapon;
          return `<option value="${w.stackId}">${weapon.icon} ${weapon.name} (${weapon.upgradeLevel}/${weapon.maxUpgradeSlots})</option>`;
        })
        .join("")}
    </select>
    <label>Частина</label>
    <select id="upgrade-part">
      <option value="">— оберіть —</option>
      ${parts
        .map((p) => `<option value="${p.stackId}">${p.item.icon} ${p.item.name}</option>`)
        .join("")}
    </select>
    <button class="btn btn-secondary" id="btn-apply-upgrade" style="width:100%;margin-top:0.4rem">Застосувати</button>
  `;

  panel.querySelector("#btn-apply-upgrade")?.addEventListener("click", () => {
    const weaponId = (panel.querySelector("#upgrade-weapon") as HTMLSelectElement).value;
    const partId = (panel.querySelector("#upgrade-part") as HTMLSelectElement).value;
    if (!weaponId || !partId) {
      showToast("Оберіть зброю та частину апгрейду", "error");
      return;
    }
    const result = state.upgrades.apply(weaponId, partId);
    showToast(result.message, result.ok ? "success" : "error");
    state.notify();
  });
}
