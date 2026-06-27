import {
  state,
  getConnectionsLayer,
  getZonesLayer,
  applyTransform,
  updateAllConnections,
  createConnectionFromPorts,
  restoreWorkspaceState,
  createWorkspaceSnapshot
} from "../hub.js";


export function preserveImagesInSnapshot(snapshot) {
  if (
    !snapshot ||
    !Array.isArray(snapshot.nodes)
  ) {
    return snapshot;
  }

  const imageMap =
    new Map();

  const workspaceSnapshot =
    createWorkspaceSnapshot();

  if (
    Array.isArray(workspaceSnapshot.nodes)
  ) {
    workspaceSnapshot.nodes.forEach((node) => {
      if (node.image) {
        imageMap.set(
          node.id,
          node.image
        );
      }
    });
  }

  snapshot.nodes.forEach((node) => {
    if (
      !node.image &&
      imageMap.has(node.id)
    ) {
      node.image =
        imageMap.get(node.id);
    }
  });

  return snapshot;
}

export function createWorkspaceRestore({
  createNode
}) {
  return (snapshot) => {
    const nodesLayer =
      document.querySelector(
        ".construct-nodes"
      );

    const connectionsLayer =
      getConnectionsLayer();

    const zonesLayer =
      getZonesLayer();

    const textLabelsLayer =
      document.querySelector(
        ".construct-text-labels"
      );  

    if (nodesLayer) {
      nodesLayer.innerHTML = "";
    }

    if (connectionsLayer) {
      connectionsLayer.innerHTML = "";
    }

    if (zonesLayer) {
      zonesLayer.innerHTML = "";
    }

    if (textLabelsLayer) {
      textLabelsLayer.innerHTML = "";
    }

    state.nodes = [];
    state.connections = [];
    state.zones = [];
    state.textLabels = [];

    restoreWorkspaceState(
      preserveImagesInSnapshot(snapshot),
      {
        createNode,

        createConnection:
          createConnectionFromPorts,

        applyViewport:
          applyTransform,
      }
    );

    applyTransform();
    updateAllConnections();
  };
}