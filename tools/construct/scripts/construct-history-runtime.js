import {
  pushHistoryState,
  undoHistoryState,
  redoHistoryState,
  hasStoredHistory,
  hydrateHistoryImages,
  state,
  BASE_GRID_SIZE,
  getGrid,
  createHistorySnapshot
} from "../hub.js";

export function initHistoryRuntime({
  restoreWorkspaceSnapshot
}) {

  let isRestoringHistory =
    false;

  function undo() {
    isRestoringHistory = true;

    undoHistoryState(
      createHistorySnapshot,
      restoreWorkspaceSnapshot
    );

    requestAnimationFrame(() => {
      isRestoringHistory = false;
    });
  }

  function redo() {
    isRestoringHistory = true;

    redoHistoryState(
      createHistorySnapshot,
      restoreWorkspaceSnapshot
    );

    requestAnimationFrame(() => {
      isRestoringHistory = false;
    });
  }

  window.addEventListener(
    "construct:workspace-changed",
    () => {

      if (isRestoringHistory) {
        return;
      }

      pushHistoryState(
        createHistorySnapshot()
      );
    }
  );

  const currentSnapshot =
    createHistorySnapshot();

  if (hasStoredHistory()) {
    hydrateHistoryImages(
      currentSnapshot
    );
  } else {
    pushHistoryState(
      currentSnapshot
    );
  }

  return {
    undo,
    redo
  };
}