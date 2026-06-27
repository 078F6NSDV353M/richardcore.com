import {
  state,
  getStage,
  getAddNodeButton,
  getConnectionsLayer,
  getNodesLayer,
  applyTransform,
  screenToWorld,
  handleWheel,
  createNode,
  handleStageDoubleClick,
  handleAddNodeClick,
  startConnection,
  updateConnectionPreview,
  updateAllConnections,
  updateNodeConnections,
  createConnectionFromPorts,
  finishConnection,
  removeConnection,
  initPresentationMode,
  initConnectionMenu,
  loadWorkspaceState,
  restoreWorkspaceState,
  setupWorkspaceAutoSave,
  createWorkspaceSnapshot,
  createHistorySnapshot,
  pushHistoryState,
  undoHistoryState,
  redoHistoryState,
  hasStoredHistory,
  getHistoryTopSnapshot,
  hydrateHistoryImages,
  initFloatingPanel,
  copySelectedNodes,
  pasteClipboard,
  initWorkspaceContextMenu,
  clearNodeSelection,
  getSelectedNodeElements,
  closeAllContextMenus,
  handleNodeMenuAction,
  handleWorkspaceHotkeys,
  handleHistoryHotkeys,
  handleClipboardHotkeys,
  focusSearchInput,
  triggerOpenProject,
  triggerSaveProject,
  triggerSaveAsProject,
  triggerExportWorkspacePng,
  triggerFitWorkspace,
  isTextEditingActive,
  isWhiteboardOverlayOpen,
  blockBrowserWorkspaceDefaults,
  setWorkspacePointerState,
  startSelectionBox,
  updateSelectionBox,
  finishSelectionBox,
  initPointerControls,
  createWorkspaceRestore,
  initHistoryRuntime,
  showProjectStartModal,
  initProjectAutosave,
  createZone,
  // initZoneHotkeys,
  initZoneSelection,
  initZoneMenu,
  initTextLabels,
  initDeleteController
} from "./hub.js";


export function selectAllWorkspaceNodes() {
  const nodesLayer = getNodesLayer();

  if (!nodesLayer) return;

  [
    ...nodesLayer.querySelectorAll(".construct-node")
  ].forEach((node) => {
    node.classList.add("is-selected");
  });

  document
    .querySelectorAll(
      ".construct-zone"
    )
    .forEach((zone) => {
      zone.classList.add(
        "is-selected"
      );
    });
}

export function handleWorkspaceHotkeysFromTool(event) {
  handleWorkspaceHotkeys(
    event,
    {
      isTextEditingActive,
      focusSearch: focusSearchInput,
      openProject: triggerOpenProject,
      saveProject: triggerSaveProject,
      saveAsProject: triggerSaveAsProject,
      exportPng: triggerExportWorkspacePng,
      fitWorkspace: triggerFitWorkspace,

      flipSelectedNodes: () => {
        const selectedNodes =
          getSelectedNodeElements(state);

        if (selectedNodes.length === 0) {
          return;
        }

        handleNodeMenuAction(
          "Flip",
          selectedNodes[0],
          state,
          (node) =>
            state.nodes.find(
              (item) => item.element === node
            ),
          removeConnection,
          {
            getSelectedNodeElements
          }
        );
      }
    }
  );
}

let restoreWorkspaceSnapshot = null;

export function lockConstructScrollPosition() {
  const scrollTargets = [
    window,
    document.documentElement,
    document.body,
    document.querySelector("main"),
    document.querySelector(".app-container"),
    document.querySelector(".construct-page-shell"),
    document.querySelector(".construct-stage")
  ];

  scrollTargets.forEach((target) => {
    if (!target) return;

    if (target === window) {
      window.scrollTo(0, 0);
      return;
    }

    target.scrollLeft = 0;
    target.scrollTop = 0;
  });

  updateAllConnections();
}

