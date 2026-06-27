// import {

// } from "../hub.js";


export function setupNodeResize({
  node,
  resizeHandle,
  getNodeData,
  state,
  updateAllConnections
}) {
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let resizeRaf = null;

  resizeHandle.addEventListener("mousedown", (event) => {
    const nodeData = getNodeData(node);
    if (!nodeData || !nodeData.isEditing) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    isResizing = true;

    startX = event.clientX;
    startY = event.clientY;

    startWidth = node.offsetWidth;
    startHeight = node.offsetHeight;
  });

  window.addEventListener("mousemove", (event) => {
    if (!isResizing) return;

    const dx = (event.clientX - startX) / state.zoom;
    const dy = (event.clientY - startY) / state.zoom;

    node.style.width = `${startWidth + dx}px`;
    node.style.height = `${startHeight + dy}px`;

    if (!resizeRaf) {
      resizeRaf = requestAnimationFrame(() => {
        updateAllConnections();
        resizeRaf = null;
      });
    }
  });

  window.addEventListener("mouseup", () => {
    if (isResizing) {
      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );
    }

    isResizing = false;
  });
}