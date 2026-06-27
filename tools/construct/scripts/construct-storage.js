export const CURRENT_PROJECT_VERSION = 1;

import {
  state,
  setImage,
  createZone,
  createTextLabel
} from "../hub.js";


export const STORAGE_KEY = "construct-workspace";

export const DEFAULT_ZONE_TITLE =
  "Zone title";

export let localAutosaveAvailable =
  true;

export function serializeNodes() {
  return state.nodes.map((node) => ({
    id: node.id,
    type: node.type,

    groupId: node.groupId,
    isCollapsed: node.isCollapsed,

    children:
      Array.isArray(node.children)
        ? [...node.children]
        : [],

    left:
      `${Math.round(
        parseFloat(
          node.element?.style.left
        ) || 0
      )}px`,

    top:
      `${Math.round(
        parseFloat(
          node.element?.style.top
        ) || 0
      )}px`,

    width:
      node.element?.style.width || "",

    height:
      node.element?.style.height || "",

    color:
      node.element?.style.borderColor || "",

    title:
      node.element
        ?.querySelector(".construct-node-title")
        ?.textContent || "",

    currentSide:
      node.currentSide || "A",

    sides:
      structuredClone(
        node.sides || {
          A: {
            text: "",
            image: "",
            whiteboard: []
          },

          B: {
            text: "",
            image: "",
            whiteboard: []
          }
        }
      )
  }));
}

export function serializeConnections() {
  return state.connections
    .map((connection) => {
      const fromNode =
        connection.from?.closest(
          ".construct-node"
        );

      const toNode =
        connection.to?.closest(
          ".construct-node"
        );

      const fromNodeId =
        Number(
          fromNode?.dataset?.nodeId
        );

      const toNodeId =
        Number(
          toNode?.dataset?.nodeId
        );

      if (
        !fromNodeId ||
        !toNodeId
      ) {
        return null;
      }

      const fromPortClass =
        [...connection.from.classList]
          .find((cls) =>
            cls.startsWith(
              "construct-node-port-"
            )
          );

      const toPortClass =
        [...connection.to.classList]
          .find((cls) =>
            cls.startsWith(
              "construct-node-port-"
            )
          );

      if (
        !fromPortClass ||
        !toPortClass
      ) {
        return null;
      }

      return {
        fromNodeId,
        toNodeId,

        fromPortClass,
        toPortClass,

        type:
          connection.type,

        style:
          connection.style,

        color:
          connection.color
      };
    })
    .filter(Boolean);
}

export function serializeZones() {
  return state.zones.map(
    (zone) => ({
      id: zone.id,

      title: zone.title,

      x: zone.x,
      y: zone.y,

      width: zone.width,
      height: zone.height,

      color: zone.color,
      style: zone.style,
      shape: zone.shape,

      locked: zone.locked
    })
  );
}

export function serializeTextLabels() {
  return state.textLabels.map((label) => ({
    id: label.id,
    x: label.x,
    y: label.y,
    text: label.text,
    color: label.color,
    fontSize: label.fontSize,
    locked: label.locked
  }));
}

export function createWorkspaceSnapshot() {
  return {
    app: "RichardCore.ConStruct",
    version: CURRENT_PROJECT_VERSION,
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
    gridMode: state.gridMode,

    nodes:
      serializeNodes(),

    connections:
      serializeConnections(),

    zones:
      serializeZones(),

    textLabels:
      serializeTextLabels()
  };
}

export function createHistorySnapshot() {
  return {
    nodes:
      serializeNodes(),

    connections:
      serializeConnections(),

    zones:
      serializeZones(),

    textLabels:
      serializeTextLabels()
  };
}

export function saveWorkspaceState() {
  const data =
    createWorkspaceSnapshot();

  if (!localAutosaveAvailable) {
    return;
}
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    localAutosaveAvailable =
      false;

    console.warn(
      "ConStruct local autosave disabled.",
      error
    );
  }
}

