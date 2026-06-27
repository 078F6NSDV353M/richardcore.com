// import {

// } from "../hub.js";

export function getNodeData(state, nodeElement) {
  if (!nodeElement) return null;

  const nodeId = Number(nodeElement.dataset.nodeId);
  if (!nodeId) return null;

  return state.nodes.find((node) => node.id === nodeId) || null;
}

export function copyNodeContent(fromNodeEl, toNodeEl) {
  if (!fromNodeEl || !toNodeEl) return;

  const oldTitle = fromNodeEl.querySelector(".construct-node-title");
  const newTitle = toNodeEl.querySelector(".construct-node-title");
  if (oldTitle && newTitle) {
    newTitle.textContent = oldTitle.textContent;
  }

  const oldText = fromNodeEl.querySelector(".construct-node-text");
  const newText = toNodeEl.querySelector(".construct-node-text");
  if (oldText && newText) {
    newText.textContent = oldText.textContent;
  }

  const oldImage = fromNodeEl.querySelector(".construct-node-image img");
  const newImageContainer = toNodeEl.querySelector(".construct-node-image");

  if (oldImage && newImageContainer) {
    newImageContainer.innerHTML = "";

    const img = document.createElement("img");
    img.src = oldImage.src;
    img.alt = "Node image";
    img.draggable = false;

    newImageContainer.appendChild(img);
  }
}

export function findMatchingPort(sourcePort, targetNode) {
  if (!sourcePort || !targetNode) return null;

  const classes = [
    "construct-node-port-top",
    "construct-node-port-right",
    "construct-node-port-bottom",
    "construct-node-port-left"
  ];

  for (const cls of classes) {
    if (sourcePort.classList.contains(cls)) {
      return targetNode.querySelector(`.${cls}`);
    }
  }

  return null;
}