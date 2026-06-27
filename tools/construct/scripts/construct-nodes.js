import {
  state,
  NODE_WIDTH,
  NODE_HEIGHT,
  getStage,
  getNodesLayer,
  screenToWorld,
  applyTransform,
  updateAllConnections,
  removeConnection,
  createConnectionFromPorts,
  ensureNodeContextMenu,
  openNodeContextMenu,
  closeNodeContextMenu,
  handleNodeMenuAction,
  applyNodeEditMode,
  toggleNodeEditMode,
  closeNodeEditMode,
  closeAllNodeEditModes,
  setupEditOutsideClose,
  setImage,
  setImageFromFile,
  handleImagePaste,
  openImageUrlPrompt,
  setupImageHandlers,
  clampTextLength,
  setupTextHandlers,
  keepNodeScrollInside,
  setupScrollHandlers,
  updateSideIndicator,
  clearNodeSelection,
  getSelectedNodeElements,
  setupNodeSelection,
  setupNodeResize,
  openWhiteboardOverlay,
  getNodeData,
  pasteClipboard,
  openMultiselectMenu,
  hasMixedSelection,
  getSelectedConnections,
  restoreSelectedConnectionClasses
} from "../hub.js";


export function getNodeDataFromElement(nodeElement) {
  return getNodeData(state, nodeElement);
}

