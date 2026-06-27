import {
  state,
  NODE_WIDTH,
  NODE_HEIGHT,
  getStage,
  screenToWorld,
  createConnectionFromPorts,
  setImage,
  duplicateImageAsset,
  createZone,
  applyZoneLineStyle,
  createTextLabel,
  getSelectedTextLabels,
  getTextLabelData,
  clearTextLabelSelection
} from "../hub.js";


export function getSelectedNodesForClipboard() {
  return state.nodes
    .map((node) => node.element)
    .filter((element) =>
      element?.classList.contains("is-selected")
    );
}

export function serializeNode(nodeElement) {
  const nodeId =
    Number(nodeElement.dataset.nodeId);

  const nodeData =
    state.nodes.find(
      (node) => node.id === nodeId
    );

  if (!nodeData) {
    return null;
  }

  return {
    id: nodeData.id,
    type: nodeData.type,

    left:
      parseFloat(nodeElement.style.left) || 0,

    top:
      parseFloat(nodeElement.style.top) || 0,

    width:
      nodeElement.style.width || "",

    height:
      nodeElement.style.height || "",

    color:
      nodeElement.style.borderColor || "",

    title:
      nodeElement.querySelector(
        ".construct-node-title"
      )?.textContent || "",

        currentSide:
      nodeData.currentSide || "A",

    sides:
      structuredClone(
        nodeData.sides || {
          A: {
            text: "",
            image: ""
          },

          B: {
            text: "",
            image: ""
          }
        }
      )
  };
}

export function serializeConnections(selectedIds) {
  return state.connections
    .filter((connection) => {
      const fromNode =
        connection.from?.closest(
          ".construct-node"
        );

      const toNode =
        connection.to?.closest(
          ".construct-node"
        );

      const fromId =
        Number(fromNode?.dataset.nodeId);

      const toId =
        Number(toNode?.dataset.nodeId);
    
      return (
        selectedIds.has(fromId) ||
        selectedIds.has(toId)
      );
    })
    .map((connection) => {
      const fromNode =
        connection.from.closest(
          ".construct-node"
        );

      const toNode =
        connection.to.closest(
          ".construct-node"
        );

      return {
        fromNodeId:
          Number(
            fromNode.dataset.nodeId
          ),

        toNodeId:
          Number(
            toNode.dataset.nodeId
          ),

        fromPortClass:
          [...connection.from.classList]
            .find((cls) =>
              cls.startsWith(
                "construct-node-port-"
              )
            ),

        toPortClass:
          [...connection.to.classList]
            .find((cls) =>
              cls.startsWith(
                "construct-node-port-"
              )
            ),

        type:
          connection.type,

        style:
          connection.style,

        color:
          connection.color
      };
    });
}

export function serializeZones() {
  return [
    ...document.querySelectorAll(
      ".construct-zone.is-selected"
    )
  ].map((zone) => {
    const zoneData =
      zone.__zoneData;

    return {
      x: zoneData.x,
      y: zoneData.y,

      width:
        zoneData.width,

      height:
        zoneData.height,

      color:
        zoneData.color,

      style:
        zoneData.style,

      shape:
        zoneData.shape,

      locked:
        zoneData.locked
    };
  });
}

export function serializeTextLabels() {
  return getSelectedTextLabels()
    .map((label) => {
      const labelData =
        getTextLabelData(label);

      if (!labelData) {
        return null;
      }

      return {
        x: labelData.x,
        y: labelData.y,
        text: labelData.text,
        color: labelData.color,
        fontSize: labelData.fontSize,
        locked: labelData.locked
      };
    })
    .filter(Boolean);
}

export function copySelectedNodes({
  withConnections = false
} = {}) {
  const selected =
    getSelectedNodesForClipboard();

  const serializedZones =
    serializeZones();

  const serializedTextLabels =
    serializeTextLabels();  

  if (
    selected.length === 0 &&
    serializedZones.length === 0 &&
    serializedTextLabels.length === 0
  ) {
    return;
  }

  const serializedNodes =
    selected
      .map(serializeNode)
      .filter(Boolean);

  const selectedIds =
    new Set(
      serializedNodes.map(
        (node) => node.id
      )
    );

  state.nodeClipboard = {
    nodes:
      serializedNodes,

    zones:
      serializedZones,

    textLabels:
      serializedTextLabels,  

    connections:
      withConnections
        ? serializeConnections(
            selectedIds
          )
        : [],

    withConnections
  };
}

