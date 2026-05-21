import { GRID_COLS, GRID_ROWS } from "../domain/types";
import type { SlotSize } from "../domain/types";
import type { AppState } from "../app/state";
import type { InventoryStack } from "../inventory/GridInventory";
import { showToast } from "./toast";

const DRAG_THRESHOLD_PX = 4;

interface DragSession {
  stackId: string;
  pointerId: number;
  originX: number;
  originY: number;
  grabOffsetX: number;
  grabOffsetY: number;
  moved: boolean;
  ghost: HTMLElement;
}

function clampPlacement(x: number, y: number, size: SlotSize): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, GRID_COLS - size.width)),
    y: Math.max(0, Math.min(y, GRID_ROWS - size.height)),
  };
}

function placementFromPointer(
  gridEl: HTMLElement,
  stack: InventoryStack,
  clientX: number,
  clientY: number,
  grabOffsetX: number,
  grabOffsetY: number
): { x: number; y: number } {
  const rect = gridEl.getBoundingClientRect();
  const cellW = rect.width / GRID_COLS;
  const cellH = rect.height / GRID_ROWS;
  const anchorX = clientX - grabOffsetX - rect.left;
  const anchorY = clientY - grabOffsetY - rect.top;
  const rawX = Math.floor(anchorX / cellW);
  const rawY = Math.floor(anchorY / cellH);
  return clampPlacement(rawX, rawY, stack.item.slotSize);
}

function createGhost(source: HTMLElement): HTMLElement {
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.classList.add("stack-ghost");
  ghost.classList.remove("selected");
  const rect = source.getBoundingClientRect();
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function moveGhost(ghost: HTMLElement, clientX: number, clientY: number): void {
  const rect = ghost.getBoundingClientRect();
  ghost.style.left = `${clientX - rect.width / 2}px`;
  ghost.style.top = `${clientY - rect.height / 2}px`;
}

function endDrag(session: DragSession, stackEls: Map<string, HTMLElement>): void {
  session.ghost.remove();
  stackEls.get(session.stackId)?.classList.remove("dragging");
}

export function attachGridDragDrop(
  gridEl: HTMLElement,
  state: AppState,
  stacks: readonly InventoryStack[]
): void {
  const stackById = new Map(stacks.map((s) => [s.stackId, s]));
  const stackEls = new Map<string, HTMLElement>();
  let session: DragSession | null = null;
  let suppressClick = false;

  for (const el of gridEl.querySelectorAll<HTMLElement>(".stack-item")) {
    const stackId = el.dataset.stackId;
    if (!stackId) continue;
    stackEls.set(stackId, el);

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const stack = stackById.get(stackId);
      if (!stack) return;

      const rect = el.getBoundingClientRect();
      session = {
        stackId,
        pointerId: e.pointerId,
        originX: e.clientX,
        originY: e.clientY,
        grabOffsetX: e.clientX - rect.left,
        grabOffsetY: e.clientY - rect.top,
        moved: false,
        ghost: createGhost(el),
      };
      moveGhost(session.ghost, e.clientX, e.clientY);
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    el.addEventListener("pointermove", (e) => {
      if (!session || session.stackId !== stackId || e.pointerId !== session.pointerId) {
        return;
      }

      const dx = e.clientX - session.originX;
      const dy = e.clientY - session.originY;
      if (!session.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

      if (!session.moved) {
        session.moved = true;
        el.classList.add("dragging");
      }

      moveGhost(session.ghost, e.clientX, e.clientY);
    });

    const finishPointer = (e: PointerEvent) => {
      if (!session || session.stackId !== stackId || e.pointerId !== session.pointerId) {
        return;
      }

      const active = session;
      session = null;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      if (active.moved) {
        suppressClick = true;
        const stack = stackById.get(stackId);
        if (stack) {
          const pos = placementFromPointer(
            gridEl,
            stack,
            e.clientX,
            e.clientY,
            active.grabOffsetX,
            active.grabOffsetY
          );
          const result = state.inventory.moveStack(stackId, pos.x, pos.y);
          state.selectedStackId = stackId;
          if (result.message) {
            showToast(result.message, result.ok ? "success" : "error");
          }
        }
        endDrag(active, stackEls);
        state.notify();
      } else {
        endDrag(active, stackEls);
      }
    };

    el.addEventListener("pointerup", finishPointer);
    el.addEventListener("pointercancel", finishPointer);

    el.addEventListener("click", (e) => {
      if (suppressClick) {
        suppressClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      state.selectedStackId = stackId;
      state.notify();
    });
  }
}
