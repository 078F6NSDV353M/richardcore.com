import {
  state,
  BASE_GRID_SIZE,
  getGrid,
  getWorld,
  getStage,
  updateGrid,
  updateAllConnections,
  closeAllContextMenus,
  restoreSelectedConnectionClasses
} from "../hub.js";


export function clampZoom(value) {
  return Math.min(Math.max(value, 0.05), 5);
}

export function applyTransform() {
  const grid = getGrid();
  const world = getWorld();

  if (!grid || !world) return;

  updateGrid();

  world.style.transform =
    `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;

  world.style.transformOrigin = "0 0";
}

export function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - state.panX) / state.zoom,
    y: (screenY - state.panY) / state.zoom,
  };
}

export function handleWheel(event) {
  closeAllContextMenus();

  const editableScrollArea =
    event.target.closest(
      ".construct-node.is-editing .construct-node-content"
    );

  if (editableScrollArea) {
    return;
  }

  event.preventDefault();

  const stage = getStage();
  if (!stage) return;

  const rect = stage.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const delta = -Math.sign(event.deltaY);
  const oldZoom = state.zoom;
  const nextZoom = clampZoom(state.zoom + delta * 0.1 * state.zoom);

  if (nextZoom === oldZoom) return;

  state.zoom = nextZoom;

  const ratio = state.zoom / oldZoom;
  state.panX = mouseX - (mouseX - state.panX) * ratio;
  state.panY = mouseY - (mouseY - state.panY) * ratio;

  applyTransform();
  updateAllConnections();
  restoreSelectedConnectionClasses();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function fitWorkspaceToContent() {
  const stage =
    getStage();

  if (!stage) {
    return;
  }

  const zones =
    document.querySelectorAll(
      ".construct-zone"
    );

  if (
    (!Array.isArray(state.nodes) ||
      state.nodes.length === 0) &&
    zones.length === 0
  ) {
    return;
  }

  const PADDING = 200;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  state.nodes.forEach((nodeData) => {
    const element =
      nodeData.element;

    if (!element ||
        element.style.display === "none") {
      return;
    }

    const left =
      parseFloat(element.style.left) || 0;

    const top =
      parseFloat(element.style.top) || 0;

    const width =
      element.offsetWidth;

    const height =
      element.offsetHeight;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);

    maxX = Math.max(
      maxX,
      left + width
    );

    maxY = Math.max(
      maxY,
      top + height
    );
  });

  document
    .querySelectorAll(
      ".construct-zone"
    )
    .forEach((zone) => {

      if (
        zone.style.display === "none"
      ) {
        return;
      }

      const left =
        parseFloat(
          zone.style.left
        ) || 0;

      const top =
        parseFloat(
          zone.style.top
        ) || 0;

      const width =
        zone.offsetWidth;

      const height =
        zone.offsetHeight;

      minX =
        Math.min(
          minX,
          left
        );

      minY =
        Math.min(
          minY,
          top
        );

      maxX =
        Math.max(
          maxX,
          left + width
        );

      maxY =
        Math.max(
          maxY,
          top + height
        );
    });

  document
    .querySelectorAll(
      ".construct-text-label"
    )
    .forEach((label) => {
      if (
        label.style.display === "none"
      ) {
        return;
      }

      const left =
        parseFloat(label.style.left) || 0;

      const top =
        parseFloat(label.style.top) || 0;

      const width =
        label.offsetWidth;

      const height =
        label.offsetHeight;

      minX =
        Math.min(
          minX,
          left
        );

      minY =
        Math.min(
          minY,
          top
        );

      maxX =
        Math.max(
          maxX,
          left + width
        );

      maxY =
        Math.max(
          maxY,
          top + height
        );
    });  

  const boundsWidth =
    (maxX - minX) + PADDING * 2;

  const boundsHeight =
    (maxY - minY) + PADDING * 2;

  const stageRect =
    stage.getBoundingClientRect();

  const zoomX =
    stageRect.width / boundsWidth;

  const zoomY =
    stageRect.height / boundsHeight;

  state.zoom =
    clampZoom(
      Math.min(zoomX, zoomY)
    );

  const contentCenterX =
    (minX + maxX) / 2;

  const contentCenterY =
    (minY + maxY) / 2;

  state.panX =
    (stageRect.width / 2) -
    (contentCenterX * state.zoom);

  state.panY =
    (stageRect.height / 2) -
    (contentCenterY * state.zoom);

  applyTransform();
  updateAllConnections();
  restoreSelectedConnectionClasses();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}