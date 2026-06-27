import {
  state,
  getStage,
  screenToWorld,
  applyTransform,
  startConnection,
  updateConnectionPreview,
  updateNodeConnections,
  finishConnection,
  clearNodeSelection,
  isWhiteboardOverlayOpen,
  startSelectionBox,
  updateSelectionBox,
  finishSelectionBox,
  closeAllContextMenus
} from "../hub.js";


export function handleMouseDown(event) {
  if (isWhiteboardOverlayOpen()) {
    return;
  }

  if (
    !event.target.closest(
      ".construct-node-context-menu"
    ) &&
    !event.target.closest(
      ".construct-connection-menu"
    ) &&
    !event.target.closest(
      ".construct-connection-floating-submenu"
    )
  ) {
    closeAllContextMenus();
  }

  const isPanTrigger =
    event.button === 1 ||
    (
      event.button === 0 &&
      state.isSpacePressed
    );

  if (isPanTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const stage = getStage();
    if (!stage) return;

    state.isDragging = true;
    state.startX = event.clientX - state.panX;
    state.startY = event.clientY - state.panY;

    stage.style.cursor = "grabbing";
    return;
  }

  const port = event.target.closest(
    ".construct-node-port"
  );

  if (port) {
    event.preventDefault();
    event.stopPropagation();
    startConnection(port);
    return;
  }

  const node = event.target.closest(
    ".construct-node"
  );

  if (node) {
    if (event.button !== 0) {
      return;
    }

    const nodeData =
      state.nodes.find(
        (item) => item.element === node
      );

    const clickedEditableContent =
      event.target.closest(
        ".construct-node-title, .construct-node-text"
      );

    const clickedImageToolbar =
      event.target.closest(
        ".construct-node-image-toolbar"
      );

    const clickedImageInput =
      event.target.closest(
        ".construct-node-image-input"
      );

    const clickedWhiteboard =
      event.target.closest(
        ".construct-node-whiteboard"
      );

    if (
      nodeData?.isEditing &&
      (
        clickedEditableContent ||
        clickedImageToolbar ||
        clickedImageInput ||
        clickedWhiteboard
      )
    ) {
      return;
    }

    event.stopPropagation();

    const stage = getStage();
    if (!stage) return;

    const stageRect =
      stage.getBoundingClientRect();

    const mouseX =
      event.clientX - stageRect.left;

    const mouseY =
      event.clientY - stageRect.top;

    const world =
      screenToWorld(mouseX, mouseY);

    state.draggingNode = node;

    state.dragOffsetX =
      world.x -
      (parseFloat(node.style.left) || 0);

    state.dragOffsetY =
      world.y -
      (parseFloat(node.style.top) || 0);

    const selectedNodeItems =
      state.nodes
        .map((item) => item.element)
        .filter((element) =>
          element?.classList.contains("is-selected")
        );

    const selectedZoneItems =
      [
        ...document.querySelectorAll(
          ".construct-zone.is-selected"
        )
      ];

    const selectedTextLabelItems =
      [
        ...document.querySelectorAll(
          ".construct-text-label.is-selected"
        )
      ];  

    state.draggingSelection =
      node.classList.contains("is-selected")
        ? [
            ...selectedNodeItems,
            ...selectedZoneItems,
            ...selectedTextLabelItems
          ].map((element) => ({
            element,
            startLeft:
              parseFloat(element.style.left) || 0,
            startTop:
              parseFloat(element.style.top) || 0
          }))
        : [
            {
              element: node,
              startLeft:
                parseFloat(node.style.left) || 0,
              startTop:
                parseFloat(node.style.top) || 0
            }
          ];

    state.dragStartWorldX = world.x;
    state.dragStartWorldY = world.y;

    return;
  }

  if (event.button !== 0) {
    return;
  }

  const clickedButton =
    event.target.closest(
      ".construct-add-node-button"
    );

  const clickedFullscreen =
    event.target.closest(
      ".construct-fullscreen-toggle"
    );

  if (
    clickedButton ||
    clickedFullscreen
  ) {
    return;
  }

  clearNodeSelection(state);
  startSelectionBox(event);
}

