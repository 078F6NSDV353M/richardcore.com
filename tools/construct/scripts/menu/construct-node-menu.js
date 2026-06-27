import {
  state,
  applyColorToSelectedConnections,
  applyZoneColor,
  registerArchivedNodeAssets,
  getArchivePathForImagePath,
  archiveImageAssetLater,
  removeConnection,
  copySelectedNodes,
  getSelectedNodeElements,
  flipNodeSide,
  closeAllContextMenus
} from "../../hub.js";

let contextMenuElement = null;
let contextMenuNodeElement = null;

export function ensureNodeContextMenu() {
  if (contextMenuElement) {
    return contextMenuElement;
  }

  contextMenuElement = document.createElement("div");
  contextMenuElement.className = "construct-node-context-menu";
  contextMenuElement.hidden = true;
  contextMenuElement.tabIndex = -1;

  const stage = document.querySelector(".construct-stage");

  if (stage) {
    stage.appendChild(contextMenuElement);
  } else {
    document.body.appendChild(contextMenuElement);
  }

  return contextMenuElement;
}

export function openNodeContextMenu(nodeElement, clientX, clientY, helpers) {
  const menu = ensureNodeContextMenu();
  
  closeAllContextMenus();

  menu.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  menu.addEventListener("dblclick", (event) => {
    event.stopPropagation();
  });
  if (!menu || !nodeElement) return;

  contextMenuNodeElement = nodeElement;

  menu.hidden = false;

  menu.classList.add(
    "construct-menu"
  );

  menu.style.left = "0px";
  menu.style.top = "0px";

  const selectedNodes =
    getSelectedNodeElements(state);

  menu.innerHTML = `
    <div class="construct-menu-color-grid">
      
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#FF2E7B" style="background:#FF2E7B;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#FF3636" style="background:#FF3636;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#FF8000" style="background:#FF8000;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#FFEA00" style="background:#FFEA00;"></button>

      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#BFFF00" style="background:#BFFF00;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#00FF40" style="background:#00FF40;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#00FFCC" style="background:#00FFCC;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#00D0FF" style="background:#00D0FF;"></button>

      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#0095FF" style="background:#0095FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#5768FF" style="background:#5768FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#9B30FF" style="background:#9B30FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#FF2ED5" style="background:#FF2ED5;"></button>
      
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#ffffff" style="background:#ffffff;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#808080" style="background:#808080;"></button>
      <button class="construct-menu-color-button" type="button" data-action="Color" data-value="#000000" style="background:#000000;"></button>

    </div>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Clipboard</div>

    <button class="construct-menu-button" type="button" data-action="Copy" title="Copy">
      <i data-lucide="copy"></i>
      <span>Copy</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Copy with links" title="Copy with links">
      <i data-lucide="copy-plus"></i>
      <span>Copy with links</span>
    </button>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Modify</div>

    <button class="construct-menu-button" type="button" data-action="Flip" title="Flip">
      <i data-lucide="flip-horizontal-2"></i>
      <span>Flip</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Unlink all" title="Unlink all">
      <i data-lucide="unlink"></i>
      <span>Unlink all</span>
    </button>

    <div class="construct-menu-separator"></div>

    <button class="construct-menu-button construct-menu-button-danger" type="button" data-action="Delete" title="Delete">
      <i data-lucide="trash-2"></i>
      <span>Delete</span>
    </button>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const items = menu.querySelectorAll(
    "[data-action]"
  );

  items.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.stopPropagation();

      const action = item.dataset.action;

      helpers?.onAction?.(
        action,
        contextMenuNodeElement,
        {
          value: item.dataset.value
        }
      );

      closeNodeContextMenu();
    });
  });

  const rect = menu.getBoundingClientRect();
  const stage = document.querySelector(".construct-stage");
  const toolbar = document.querySelector(".construct-toolbar");

  const stageRect = stage?.getBoundingClientRect();
  const toolbarRect = toolbar?.getBoundingClientRect();

  const minX = stageRect ? stageRect.left : 0;
  const minY = stageRect ? stageRect.top : 0;

  const rightLimit =
    toolbarRect && !toolbar.hidden
      ? Math.min(stageRect.right, toolbarRect.left)
      : stageRect.right;

  const maxX = stageRect
    ? rightLimit - rect.width
    : window.innerWidth - rect.width;

  const maxY = stageRect
    ? stageRect.bottom - rect.height
    : window.innerHeight - rect.height;

  const finalX = Math.min(
    Math.max(clientX, minX),
    Math.max(minX, maxX)
  );

  const finalY = Math.min(
    Math.max(clientY, minY),
    Math.max(minY, maxY)
  );

  menu.style.left = `${finalX}px`;
  menu.style.top = `${finalY}px`;
}

export function closeNodeContextMenu() {
  if (!contextMenuElement) return;

  contextMenuElement.hidden = true;
  contextMenuElement.style.left = "";
  contextMenuElement.style.top = "";
  contextMenuNodeElement = null;
}

export function handleNodeMenuAction(
  action,
  nodeEl,
  state,
  getNodeData,
  removeConnection,
  helpers = {}
) {
  const nodeData = getNodeData(nodeEl);

  if (!nodeData) {
    return;
  }

  if (action === "Color") {
    const color = helpers?.value;

    if (!color) {
      return;
    }

    const selectedNodes =
      getSelectedNodeElements(state);

    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : [nodeEl];

    targetNodes.forEach((targetNode) => {
      targetNode.style.borderColor =
        color;

      targetNode.style.setProperty(
        "--construct-node-port-color",
        color
      );
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    return;
  }

  if (action === "Copy") {
    copySelectedNodes({
      withConnections: false
    });

    return;
  }

  if (action === "Copy with links") {
    copySelectedNodes({
      withConnections: true
    });

    return;
  }

  if (action === "Unlink all") {
    const selectedNodes =
      getSelectedNodeElements(state);

    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : [nodeEl];

    const targetIds =
      new Set(
        targetNodes.map((targetNode) =>
          Number(targetNode.dataset.nodeId)
        )
      );

    const connectionsToRemove =
      state.connections.filter((connection) => {
        const fromNode =
          connection.from?.closest(".construct-node");

        const toNode =
          connection.to?.closest(".construct-node");

        return (
          targetIds.has(
            Number(fromNode?.dataset.nodeId)
          ) ||
          targetIds.has(
            Number(toNode?.dataset.nodeId)
          )
        );
      });

    connectionsToRemove.forEach((connection) => {
      removeConnection(
        connection,
        {
          skipSave: true
        }
      );
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    return;
  }

  if (action === "Flip") {
    const selectedNodes =
      getSelectedNodeElements(state);

    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : [nodeEl];

    targetNodes.forEach((targetNode) => {
      const targetData =
        getNodeData(targetNode);

      if (!targetData) {
        return;
      }

      flipNodeSide(
        targetNode,
        targetData
      );
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    return;
  }

  if (action === "Delete") {
    const selectedNodes =
      getSelectedNodeElements(state);

    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : [nodeEl];

    const targetIds =
      new Set(
        targetNodes.map((node) =>
          Number(node.dataset.nodeId)
        )
      );

    const connectionsToRemove =
      state.connections.filter(
        (connection) => {
          const fromNode =
            connection.from?.closest(
              ".construct-node"
            );

          const toNode =
            connection.to?.closest(
              ".construct-node"
            );

          const fromId =
            Number(
              fromNode?.dataset.nodeId
            );

          const toId =
            Number(
              toNode?.dataset.nodeId
            );

          return (
            targetIds.has(fromId) ||
            targetIds.has(toId)
          );
        }
      );

    connectionsToRemove.forEach(
      (connection) => {
        removeConnection(
          connection,
          {
            skipSave: true
          }
        );
      }
    );

    targetNodes.forEach((targetNode) => {
      const targetData =
        getNodeData(targetNode);

      if (!targetData) {
        return;
      }

      const archivedImages = [];

      ["A", "B"].forEach((side) => {
        const imagePath =
          targetData.sides?.[side]?.image;

        if (!imagePath) {
          return;
        }

        const archivedPath =
          getArchivePathForImagePath(
            imagePath
          );

        archivedImages.push({
          side,
          originalPath: imagePath,
          archivedPath
        });

        archiveImageAssetLater(
          imagePath
        );
      });

      if (archivedImages.length > 0) {
        registerArchivedNodeAssets(
          targetData.id,
          archivedImages
        );
      }
    });

    targetNodes.forEach((targetNode) => {
      const targetId =
        Number(
          targetNode.dataset.nodeId
        );

      targetNode.remove();

      state.nodes =
        state.nodes.filter(
          (node) =>
            node.id !== targetId
        );
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    return;
  }
}

