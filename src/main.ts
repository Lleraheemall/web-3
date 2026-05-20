import { appState } from "./app/state";
import { renderCatalog } from "./ui/catalog";
import { renderInventory } from "./ui/grid";

const catalogPanel = document.getElementById("catalog-panel")!;
const inventoryPanel = document.getElementById("inventory-panel")!;

function render(): void {
  renderCatalog(catalogPanel, appState);
  renderInventory(inventoryPanel, appState);
}

appState.subscribe(render);
render();
