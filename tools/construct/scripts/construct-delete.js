import {
  state,
  removeConnection,
  deleteSelectedTextLabels,
  deleteSelectedZone,
  getSelectedNodeElements,
  getNodeDataFromElement,
  handleNodeMenuAction,
  createNode
} from "../hub.js";

export function deleteSelection() {

  deleteSelectedTextLabels();

  deleteSelectedZone();

  const selectedNodes =
    getSelectedNodeElements(state);

  selectedNodes.forEach((nodeEl) => {
    handleNodeMenuAction(
      "Delete",
      nodeEl,
      state,
      getNodeDataFromElement,
      removeConnection,
      {
        createNode,
        getSelectedNodeElements
      }
    );
  });

}

export function initDeleteController() {
  window.addEventListener(
    "construct:delete-selected",
    () => {
      deleteSelection();
    }
  );
}