export function createNode(worldX, worldY, options = {}) {
  const nodesLayer = getNodesLayer();

  if (!nodesLayer) return;

  ensureNodeContextMenu();

  const nodeType =
    ["text", "image", "whiteboard", "multi"].includes(options.type)
      ? options.type
      : "multi";

  const defaultTitleMap = {
    text: "Text node",
    image: "Image node",
    whiteboard: "Whiteboard",
    multi: "Multi node"
  };

  const nodeId =
    typeof options.id === "number"
      ? options.id
      : state.nextNodeId++;

  if (nodeId >= state.nextNodeId) {
    state.nextNodeId = nodeId + 1;
  }

  const node = document.createElement("div");
  node.className = "construct-node";
  node.tabIndex = 0;
  node.dataset.nodeId = String(nodeId);
  node.dataset.color = "default";
  node.dataset.nodeType = nodeType;
  node.classList.add(`construct-node-type-${nodeType}`);

  node.innerHTML = `
    <div class="construct-node-port construct-node-port-top"></div>
    <div class="construct-node-port construct-node-port-right"></div>
    <div class="construct-node-port construct-node-port-bottom"></div>
    <div class="construct-node-port construct-node-port-left"></div>

    <div class="construct-node-content">
      <div class="construct-node-title-row">

        <div
          class="construct-node-title"
          contenteditable="true"
          spellcheck="false"
        >${defaultTitleMap[nodeType]}</div>

        <button
          class="construct-node-side-indicator side-a"
          type="button"
        >
          A
        </button>

      </div>
      <div class="construct-node-body-scroll">
        <div class="construct-node-image-block">
          <div
            class="construct-node-image"
            tabindex="0"
            title="Paste image with Ctrl+V, upload file, or add image link"
          >
            <div class="construct-node-image-placeholder">
              <span>Image</span>

              <div class="construct-node-image-toolbar">
                <button
                  class="construct-node-image-upload-button"
                  type="button"
                  title="Upload image"
                >
                  <i data-lucide="upload"></i>
                </button>

                <button
                  class="construct-node-image-link-button"
                  type="button"
                  title="Add image link"
                >
                  <i data-lucide="link"></i>
                </button>

                <button
                  class="construct-node-image-paste-button"
                  type="button"
                  title="Paste image"
                >
                  <i data-lucide="clipboard-paste"></i>
                </button>

                <button
                  class="construct-node-image-whiteboard-button"
                  type="button"
                  title="Open whiteboard"
                >
                  <i data-lucide="brush"></i>
                </button>

                <button
                  class="construct-node-image-remove-button"
                  type="button"
                  title="Remove image"
                >
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>

            <input
              class="construct-node-image-input"
              type="file"
              accept="image/*"
            />
          </div>
        </div>

        <div
          class="construct-node-text"
          contenteditable="true"
          spellcheck="false"
        >Enter your text</div>
        
      </div>
    </div>

    <div class="construct-node-resize"></div>
  `;

  if (options.skipCentering) {
    node.style.left = `${worldX}px`;
    node.style.top = `${worldY}px`;
  } else {
    node.style.left =
      `${worldX - NODE_WIDTH / 2}px`;

    node.style.top =
      `${worldY - NODE_HEIGHT / 2}px`;
  }

  if (options.width) {
    node.style.width = options.width;
  }

  if (options.height) {
    node.style.height = options.height;
  }

  nodesLayer.appendChild(node);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (!Array.isArray(state.nodes)) {
    state.nodes = [];
  }

  state.nodes.push({
    id: nodeId,
    type: nodeType,

    currentSide: "A",

    sides: {
      A: {
        text:
          typeof options.text === "string"
            ? options.text
            : "Enter your text",

        image:
          typeof options.image === "string"
            ? options.image
            : "",

        whiteboard: []    
      },

      B: {
        text: "Enter your text",
        image: "",

        whiteboard: []
      }
    },

    groupId: null,
    isCollapsed: false,
    isEditing: false,
    children: [],
    element: node
  });

  const titleEl =
    node.querySelector(".construct-node-title");

  const textEl =
    node.querySelector(".construct-node-text");

  function syncCurrentSideFromDom() {
    const nodeData =
      getNodeDataFromElement(node);

    if (!nodeData) {
      return;
    }

    const currentSide =
      nodeData.currentSide || "A";

    if (
      !nodeData.sides ||
      !nodeData.sides[currentSide]
    ) {
      return;
    }

    nodeData.sides[currentSide].text =
      textEl?.textContent || "";

    if (
      typeof nodeData.sides[currentSide].image !==
      "string"
    ) {
      nodeData.sides[currentSide].image = "";
    }

    if (
      !Array.isArray(
        nodeData.sides[currentSide]
          .whiteboard
      )
    ) {
      nodeData.sides[currentSide]
        .whiteboard = [];
    }
  }  

  const contentEl =
    node.querySelector(".construct-node-content");

  const sideIndicator =
    node.querySelector(
      ".construct-node-side-indicator"
    );

  sideIndicator?.addEventListener(
    "click",
    
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleNodeMenuAction(
        "Flip",
        node,
        state,
        getNodeDataFromElement,
        removeConnection,
        {
          createNode,
          getSelectedNodeElements
        }
      );
    }
  );

  sideIndicator?.addEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    }
  );

  const imageContainer =
    node.querySelector(".construct-node-image");

  const imageBlock =
    node.querySelector(".construct-node-image-block");

  const uploadButton =
    node.querySelector(".construct-node-image-upload-button");

  const linkButton =
    node.querySelector(".construct-node-image-link-button");

  const pasteButton =
    node.querySelector(".construct-node-image-paste-button");

  const whiteboardButton =
    node.querySelector(".construct-node-image-whiteboard-button");

  const removeButton =
    node.querySelector(".construct-node-image-remove-button");

  const fileInput =
    node.querySelector(".construct-node-image-input");

  const whiteboard =
    node.querySelector(
      ".construct-node-whiteboard"
    );

  const whiteboardBrush =
    node.querySelector(
      ".construct-node-whiteboard-brush"
    );

  const whiteboardMenu =
    node.querySelector(
      ".construct-node-whiteboard-menu"
    );

  const whiteboardSvg =
    node.querySelector(
      ".construct-node-whiteboard-svg"
    );  

  const resizeHandle =
    node.querySelector(".construct-node-resize");

  if (typeof options.title === "string" && titleEl) {
    titleEl.textContent = options.title;
  }

  if (typeof options.text === "string" && textEl) {
    textEl.textContent = options.text;
  }

  if (options.color) {
    node.style.borderColor = options.color;
  }

  const MAX_TITLE_CHARS = 30;
  const MAX_TEXT_CHARS = 1500;

  applyNodeEditMode(node, false);

  if (nodeType === "text" && imageBlock) {
    imageBlock.style.display = "none";
  }

  if (nodeType === "image" && textEl) {
    textEl.style.display = "none";
  }

  if (
    nodeType !== "whiteboard" &&
    whiteboard
  ) {
    whiteboard.style.display = "none";
  }

  if (
    nodeType === "whiteboard"
  ) {
    if (imageBlock) {
      imageBlock.style.display = "none";
    }

    if (textEl) {
      textEl.style.display = "none";
    }
  }

  const pasteImageIntoNode = (event) => {
    return handleImagePaste(
      event,
      node,
      getNodeDataFromElement,
      (file) => setImageFromFile(
        node,
        imageContainer,
        file,
        keepNodeScrollInside
      )
    );
  };

  whiteboardButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      openWhiteboardOverlay({
        node,
        imageContainer
      });
    }
  );

  const setImageFromUrl = (src) => {
    setImage(
      node,
      imageContainer,
      src,
      keepNodeScrollInside
    );
  };

  setupTextHandlers({
    node,
    textEl,
    titleEl,
    getNodeData: getNodeDataFromElement,
    clampTextLength,
    keepNodeScrollInside,
    pasteImageIntoNode,
    onContentChange: syncCurrentSideFromDom,
    MAX_TEXT_CHARS,
    MAX_TITLE_CHARS
  });

  setupScrollHandlers(contentEl, pasteImageIntoNode);

  setupImageHandlers({
    node,
    imageContainer,
    uploadButton,
    linkButton,
    pasteButton,
    removeButton,
    fileInput,
    getNodeData: getNodeDataFromElement,
    pasteImageIntoNode,
    setImageFromFile,
    openImageUrlPrompt,
    setImageFromUrl,
    keepNodeScrollInside
  });

  setupNodeSelection({
    node,
    state,
    closeNodeContextMenu
  });

  setupNodeResize({
    node,
    resizeHandle,
    getNodeData: getNodeDataFromElement,
    state,
    updateAllConnections
  });

  setupEditOutsideClose(
    node,
    getNodeDataFromElement,
    closeNodeEditMode
  );

  node.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      hasMixedSelection() &&
      node.classList.contains("is-selected")
    ) {
      restoreSelectedConnectionClasses();

      openMultiselectMenu(
        event.clientX,
        event.clientY
      );

      return;
    }

    const nodeData =
      getNodeDataFromElement(node);

    if (nodeData?.isEditing) {
      return;
    }

    openNodeContextMenu(node, event.clientX, event.clientY, {
      onAction: (action, nodeEl, payload) => {
        handleNodeMenuAction(
          action,
          nodeEl,
          state,
          getNodeDataFromElement,
          removeConnection,
          {
            createNode,
            getSelectedNodeElements,
            value: payload?.value
          }
        );
      }
    });
  });

  node.addEventListener("dblclick", (event) => {
    event.stopPropagation();

    const nodeData =
      getNodeDataFromElement(node);

    if (nodeData?.isEditing) {
      return;
    }

    toggleNodeEditMode(node, getNodeDataFromElement);
  });

  if (!options.skipSave) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }

  return node;
}

