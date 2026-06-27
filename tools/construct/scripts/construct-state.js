// import {

// } from "../hub.js";

export const BASE_GRID_SIZE = 100;
export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 80;
export const CONNECTION_POINT_SIZE = 14;
export const CONNECTION_POINT_BORDER = 2;

export const state = {
  gridMode: "dots",  

  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  isSpacePressed: false,
  startX: 0,
  startY: 0,
  nextNodeId: 1,

  draggingNode: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  dragFrame: null,

  connectingPort: null,
  previewLine: null,
  connections: [],
  zones: [],
  textLabels: [],
  connectionType: "bezier",

  nodes: [],
  nodeClipboard: null,

  selectionBox: null,
  selectionStartX: 0,
  selectionStartY: 0
};

window.state = state;