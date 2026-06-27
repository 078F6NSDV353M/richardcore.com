import {
  selectObject,
  clearObjectSelection
} from "../hub.js";

export function clearNodeSelection(state) {
  if (!Array.isArray(state.nodes)) return;

  state.nodes.forEach((nodeData) => {
    if (!nodeData.element) return;
    nodeData.element.classList.remove("is-selected");
  });
}

export function getSelectedNodeElements(state) {
  if (!Array.isArray(state.nodes)) return [];

  return state.nodes
    .map((nodeData) => nodeData.element)
    .filter((element) => element?.classList.contains("is-selected"));
}

export function setupNodeSelection({
  node,
  state,
  closeNodeContextMenu
}) {
  node.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    closeNodeContextMenu();

    selectObject(
      node,
      event
    );
  });

  document.addEventListener("mousedown", (event) => {
    if (event.button === 2) {
      return;
    }

    if (event.target.closest(".construct-node-context-menu")) {
      return;
    }

    closeNodeContextMenu();

    if (
      event.target.closest(
        ".construct-node, " +
        ".construct-zone, " +
        ".construct-text-label"
      )
    ) {
      return;
    }

    clearObjectSelection();
  });
}

export function hasSelectedNodes(state) {
  return getSelectedNodeElements(state)
    .length > 0;
}