export function loadWorkspaceState() {
  const raw =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function restoreWorkspaceState(
  data,
  callbacks = {}
) {
  if (!data) {
    return;
  }

  const {
    createNode,
    createConnection,
    applyViewport,
    toggleGroupCollapse
  } = callbacks;

  if (typeof data.zoom === "number") {
    state.zoom = data.zoom;
  }

  if (typeof data.panX === "number") {
    state.panX = data.panX;
  }

  if (typeof data.panY === "number") {
    state.panY = data.panY;
  }

  if (
    ["dots", "lines", "none"].includes(
      data.gridMode
    )
  ) {
    state.gridMode = data.gridMode;
  }

  if (
    typeof applyViewport ===
    "function"
  ) {
    applyViewport();
  }

  if (
    Array.isArray(data.nodes) &&
    typeof createNode ===
      "function"
  ) {
    data.nodes.forEach(
      (savedNode) => {
        const node =
          createNode(
            0,
            0,
            {
              type:
                savedNode.type,

              skipCentering:
                true,

              skipSave:
                true
            }
          );

        if (!node) {
          return;
        }

        node.dataset.nodeId =
          String(savedNode.id);

        node.style.left =
          savedNode.left || "0px";

        node.style.top =
          savedNode.top || "0px";

        node.style.width =
          savedNode.width || "";

        node.style.height =
          savedNode.height || "";

        if (
          savedNode.color
        ) {
          node.style.borderColor =
            savedNode.color;

          node.style.setProperty(
            "--construct-node-port-color",
            savedNode.color
          );
        }

        const title =
          node.querySelector(
            ".construct-node-title"
          );

        const sideIndicator =
          node.querySelector(
            ".construct-node-side-indicator"
          );  

        if (title) {
          title.textContent =
            savedNode.title || "";
        }

        const text =
          node.querySelector(
            ".construct-node-text"
          );

        const currentSide =
          savedNode.currentSide || "A";

        if (sideIndicator) {
          sideIndicator.textContent =
            `${currentSide}`;

          sideIndicator.classList.remove(
            "side-a",
            "side-b"
          );

          sideIndicator.classList.add(
            currentSide === "B"
              ? "side-b"
              : "side-a"
          );
        }  

        const sides =
          structuredClone(
            savedNode.sides || {
              A: {
                text:
                  savedNode.text || "",

                image:
                  savedNode.image || ""
              },

              B: {
                text: "",
                image: ""
              }
            }
          );

        if (text) {
          text.textContent =
            (sides[currentSide]?.text || "")
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");
        }

        const imageContainer =
          node.querySelector(
            ".construct-node-image"
          ); 

        if (imageContainer) {
          const imageSrc =
            sides[currentSide]?.image || "";

          imageContainer
            .querySelectorAll("img")
            .forEach((img) => {
              img.remove();
            });

          imageContainer.classList.remove(
            "has-image"
          );

          if (imageSrc) {
            setImage(
              node,
              imageContainer,
              imageSrc
            );
          }
        }

        ["A", "B"].forEach((side) => {
          if (
            side === currentSide
          ) {
            return;
          }

          const imageSrc =
            sides[side]?.image || "";

          if (!imageSrc) {
            return;
          }

          const preloadContainer =
            document.createElement("div");

          setImage(
            node,
            preloadContainer,
            imageSrc
          );
        });

        const nodeData =
          state.nodes.find(
            (item) =>
              item.element === node
          );

        if (!nodeData) {
          return;
        }

        nodeData.id =
          savedNode.id;

        nodeData.currentSide =
          currentSide;

        nodeData.sides =
          sides;  

        nodeData.groupId =
          savedNode.groupId;

        nodeData.children =
          Array.isArray(
            savedNode.children
          )
            ? [
                ...savedNode.children
              ]
            : [];

        nodeData.isCollapsed =
          Boolean(
            savedNode.isCollapsed
          );
      }
    );
  }

  if (
    Array.isArray(data.nodes)
  ) {
    data.nodes.forEach(
      (savedNode) => {
        if (
          !savedNode.isCollapsed
        ) {
          return;
        }

        const groupElement =
          document.querySelector(
            `.construct-node[data-node-id="${savedNode.id}"]`
          );

        if (
          !groupElement
        ) {
          return;
        }

        const groupData =
          state.nodes.find(
            (node) =>
              node.id === savedNode.id
          );

        if (groupData) {
          groupData.isCollapsed = true;
        }

        groupElement.classList.add(
          "is-collapsed"
        );

        savedNode.children.forEach(
          (childId) => {
            const childData =
              state.nodes.find(
                (node) =>
                  node.id === childId
              );

            if (!childData?.element) {
              return;
            }

            childData.element.style.display =
              "none";
          }
        );
      }
    );
  }

  if (
    Array.isArray(data.zones)
  ) {

    data.zones.forEach(
      (savedZone) => {

        const zone =
          createZone({
            x: savedZone.x,
            y: savedZone.y,
            width: savedZone.width,
            height: savedZone.height,
            shape:
              savedZone.shape || "rect"
          });

        if (!zone) {
          return;
        }

        const zoneData =
          zone.__zoneData;

        if (!zoneData) {
          return;
        }

        zoneData.title =
          savedZone.title ||
          DEFAULT_ZONE_TITLE;

        zoneData.id =
          savedZone.id;

        zoneData.color =
          savedZone.color || "";

        zoneData.style =
          savedZone.style || "solid";

        zoneData.locked =
          Boolean(
            savedZone.locked
          );

        zone.dataset.locked =
          String(
            zoneData.locked
          );

        zone.style.setProperty(
          "--construct-zone-color",
          savedZone.color || ""
        );

        const titleElement =
          zone.querySelector(
            ".construct-zone-title"
          );

        if (titleElement) {
          titleElement.textContent =
            zoneData.title;
        }

        const rect =
          zone.__zoneRect;

        const innerRect =
          zone.__zoneRectInner;

        if (rect) {

          rect.removeAttribute(
            "stroke-dasharray"
          );

          if (
            savedZone.style ===
            "dashed"
          ) {
            rect.setAttribute(
              "stroke-dasharray",
              "16 8"
            );
          }

          if (
            savedZone.style ===
            "dotted"
          ) {
            rect.setAttribute(
              "stroke-dasharray",
              "4 8"
            );
          }

          if (
            savedZone.style ===
            "dashdot"
          ) {
            rect.setAttribute(
              "stroke-dasharray",
              "16 8 4 8"
            );
          }
        }

        if (
          savedZone.style ===
          "double" &&
          innerRect
        ) {
          innerRect.style.display =
            "block";
        }
      }
    );
  }

  if (
    Array.isArray(data.textLabels)
  ) {
    data.textLabels.forEach(
      (savedLabel) => {
        const label =
          createTextLabel({
            x: savedLabel.x,
            y: savedLabel.y,
            text: savedLabel.text,
            color: savedLabel.color,
            fontSize: savedLabel.fontSize,
            locked: savedLabel.locked
          });

        if (!label) {
          return;
        }

        const labelData =
          label.__textLabelData;

        if (!labelData) {
          return;
        }

        labelData.id =
          savedLabel.id;
      }
    );
  }

  if (
    Array.isArray(
      data.connections
    ) &&
    typeof createConnection ===
      "function"
  ) {
    data.connections.forEach(
      (savedConnection) => {
        const fromNode =
          document.querySelector(
            `.construct-node[data-node-id="${savedConnection.fromNodeId}"]`
          );

        const toNode =
          document.querySelector(
            `.construct-node[data-node-id="${savedConnection.toNodeId}"]`
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

        createConnection(
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

  const maxNodeId = state.nodes.reduce(
    (maxId, node) => {
      return Math.max(maxId, node.id);
    },
    0
  );

  state.nextNodeId = maxNodeId + 1;
}

export function setupWorkspaceAutoSave() {
  let saveTimeout =
    null;

  function scheduleSave() {
    clearTimeout(
      saveTimeout
    );

    saveTimeout =
      setTimeout(() => {
        saveWorkspaceState();
      }, 150);
  }

  window.addEventListener(
    "construct:workspace-changed",
    scheduleSave
  );

  window.addEventListener(
    "beforeunload",
    saveWorkspaceState
  );
}

export function clearWorkspaceState() {
  localStorage.removeItem(
    STORAGE_KEY
  );
}