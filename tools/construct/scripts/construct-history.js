// import {

// } from "../hub.js";

const MAX_HISTORY = 50;
const HISTORY_STORAGE_KEY =
  "construct-history";

const historyState = {
  undoStack: [],
  redoStack: [],
  isRestoring: false,
  topSnapshot: null,
  transactionDepth: 0
};

export function cloneSnapshot(snapshot) {
  return JSON.parse(
    JSON.stringify(snapshot)
  );
}

export function stripImagesFromSnapshot(snapshot) {
  const cloned =
    cloneSnapshot(snapshot);

  if (!Array.isArray(cloned.nodes)) {
    return cloned;
  }

  cloned.nodes.forEach((node) => {
    if (!node.sides) {
      return;
    }

    ["A", "B"].forEach((sideKey) => {
      if (
        node.sides[sideKey] &&
        "image" in node.sides[sideKey]
      ) {
        node.sides[sideKey].image = "";
      }
    });
  });

  return cloned;
}

export function stripImagesFromStack(stack) {
  return stack.map(
    stripImagesFromSnapshot
  );
}

export function saveHistoryToStorage() {
  try {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify({
        undoStack:
          stripImagesFromStack(
            historyState.undoStack
          ),

        redoStack:
          stripImagesFromStack(
            historyState.redoStack
          )
      })
    );
  } catch (error) {
    console.warn(
      "Failed to save construct history.",
      error
    );
  }
}

export function loadHistoryFromStorage() {
  const raw =
    localStorage.getItem(
      HISTORY_STORAGE_KEY
    );

  if (!raw) {
    return;
  }

  try {
    const data =
      JSON.parse(raw);

    historyState.undoStack =
      Array.isArray(data.undoStack)
        ? data.undoStack
        : [];

    historyState.redoStack =
      Array.isArray(data.redoStack)
        ? data.redoStack
        : [];
  } catch {
    historyState.undoStack = [];
    historyState.redoStack = [];
  }
}

export function pushHistoryState(snapshot) {
  if (historyState.isRestoring) {
    return;
  }

  const serialized =
    JSON.stringify(snapshot);

  const lastSnapshot =
    historyState.undoStack[
      historyState.undoStack.length - 1
    ];

  if (
    lastSnapshot &&
    JSON.stringify(lastSnapshot) ===
      serialized
  ) {
    return;
  }

  historyState.undoStack.push(
    cloneSnapshot(snapshot)
  );

  if (
    historyState.undoStack.length >
    MAX_HISTORY
  ) {
    historyState.undoStack.shift();
  }

  historyState.redoStack = [];

  historyState.topSnapshot =
    cloneSnapshot(snapshot);

  saveHistoryToStorage();
}

export function undoHistoryState(
  getCurrentSnapshot,
  restoreSnapshot
) {
  if (
    historyState.undoStack.length <= 1
  ) {
    return;
  }

  historyState.isRestoring = true;

  const current =
    historyState.undoStack.pop();

  historyState.redoStack.push(
    cloneSnapshot(current)
  );

  const previous =
    historyState.undoStack[
      historyState.undoStack.length - 1
    ];

  restoreSnapshot(
    cloneSnapshot(previous)
  );

  saveHistoryToStorage();

  requestAnimationFrame(() => {
    historyState.isRestoring = false;
  });
}

export function redoHistoryState(
  getCurrentSnapshot,
  restoreSnapshot
) {
  if (
    historyState.redoStack.length === 0
  ) {
    return;
  }

  historyState.isRestoring = true;

  const snapshot =
    historyState.redoStack.pop();

  historyState.undoStack.push(
    cloneSnapshot(snapshot)
  );

  restoreSnapshot(
    cloneSnapshot(snapshot)
  );

  saveHistoryToStorage();

  requestAnimationFrame(() => {
    historyState.isRestoring = false;
  });
}

export function clearHistoryState() {
  historyState.undoStack = [];
  historyState.redoStack = [];

  localStorage.removeItem(
    HISTORY_STORAGE_KEY
  );
}

export function hasStoredHistory() {
  return (
    historyState.undoStack.length > 0
  );
}

export function getHistoryTopSnapshot() {
  return (
    historyState.undoStack[
      historyState.undoStack.length - 1
    ] || null
  );
}

export function hydrateHistoryImages(currentSnapshot) {
  if (
    !currentSnapshot ||
    !Array.isArray(currentSnapshot.nodes)
  ) {
    return;
  }

  const imageMap =
    new Map();

  currentSnapshot.nodes.forEach((node) => {
    if (!node.sides) {
      return;
    }

    imageMap.set(node.id, {
      A:
        node.sides.A?.image || "",

      B:
        node.sides.B?.image || ""
    });
  });

  [
    historyState.undoStack,
    historyState.redoStack
  ].forEach((stack) => {
    stack.forEach((snapshot) => {
      if (!Array.isArray(snapshot.nodes)) {
        return;
      }

      snapshot.nodes.forEach((node) => {
        if (
          !node.sides ||
          !imageMap.has(node.id)
        ) {
          return;
        }

        const images =
          imageMap.get(node.id);

        ["A", "B"].forEach((sideKey) => {
          if (!node.sides[sideKey]) {
            return;
          }

          if (
            !node.sides[sideKey].image
          ) {
            node.sides[sideKey].image =
              images[sideKey] || "";
          }
        });
      });
    });
  });
}

export function canUndoHistory() {
  return (
    historyState.undoStack.length > 1
  );
}

export function canRedoHistory() {
  return (
    historyState.redoStack.length > 0
  );
}

export function beginHistoryTransaction() {
  historyState.transactionDepth++;
}

export function endHistoryTransaction(
  snapshot
) {
  if (historyState.transactionDepth === 0) {
    return;
  }

  historyState.transactionDepth--;

  if (
    historyState.transactionDepth !== 0
  ) {
    return;
  }

  pushHistoryState(snapshot);
}

export function isHistoryTransactionActive() {
  return (
    historyState.transactionDepth > 0
  );
}

loadHistoryFromStorage();