export function handleMouseMove(event) {
  if (isWhiteboardOverlayOpen()) {
    return;
  }

  const stage = getStage();
  if (!stage) return;

  const rect =
    stage.getBoundingClientRect();

  const mouseX =
    event.clientX - rect.left;

  const mouseY =
    event.clientY - rect.top;

  if (state.connectingPort) {
    updateConnectionPreview(mouseX, mouseY);
    return;
  }

  if (state.draggingNode) {
    const world =
      screenToWorld(mouseX, mouseY);

    let newX =
      world.x - state.dragOffsetX;

    let newY =
      world.y - state.dragOffsetY;

    const draggingNodeId =
      Number(
        state.draggingNode.dataset.nodeId
      );

    const draggingNodeData =
      state.nodes.find(
        (node) => node.id === draggingNodeId
      );

    if (
      draggingNodeData &&
      draggingNodeData.groupId !== null
    ) {
      const parentGroup =
        state.nodes.find(
          (node) =>
            node.id === draggingNodeData.groupId
        );

      const groupElement =
        parentGroup?.element;

      if (groupElement) {
        const GROUP_PADDING_X = 24;
        const GROUP_PADDING_BOTTOM = 24;
        const GROUP_PADDING_TOP = 40;

        const groupX =
          parseFloat(groupElement.style.left) || 0;

        const groupY =
          parseFloat(groupElement.style.top) || 0;

        const groupWidth =
          groupElement.offsetWidth;

        const groupHeight =
          groupElement.offsetHeight;

        const nodeWidth =
          state.draggingNode.offsetWidth;

        const nodeHeight =
          state.draggingNode.offsetHeight;

        const minX =
          groupX + GROUP_PADDING_X;

        const minY =
          groupY + GROUP_PADDING_TOP;

        const maxX =
          groupX +
          groupWidth -
          nodeWidth -
          GROUP_PADDING_X;

        const maxY =
          groupY +
          groupHeight -
          nodeHeight -
          GROUP_PADDING_BOTTOM;

        newX =
          Math.max(minX, Math.min(maxX, newX));

        newY =
          Math.max(minY, Math.min(maxY, newY));
      }
    }

    const deltaX =
      world.x - state.dragStartWorldX;

    const deltaY =
      world.y - state.dragStartWorldY;

    if (
      Array.isArray(state.draggingSelection) &&
      state.draggingSelection.length > 0
    ) {
      state.draggingSelection.forEach((item) => {
        item.element.style.left =
          `${Math.round(item.startLeft + deltaX)}px`;

        item.element.style.top =
          `${Math.round(item.startTop + deltaY)}px`;

        if (
          item.element.classList.contains(
            "construct-zone"
          )
        ) {
          const zoneData =
            item.element.__zoneData;

          if (zoneData) {
            zoneData.x =
              parseFloat(item.element.style.left);

            zoneData.y =
              parseFloat(item.element.style.top);
          }
        }
      });
    } else {
      state.draggingNode.style.left =
        `${Math.round(newX)}px`;

      state.draggingNode.style.top =
        `${Math.round(newY)}px`;
    }

    if (
      draggingNodeData?.type === "group" &&
      Array.isArray(draggingNodeData.children)
    ) {
      draggingNodeData.children.forEach((childId) => {
        const childData =
          state.nodes.find(
            (node) => node.id === childId
          );

        const childElement =
          childData?.element;

        if (!childElement) return;

        const childX =
          parseFloat(childElement.style.left) || 0;

        const childY =
          parseFloat(childElement.style.top) || 0;

        childElement.style.left =
          `${childX + deltaX}px`;

        childElement.style.top =
          `${childY + deltaY}px`;
      });
    }

    if (!state.dragFrame) {
      state.dragFrame =
        requestAnimationFrame(() => {
          if (
            Array.isArray(state.draggingSelection) &&
            state.draggingSelection.length > 0
          ) {
            state.draggingSelection.forEach((item) => {
              if (
                item.element.classList.contains(
                  "construct-node"
                )
              ) {
                updateNodeConnections(item.element);
              }
            });
          } else {
            updateNodeConnections(
              state.draggingNode
            );
          }

          if (
            draggingNodeData?.type === "group" &&
            Array.isArray(draggingNodeData.children)
          ) {
            draggingNodeData.children.forEach(
              (childId) => {
                const childData =
                  state.nodes.find(
                    (node) => node.id === childId
                  );

                if (childData?.element) {
                  updateNodeConnections(
                    childData.element
                  );
                }
              }
            );
          }

          state.dragFrame = null;
        });
    }

    return;
  }

  if (state.selectionBox) {
    updateSelectionBox(event);
    return;
  }

  if (!state.isDragging) return;

  state.panX =
    event.clientX - state.startX;

  state.panY =
    event.clientY - state.startY;

  applyTransform();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function handleMouseUp(event) {
  if (state.connectingPort) {
    const targetPort =
      event.target.closest(
        ".construct-node-port"
      );

    finishConnection(targetPort);
  }

  if (
    state.isDragging ||
    state.draggingNode
  ) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }

  finishSelectionBox();

  state.isDragging = false;
  state.isSpacePressed = false;

  if (state.draggingNode) {
    state.draggingNode.style.cursor = "grab";
  }

  state.draggingNode = null;
  state.draggingSelection = null;
  state.dragStartWorldX = 0;
  state.dragStartWorldY = 0;

  const stage = getStage();

  if (stage) {
    stage.style.cursor = "default";
  }
}

export function initPointerControls() {
  const stage =
    getStage();

  if (!stage) {
    return;
  }

  stage.addEventListener(
    "mousedown",
    handleMouseDown
  );

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "mouseup",
    handleMouseUp
  );
}

window.addEventListener("keydown", (event) => {
  const isDeleteKey =
    event.key === "Delete" ||
    event.key === "Backspace";

  if (!isDeleteKey) return;

  const activeElement = document.activeElement;

  if (
    activeElement &&
    (
      activeElement.isContentEditable ||
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA"
    )
  ) {
    return;
  }

  event.preventDefault();

  window.dispatchEvent(
    new Event("construct:delete-selection")
  );
});

window.addEventListener(
  "construct:delete-selection",
  () => {
    window.dispatchEvent(
      new CustomEvent(
        "construct:delete-selected"
      )
    );
  }
);