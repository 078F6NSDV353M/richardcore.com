import {
  deleteSelectedTextLabels,
  deleteSelectedZone
} from "../hub.js";

export function deleteSelection() {
  deleteSelectedTextLabels();
  deleteSelectedZone();
}

export function initDeleteController() {
  window.addEventListener(
    "construct:delete-selected",
    () => {
      deleteSelection();
    }
  );
}