export function getClipboardBounds(
  items
) {
  const bounds =
    items.reduce(
      (result, item) => {
        const width =
          parseFloat(item.width) ||
          NODE_WIDTH;

        const height =
          parseFloat(item.height) ||
          NODE_HEIGHT;

        return {
          minX:
            Math.min(result.minX, item.left ?? item.x),

          minY:
            Math.min(result.minY, item.top ?? item.y),

          maxX:
            Math.max(
              result.maxX,
              (item.left ?? item.x) + width
            ),

          maxY:
            Math.max(
              result.maxY,
              (item.top ?? item.y) + height
            )
        };
      },
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
      }
    );

  if (!Number.isFinite(bounds.minX)) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0
    };
  }

  return bounds;
}

export function getViewportCenterWorld() {
  const stage =
    getStage();

  if (!stage) {
    return {
      x: 0,
      y: 0
    };
  }

  const rect =
    stage.getBoundingClientRect();

  return screenToWorld(
    rect.width / 2,
    rect.height / 2
  );
}

export function pasteClipboard({
  createNode,
  worldX,
  worldY
}) {
  const clipboard =
    state.nodeClipboard;

  if (
    !clipboard ||
    (
      !Array.isArray(clipboard.nodes) &&
      !Array.isArray(clipboard.zones) &&
      !Array.isArray(clipboard.textLabels)
    )
  ) {
    return;
  }

  const oldToNewIdMap =
    new Map();

  const pastedNodes = [];
  const pastedZones = [];
  const pastedTextLabels = [];

  const bounds =
    getClipboardBounds([
      ...(clipboard.nodes || []),
      ...(clipboard.zones || []),
      ...(clipboard.textLabels || [])
    ]);

  const clipboardCenterX =
    (bounds.minX + bounds.maxX) / 2;

  const clipboardCenterY =
    (bounds.minY + bounds.maxY) / 2;

  const viewportCenter =
    typeof worldX === "number" &&
    typeof worldY === "number"
      ? {
          x: worldX,
          y: worldY
        }
      : getViewportCenterWorld();

  const pasteOffsetX =
    viewportCenter.x - clipboardCenterX;

  const pasteOffsetY =
    viewportCenter.y - clipboardCenterY;

  clipboard.nodes.forEach(
    async (savedNode) => {
      const node =
        createNode(
          savedNode.left +
            pasteOffsetX,

          savedNode.top +
            pasteOffsetY,

          {
            type:
              savedNode.type,

            skipSave:
              true
          }
        );

      if (!node) {
        return;
      }

      node.style.width =
        savedNode.width;

      node.style.height =
        savedNode.height;

      node.style.borderColor =
        savedNode.color;

      if (savedNode.color) {
        node.style.setProperty(
          "--construct-node-port-color",
          savedNode.color
        );
      }  

      const title =
        node.querySelector(
          ".construct-node-title"
        );

      if (title) {
        title.textContent =
          savedNode.title;
      }

      const nodeData =
        state.nodes.find(
          (item) =>
            item.element === node
        );

      if (nodeData) {
        nodeData.currentSide =
          savedNode.currentSide || "A";

        nodeData.sides =
          structuredClone(
            savedNode.sides || {
              A: {
                text: "",
                image: ""
              },

              B: {
                text: "",
                image: ""
              }
            }
          );
      }

      const currentSide =
        nodeData?.currentSide || "A";

      const currentSideData =
        nodeData?.sides?.[currentSide];

      if (
        currentSideData?.image
      ) {

        currentSideData.image =
          await duplicateImageAsset(
            currentSideData.image
          );
      }

      const sideIndicator =
        node.querySelector(
          ".construct-node-side-indicator"
        );

      if (sideIndicator) {
        sideIndicator.textContent =
          `${currentSide}`;
      }

      const text =
        node.querySelector(
          ".construct-node-text"
        );

      if (text) {
        text.textContent =
          currentSideData?.text || "";
      }

      const imageContainer =
        node.querySelector(
          ".construct-node-image"
        );

      if (imageContainer) {

        imageContainer
          .querySelectorAll("img")
          .forEach((img) => {
            img.remove();
          });

        if (
          currentSideData?.image
        ) {

          setImage(
            node,
            imageContainer,
            currentSideData.image
          );

        } else {

          imageContainer.classList.remove(
            "has-image"
          );
        }
      }

      const newId =
        Number(
          node.dataset.nodeId
        );

      oldToNewIdMap.set(
        savedNode.id,
        newId
      );

      pastedNodes.push(node);
    }
  );

  if (
    Array.isArray(
      clipboard.textLabels
    )
  ) {
    clipboard.textLabels.forEach(
      (savedLabel) => {
        const label =
          createTextLabel({
            x:
              savedLabel.x +
              pasteOffsetX,

            y:
              savedLabel.y +
              pasteOffsetY,

            text:
              savedLabel.text,

            color:
              savedLabel.color,

            fontSize:
              savedLabel.fontSize,

            locked:
              savedLabel.locked
          });

        if (!label) {
          return;
        }

        pastedTextLabels.push(
          label
        );
      }
    );
  }

  if (
    Array.isArray(
      clipboard.zones
    )
  ) {

    clipboard.zones.forEach(
      (savedZone) => {

        const zone =
          createZone({
            x:
              savedZone.x +
              pasteOffsetX,

            y:
              savedZone.y +
              pasteOffsetY,

            width:
              savedZone.width,

            height:
              savedZone.height,

            shape:
              savedZone.shape || "rect"
          });

        if (!zone) {
          return;
        }

        const zoneData =
          zone.__zoneData;

        zoneData.color =
          savedZone.color || "";

        zoneData.style =
          savedZone.style || "solid";

        applyZoneLineStyle(
          zone,
          zoneData.style,
          {
            skipHistory: true
          }
        );  

        zoneData.locked =
          Boolean(
            savedZone.locked
          );

        zone.dataset.locked =
          String(
            zoneData.locked
          );

        if (
          savedZone.color
        ) {
          zone.style.setProperty(
            "--construct-zone-color",
            savedZone.color
          );
        }

        pastedZones.push(
          zone
        );
      }
    );
  }

  state.nodes.forEach((nodeData) => {
    nodeData.element?.classList.remove(
      "is-selected"
    );
  });

  document
    .querySelectorAll(
      ".construct-zone.is-selected"
    )
    .forEach((zone) => {
      zone.classList.remove(
        "is-selected"
      );
    });

  clearTextLabelSelection();  

  pastedNodes.forEach((node) => {
    node.classList.add(
      "is-selected"
    );
  });

  pastedZones.forEach((zone) => {
    zone.classList.add(
      "is-selected"
    );
  });

  pastedTextLabels.forEach((label) => {
    label.classList.add(
      "is-selected"
    );
  });

  if (
    clipboard.withConnections
  ) {
    clipboard.connections.forEach(
      (savedConnection) => {
        const newFromId =
          oldToNewIdMap.get(
            savedConnection.fromNodeId
          ) || savedConnection.fromNodeId;

        const newToId =
          oldToNewIdMap.get(
            savedConnection.toNodeId
          ) || savedConnection.toNodeId;

        const fromNode =
          document.querySelector(
            `.construct-node[data-node-id="${newFromId}"]`
          );

        const toNode =
          document.querySelector(
            `.construct-node[data-node-id="${newToId}"]`
          );

        if (
          !fromNode ||
          !toNode
        ) {
          return;
        }

        const fromPort =
          fromNode.querySelector(
            `.${savedConnection.fromPortClass}`
          );

        const toPort =
          toNode.querySelector(
            `.${savedConnection.toPortClass}`
          );

        if (
          !fromPort ||
          !toPort
        ) {
          return;
        }

        createConnectionFromPorts(
          fromPort,
          toPort,
          {
            type:
              savedConnection.type,

            style:
              savedConnection.style,

            color:
              savedConnection.color,

            skipSave:
              true
          }
        );
      }
    );
  }

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}