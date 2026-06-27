import {
  state,
  BASE_GRID_SIZE,
  getGrid
} from "../hub.js";

export function getThemeValue(name, fallback) {
  const value =
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

  return value || fallback;
}

export function clearGridStyles(grid) {
  grid.style.display = "";
  grid.style.background = "none";
  grid.style.backgroundImage = "none";
  grid.style.backgroundSize = "";
  grid.style.backgroundPosition = "";
  grid.style.backgroundRepeat = "";
}

export function updateGrid() {
  const grid = getGrid();

  if (!grid) {
    return;
  }

  clearGridStyles(grid);

  const isGridVisible =
    state.zoom >= 0.05 &&
    state.gridMode !== "none";

  if (!isGridVisible) {
    grid.style.display = "none";
    return;
  }

  const currentSize =
    BASE_GRID_SIZE * state.zoom;

  const dotSize =
    Math.max(1, state.zoom * 1);

  const dotColor =
    getThemeValue(
      "--construct-grid-dot",
      "rgba(255, 255, 255, 0.1)"
    );

  const lineColor =
    getThemeValue(
      "--construct-grid-line",
      "rgba(255, 255, 255, 0.1)"
    );

  grid.style.backgroundSize =
    `${currentSize}px ${currentSize}px`;

  grid.style.backgroundRepeat =
    "repeat";

  if (state.gridMode === "lines") {
    grid.style.backgroundPosition =
      `${state.panX}px ${state.panY}px`;

    grid.style.backgroundImage =
      `linear-gradient(
        to right,
        ${lineColor} 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        ${lineColor} 1px,
        transparent 1px
      )`;

    return;
  }

  const dotPosition =
    dotSize;

  grid.style.backgroundPosition =
    `${state.panX - dotPosition}px ${state.panY - dotPosition}px`;

  grid.style.backgroundImage =
    `radial-gradient(
      circle at ${dotPosition}px ${dotPosition}px,
      ${dotColor} ${dotSize}px,
      transparent ${dotSize}px
    )`;
}