export function handleClipboardHotkeysFromTool(event) {
  handleClipboardHotkeys(
    event,
    {
      isTextEditingActive,

      copy: () => {
        copySelectedNodes({
          withConnections: false
        });
      },

      copyWithConnections: () => {
        copySelectedNodes({
          withConnections: true
        });
      },

      paste: () => {
        pasteClipboard({
          createNode,
          createConnectionFromPorts
        });
      }
    }
  );
}

export async function init() {
  const stage = getStage();
  const addNodeButton = getAddNodeButton();

  if (!stage) return;

  window.addEventListener(
    "scroll",
    lockConstructScrollPosition,
    {
      capture: true,
      passive: false
    }
  );

  document.addEventListener(
    "scroll",
    lockConstructScrollPosition,
    {
      capture: true,
      passive: false
    }
  );

  stage.addEventListener(
    "input",
    () => {
      requestAnimationFrame(lockConstructScrollPosition);
    },
    {
      capture: true
    }
  );

  stage.addEventListener(
    "keydown",
    () => {
      requestAnimationFrame(lockConstructScrollPosition);
    },
    {
      capture: true
    }
  );

  stage.addEventListener(
    "wheel",
    (event) => {
      if (isWhiteboardOverlayOpen()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      handleWheel(event);
    },
    {
      passive: false,
      capture: true
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      blockBrowserWorkspaceDefaults({
        event,
        handleWorkspaceHotkeys: handleWorkspaceHotkeysFromTool,

        handleHistoryHotkeys: (
          keyboardEvent
        ) => {
          handleHistoryHotkeys(
            keyboardEvent,
            {
              isTextEditingActive,

              undo:
                historyRuntime.undo,

              redo:
                historyRuntime.redo
            }
          );
        },
        handleClipboardHotkeys: handleClipboardHotkeysFromTool
      });
    },
    {
      capture: true
    }
  );

  window.addEventListener(
    "wheel",
    (event) => {
      blockBrowserWorkspaceDefaults({
        event,
        handleWorkspaceHotkeys: handleWorkspaceHotkeysFromTool,

        handleHistoryHotkeys: (
          keyboardEvent
        ) => {
          handleHistoryHotkeys(
            keyboardEvent,
            {
              isTextEditingActive,

              undo:
                historyRuntime.undo,

              redo:
                historyRuntime.redo
            }
          );
        },
        handleClipboardHotkeys: handleClipboardHotkeysFromTool
      });
    },
    {
      passive: false,
      capture: true
    }
  );

  initPointerControls();
  
  stage.addEventListener("dblclick", (event) => {
    if (isWhiteboardOverlayOpen()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    handleStageDoubleClick(event);
  });

  stage.addEventListener("contextmenu", (event) => {
    if (isWhiteboardOverlayOpen()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
  });

  stage.addEventListener("mouseenter", () => {
    setWorkspacePointerState(true);
  });

  stage.addEventListener("mouseleave", () => {
    setWorkspacePointerState(false);
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Space") {
        state.isSpacePressed = true;
      }
    }
  );

  window.addEventListener(
    "keyup",
    (event) => {
      if (event.code === "Space") {
        state.isSpacePressed = false;
      }
    }
  );

  if (addNodeButton) {
    addNodeButton.addEventListener("click", handleAddNodeClick);
  }

  initPresentationMode();
  initConnectionMenu();
  // initZoneHotkeys();
  initZoneSelection();
  initZoneMenu();
  initTextLabels();

  initDeleteController();

  initWorkspaceContextMenu({
    createNode
  });

  restoreWorkspaceSnapshot =
    createWorkspaceRestore({
      createNode
    });

  const historyRuntime =
    initHistoryRuntime({
      restoreWorkspaceSnapshot
    });

  initFloatingPanel({
    undo:
      historyRuntime.undo,

    redo:
      historyRuntime.redo,

    restoreWorkspaceSnapshot
  });

  initProjectAutosave();

  const themeObserver = new MutationObserver(() => {
    applyTransform();
    updateAllConnections();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"]
  });
  
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape") {
        closeAllContextMenus();
      }
    }
  );

  applyTransform();
  await showProjectStartModal({
    restoreWorkspaceSnapshot
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}