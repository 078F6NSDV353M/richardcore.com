// import {
  
// } from "../hub.js";


const archivedNodeAssets =
  new Map();

export function registerArchivedNodeAssets(
  nodeId,
  images
) {
  if (
    !nodeId ||
    !Array.isArray(images)
  ) {
    return;
  }

  archivedNodeAssets.set(
    Number(nodeId),
    images
  );
}

export function getArchivedNodeAssets(nodeId) {
  return (
    archivedNodeAssets.get(
      Number(nodeId)
    ) || []
  );
}

export function clearArchivedNodeAssets(nodeId) {
  archivedNodeAssets.delete(
    Number(nodeId)
  );
}

export function clearAssetArchiveRegistry() {
  archivedNodeAssets.clear();
}

export function getArchivePathForImagePath(path) {
  if (
    typeof path !== "string" ||
    !path.startsWith("images/")
  ) {
    return "";
  }

  return path.replace(
    "images/",
    "_archive/images/"
  );
}