export function handleStageDoubleClick(event) {
  if (event.target.closest(".construct-node")) return;

  const stage = getStage();
  if (!stage) return;

  const rect = stage.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const worldPoint = screenToWorld(screenX, screenY);
  createNode(worldPoint.x, worldPoint.y);
}

export function handleAddNodeClick() {
  const stage = getStage();

  if (!stage) return;

  const rect =
    stage.getBoundingClientRect();

  const visibleCenterX =
    rect.width / 2;

  const visibleCenterY =
    rect.height / 2;

  const worldPoint =
    screenToWorld(
      visibleCenterX,
      visibleCenterY
    );

  createNode(
    worldPoint.x,
    worldPoint.y
  );
}

export function toggleGroupCollapse(
  groupElement,
  skipSave = false
) {
  if (!groupElement) return;

  const groupId = Number(groupElement.dataset.nodeId);
  const groupData = state.nodes.find((node) => node.id === groupId);

  if (!groupData || groupData.type !== "group") return;

  groupData.isCollapsed = !groupData.isCollapsed;
  groupElement.classList.toggle("is-collapsed", groupData.isCollapsed);

  groupData.children.forEach((childId) => {
    const child = state.nodes.find((node) => node.id === childId);
    if (!child || !child.element) return;

    child.element.style.display = groupData.isCollapsed ? "none" : "";
  });

  updateAllConnections();

  if (!skipSave) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNodeContextMenu();
    closeAllNodeEditModes(getNodeDataFromElement);
    return;
  }

  const isDeleteKey =
    event.key === "Delete" ||
    event.key === "Backspace";

  if (!isDeleteKey) {
    return;
  }

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
});