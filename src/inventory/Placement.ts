import type { SlotSize } from "../domain/types";
import { GRID_COLS, GRID_ROWS } from "../domain/types";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function canPlace(
  occupied: Rect[],
  size: SlotSize,
  x: number,
  y: number
): boolean {
  if (x + size.width > GRID_COLS || y + size.height > GRID_ROWS) {
    return false;
  }
  const candidate: Rect = { x, y, width: size.width, height: size.height };
  return !occupied.some((r) => rectsOverlap(candidate, r));
}

export function findFirstFit(
  occupied: Rect[],
  size: SlotSize
): { x: number; y: number } | null {
  for (let y = 0; y <= GRID_ROWS - size.height; y++) {
    for (let x = 0; x <= GRID_COLS - size.width; x++) {
      if (canPlace(occupied, size, x, y)) {
        return { x, y };
      }
    }
  }
  return null;
}
