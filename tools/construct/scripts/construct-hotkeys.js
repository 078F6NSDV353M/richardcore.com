import {
  createNode,
  getStage,
  screenToWorld
} from "../hub.js";

export function createNodeAtViewportCenter(type) {
  const stage = getStage();

  if (!stage) {
    return;
  }

  const rect =
    stage.getBoundingClientRect();

  const world =
    screenToWorld(
      rect.width / 2,
      rect.height / 2
    );

  createNode(
    world.x,
    world.y,
    {
      type
    }
  );
}

export function handleWorkspaceHotkeys(
  event,
  helpers = {}
) {
  const {
    isTextEditingActive,
    focusSearch,
    flipSelectedNodes,
    openProject,
    saveProject,
    saveAsProject,
    fitWorkspace,
    exportPng
  } = helpers;

  if (
    typeof isTextEditingActive ===
      "function" &&
    isTextEditingActive()
  ) {
    return;
  }

  const isSearch =
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.code === "KeyF";

  if (isSearch) {
    event.preventDefault();
    event.stopPropagation();

    focusSearch?.();

    return;
  }

  const isFlip =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyF";

  if (isFlip) {
    event.preventDefault();
    event.stopPropagation();

    flipSelectedNodes?.();

    return;
  }

  const isOpen =
    (event.ctrlKey || event.metaKey) &&
    event.code === "KeyO";

  if (isOpen) {
    event.preventDefault();
    event.stopPropagation();

    openProject?.();

    return;
  }

  const isSave =
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.code === "KeyS";

  if (isSave) {
    event.preventDefault();
    event.stopPropagation();

    saveProject?.();

    return;
  }

  const isSaveAs =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyS";

  if (isSaveAs) {
    event.preventDefault();
    event.stopPropagation();

    saveAsProject?.();

    return;
  }

  const isFit =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyE";

  if (isFit) {
    event.preventDefault();
    event.stopPropagation();

    fitWorkspace?.();

    return;
  }

  const isCreateTextNode =
    event.ctrlKey &&
    event.altKey &&
    event.code === "KeyT";

  if (isCreateTextNode) {
    event.preventDefault();
    event.stopPropagation();

    createNodeAtViewportCenter(
      "text"
    );

    return;
  }

  const isCreateImageNode =
    event.ctrlKey &&
    event.altKey &&
    event.code === "KeyI";

  if (isCreateImageNode) {
    event.preventDefault();
    event.stopPropagation();

    createNodeAtViewportCenter(
      "image"
    );

    return;
  }

  const isCreateMultiNode =
    event.ctrlKey &&
    event.altKey &&
    event.code === "KeyM";

  if (isCreateMultiNode) {
    event.preventDefault();
    event.stopPropagation();

    createNodeAtViewportCenter(
      "multi"
    );

    return;
  }

  const isSelectAll =
    (event.ctrlKey || event.metaKey) &&
    event.code === "KeyA";

  if (isSelectAll) {
    event.preventDefault();
    event.stopPropagation();

    document
      .querySelectorAll(
        ".construct-node"
      )
      .forEach((node) => {
        node.classList.add(
          "is-selected"
        );
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

    document
      .querySelectorAll(
        ".construct-text-label"
      )
      .forEach((label) => {
        label.classList.add(
          "is-selected"
        );
      });

    return;
  }

  const isExportPng =
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.code === "KeyE";

  if (isExportPng) {
    event.preventDefault();
    event.stopPropagation();

    exportPng?.();

    return;
  }
}