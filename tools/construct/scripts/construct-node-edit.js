// import {
//   getStage
// } from "../hub.js";

export function clearTextSelection() {
  const selection =
    window.getSelection?.();

  if (!selection) {
    return;
  }

  selection.removeAllRanges();
}

export function resetNodeContentScroll(nodeElement) {
  const bodyScroll =
    nodeElement?.querySelector(
      ".construct-node-body-scroll"
    );

  if (!bodyScroll) {
    return;
  }

  bodyScroll.scrollTop = 0;
  bodyScroll.scrollLeft = 0;
}

export function applyNodeEditMode(nodeElement, isEditing) {
  if (!nodeElement) return;

  const titleEl =
    nodeElement.querySelector(".construct-node-title");

  const textEl =
    nodeElement.querySelector(".construct-node-text");

  const imageToolbar =
    nodeElement.querySelector(".construct-node-image-toolbar");

  const imageContainer =
    nodeElement.querySelector(".construct-node-image");

  const resizeHandle =
    nodeElement.querySelector(".construct-node-resize");

  nodeElement.dataset.editing =
    isEditing ? "1" : "0";

  nodeElement.classList.toggle(
    "is-editing",
    isEditing
  );

  if (titleEl) {
    titleEl.contentEditable =
      isEditing ? "true" : "false";

    titleEl.setAttribute(
      "contenteditable",
      isEditing ? "true" : "false"
    );
  }

  if (textEl) {
    textEl.contentEditable =
      isEditing ? "true" : "false";

    textEl.setAttribute(
      "contenteditable",
      isEditing ? "true" : "false"
    );
  }

  if (imageToolbar) {
    imageToolbar.style.display =
      isEditing ? "" : "none";
  }

  if (imageContainer) {
    imageContainer.tabIndex =
      isEditing ? 0 : -1;
  }

  if (resizeHandle) {
    resizeHandle.hidden = !isEditing;

    resizeHandle.style.display =
      isEditing ? "" : "none";

    resizeHandle.style.pointerEvents =
      isEditing ? "auto" : "none";
  }

  if (!isEditing) {
    titleEl?.blur?.();
    textEl?.blur?.();
    imageContainer?.blur?.();

    if (
      document.activeElement &&
      nodeElement.contains(document.activeElement)
    ) {
      document.activeElement.blur?.();
    }

    clearTextSelection();
  }

  document
    .querySelectorAll(
      ".construct-node-whiteboard-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
    });

  if (!isEditing) {
    requestAnimationFrame(() => {
      resetNodeContentScroll(nodeElement);
      clearTextSelection();
    });
  }
}

export function closeAllNodeEditModes(getNodeData) {
  document
    .querySelectorAll(".construct-node.is-editing")
    .forEach((nodeElement) => {
      const nodeData =
        getNodeData(nodeElement);

      if (!nodeData) {
        return;
      }

      nodeData.isEditing = false;
      applyNodeEditMode(nodeElement, false);
    });
}

export function toggleNodeEditMode(nodeElement, getNodeData) {
  const nodeData =
    getNodeData(nodeElement);

  if (!nodeData) return;
  if (nodeData.type === "group") return;

  const wasEditing =
    Boolean(nodeData.isEditing);

  closeAllNodeEditModes(getNodeData);

  const nextEditing =
    !wasEditing;

  const freshNodeData =
    getNodeData(nodeElement);

  if (!freshNodeData) return;

  freshNodeData.isEditing =
    nextEditing;

  applyNodeEditMode(
    nodeElement,
    nextEditing
  );
}

export function closeNodeEditMode(nodeElement, getNodeData) {
  const nodeData = getNodeData(nodeElement);
  if (!nodeData || nodeData.type === "group") return;

  const title =
    nodeElement.querySelector(
      ".construct-node-title"
    );

  if (title) {
    title.scrollLeft = 0;
  }

  nodeData.isEditing = false;
  applyNodeEditMode(nodeElement, false);

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

let outsideCloseInitialized =
  false;

export function setupEditOutsideClose(
  node,
  getNodeData,
  closeNodeEditMode
) {

  if (outsideCloseInitialized) {
    return;
  }

  outsideCloseInitialized = true;

  document.addEventListener(
    "mousedown",
    (event) => {

      const clickedWhiteboardMenu =
        event.target.closest(
          ".construct-node-whiteboard-menu"
        );

      if (clickedWhiteboardMenu) {
        return;
      }

      const clickedNode =
        event.target.closest(
          ".construct-node"
        );

      document
        .querySelectorAll(
          ".construct-node.is-editing"
        )
        .forEach((nodeElement) => {

          if (clickedNode === nodeElement) {
            return;
          }

          closeNodeEditMode(
            nodeElement,
            getNodeData
          );
        });
    },
    true
  );
}