import {
  state,
  CONNECTION_POINT_SIZE,
  CONNECTION_POINT_BORDER,
  getConnectionsLayer,
  screenToWorld
} from "../hub.js";

const CONNECTION_DOT_RADIUS = (CONNECTION_POINT_SIZE - CONNECTION_POINT_BORDER) / 2;
const CONNECTION_LINE_WIDTH = 2;
const CONNECTION_HIT_WIDTH = 30;
const CONNECTION_DOT_STROKE_WIDTH = CONNECTION_POINT_BORDER;

let portPositionCache = new WeakMap();

export function getPortLocalPosition(portElement) {
  if (!portElement) {
    return { x: 0, y: 0 };
  }

  const cachedPosition =
    portPositionCache.get(portElement);

  if (cachedPosition) {
    return cachedPosition;
  }

  const stage = document.querySelector(".construct-stage");

  if (!stage) {
    return { x: 0, y: 0 };
  }

  const stageRect = stage.getBoundingClientRect();
  const portRect = portElement.getBoundingClientRect();

  const portCenterScreenX =
    (portRect.left - stageRect.left) +
    (portRect.width / 2);

  const portCenterScreenY =
    (portRect.top - stageRect.top) +
    (portRect.height / 2);

  const worldPosition = screenToWorld(
    portCenterScreenX,
    portCenterScreenY
  );

  portPositionCache.set(
    portElement,
    worldPosition
  );

  return worldPosition;
}

export function createLineElement(className) {
  const svg = getConnectionsLayer();
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }

  let arrow = defs.querySelector("#construct-connection-arrow");
  if (!arrow) {
    arrow = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    arrow.setAttribute("id", "construct-connection-arrow");
    arrow.setAttribute("markerWidth", "8");
    arrow.setAttribute("markerHeight", "8");
    arrow.setAttribute("refX", "16");
    arrow.setAttribute("refY", "3");
    arrow.setAttribute("orient", "auto-start-reverse");
    arrow.setAttribute("markerUnits", "strokeWidth");

    const pathArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathArrow.setAttribute("d", "M0,0 L6,3 L0,6 Z");
    pathArrow.setAttribute("fill", "currentColor");

    arrow.appendChild(pathArrow);
    defs.appendChild(arrow);
  }

  if (!svg) return null;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", className);
  // no marker, arrow is rendered separately
  svg.appendChild(path);

  return path;
}

export function createConnectionDotElement() {
  const svg = getConnectionsLayer();
  if (!svg) return null;

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  circle.setAttribute("class", "construct-connection-dot");
  circle.setAttribute("r", String(CONNECTION_DOT_RADIUS));
  circle.style.pointerEvents = "none";

  svg.appendChild(circle);

  return circle;
}

export function getPortDirection(portElement) {
  if (!portElement) {
    return { x: 1, y: 0 };
  }

  if (portElement.classList.contains("construct-node-port-top")) {
    return { x: 0, y: -1 };
  }

  if (portElement.classList.contains("construct-node-port-right")) {
    return { x: 1, y: 0 };
  }

  if (portElement.classList.contains("construct-node-port-bottom")) {
    return { x: 0, y: 1 };
  }

  return { x: -1, y: 0 };
}

export function getPreviewEndDirection(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }

  return dy >= 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
}

export function setPathPosition(path, startPort, endPort, x1, y1, x2, y2, typeOverride, orthogonalOffset = 0) {
  let d = "";
  const type = typeOverride || state.connectionType;

  const scaledX1 = x1;
  const scaledY1 = y1;
  const scaledX2 = x2;
  const scaledY2 = y2;

  if (type === "straight") {
    d = `M ${scaledX1} ${scaledY1} L ${scaledX2} ${scaledY2}`;
  }

  if (type === "bezier") {
    const startDirection = getPortDirection(startPort);
    const endDirection = endPort
      ? getPortDirection(endPort)
      : getPreviewEndDirection(scaledX1, scaledY1, scaledX2, scaledY2);

    const distanceX = Math.abs(scaledX2 - scaledX1);
    const distanceY = Math.abs(scaledY2 - scaledY1);
    const handleLength = Math.max(40, Math.min(160, (distanceX + distanceY) * 0.35));

    const c1x = scaledX1 + startDirection.x * handleLength;
    const c1y = scaledY1 + startDirection.y * handleLength;

    let c2x = 0;
    let c2y = 0;

    if (endPort) {
      c2x = scaledX2 + endDirection.x * handleLength;
      c2y = scaledY2 + endDirection.y * handleLength;
    } else {
      c2x = scaledX2 - endDirection.x * handleLength;
      c2y = scaledY2 - endDirection.y * handleLength;
    }

    d = `M ${scaledX1} ${scaledY1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${scaledX2} ${scaledY2}`;
  }

  if (type === "orthogonal") {
    const startDirection = getPortDirection(startPort);
    const endDirection = endPort
      ? getPortDirection(endPort)
      : getPreviewEndDirection(scaledX1, scaledY1, scaledX2, scaledY2);

    const startIsHorizontal = startDirection.x !== 0;
    const endIsHorizontal = endDirection.x !== 0;

    const cornerRadius = 16;
    const offset = orthogonalOffset;

    const clampRadius = (a, b) => {
      return Math.max(0, Math.min(cornerRadius, Math.abs(a) / 2, Math.abs(b) / 2));
    };

    if (startIsHorizontal === endIsHorizontal) {
      if (startIsHorizontal) {
        const midX = (scaledX1 + scaledX2) / 2;

        const lineY1 = scaledY1 + offset;
        const lineY2 = scaledY2 + offset;

        const dirX1 = midX > scaledX1 ? 1 : -1;
        const dirX2 = scaledX2 > midX ? 1 : -1;
        const dirY = lineY2 > lineY1 ? 1 : -1;

        const r1 = clampRadius(midX - scaledX1, lineY2 - lineY1);
        const r2 = clampRadius(scaledX2 - midX, lineY2 - lineY1);

        d = `
          M ${scaledX1} ${lineY1}
          L ${midX - dirX1 * r1} ${lineY1}
          Q ${midX} ${lineY1} ${midX} ${lineY1 + dirY * r1}
          L ${midX} ${lineY2 - dirY * r2}
          Q ${midX} ${lineY2} ${midX + dirX2 * r2} ${lineY2}
          L ${scaledX2} ${lineY2}
        `;
      } else {
        const midY = (scaledY1 + scaledY2) / 2;

        const lineX1 = scaledX1 + offset;
        const lineX2 = scaledX2 + offset;

        const dirY1 = midY > scaledY1 ? 1 : -1;
        const dirY2 = scaledY2 > midY ? 1 : -1;
        const dirX = lineX2 > lineX1 ? 1 : -1;

        const r1 = clampRadius(lineX2 - lineX1, midY - scaledY1);
        const r2 = clampRadius(lineX2 - lineX1, scaledY2 - midY);

        d = `
          M ${lineX1} ${scaledY1}
          L ${lineX1} ${midY - dirY1 * r1}
          Q ${lineX1} ${midY} ${lineX1 + dirX * r1} ${midY}
          L ${lineX2 - dirX * r2} ${midY}
          Q ${lineX2} ${midY} ${lineX2} ${midY + dirY2 * r2}
          L ${lineX2} ${scaledY2}
        `;
      }
    } else {
      if (startIsHorizontal) {
        const lineY1 = scaledY1 + offset;
        const lineY2 = scaledY2 + offset;

        const dirX = scaledX2 > scaledX1 ? 1 : -1;
        const dirY = lineY2 > lineY1 ? 1 : -1;
        const r = clampRadius(scaledX2 - scaledX1, lineY2 - lineY1);

        d = `
          M ${scaledX1} ${lineY1}
          L ${scaledX2 - dirX * r} ${lineY1}
          Q ${scaledX2} ${lineY1} ${scaledX2} ${lineY1 + dirY * r}
          L ${scaledX2} ${lineY2}
        `;
      } else {
        const lineX1 = scaledX1 + offset;
        const lineX2 = scaledX2 + offset;

        const dirX = lineX2 > lineX1 ? 1 : -1;
        const dirY = scaledY2 > scaledY1 ? 1 : -1;
        const r = clampRadius(lineX2 - lineX1, scaledY2 - scaledY1);

        d = `
          M ${lineX1} ${scaledY1}
          L ${lineX1} ${scaledY2 - dirY * r}
          Q ${lineX1} ${scaledY2} ${lineX1 + dirX * r} ${scaledY2}
          L ${lineX2} ${scaledY2}
        `;
      }
    }
  }

  path.setAttribute("d", d);
}

export function offsetPoint(x1, y1, x2, y2, offset) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  const nx = -dy / length;
  const ny = dx / length;

  return {
    x1: x1 + nx * offset,
    y1: y1 + ny * offset,
    x2: x2 + nx * offset,
    y2: y2 + ny * offset
  };
}

export function startConnection(portElement) {
  const start = getPortLocalPosition(portElement);
  const previewLine = createLineElement("construct-connection-preview");

  if (!previewLine) return;

  state.connectingPort = portElement;
  state.previewLine = previewLine;

  setPathPosition(
    previewLine,
    portElement,
    null,
    start.x,
    start.y,
    start.x,
    start.y
  );
}

export function setConnectionType(type) {
  state.connectionType = type;
  updateAllConnections();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function updateConnectionPreview(screenX, screenY) {
  if (!state.connectingPort || !state.previewLine) return;

  const start = getPortLocalPosition(state.connectingPort);
  const end = screenToWorld(screenX, screenY);

  setPathPosition(
    state.previewLine,
    state.connectingPort,
    null,
    start.x,
    start.y,
    end.x,
    end.y
  );
}

export function getNodeColorFromPort(portElement) {
  const nodeElement =
    portElement?.closest(".construct-node");

  if (!nodeElement) {
    return "";
  }

  return (
    nodeElement.style.borderColor ||
    getComputedStyle(nodeElement)
      .getPropertyValue("--construct-node-port-color")
      .trim() ||
    ""
  );
}

export function applyConnectionStyles(path, connection) {
  if (!path) return;

  // color
  if (connection.color) {
    path.style.stroke = connection.color;
  } else {
    path.style.stroke = "";
  }

  // style
  if (connection.style === "dashed") {
    path.setAttribute("stroke-dasharray", "16 8");
  } else if (connection.style === "dotted") {
    path.setAttribute("stroke-dasharray", "4 8");
  } else if (connection.style === "dashdot") {
    path.setAttribute("stroke-dasharray", "16 8 4 8");
  } else {
    path.removeAttribute("stroke-dasharray");
  }
}

export function getBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      (mt2 * mt * p0.x) +
      (3 * mt2 * t * p1.x) +
      (3 * mt * t2 * p2.x) +
      (t2 * t * p3.x),
    y:
      (mt2 * mt * p0.y) +
      (3 * mt2 * t * p1.y) +
      (3 * mt * t2 * p2.y) +
      (t2 * t * p3.y)
  };
}

export function getBezierTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;

  return {
    x:
      (3 * mt * mt * (p1.x - p0.x)) +
      (6 * mt * t * (p2.x - p1.x)) +
      (3 * t * t * (p3.x - p2.x)),
    y:
      (3 * mt * mt * (p1.y - p0.y)) +
      (6 * mt * t * (p2.y - p1.y)) +
      (3 * t * t * (p3.y - p2.y))
  };
}

export function getNodeDataFromPort(portElement) {
  const nodeElement = portElement?.closest(".construct-node");
  const nodeId = Number(nodeElement?.dataset.nodeId);

  if (!nodeId) return null;

  return state.nodes.find((node) => node.id === nodeId) || null;
}

export function getCollapsedParentGroup(portElement) {
  const nodeData = getNodeDataFromPort(portElement);

  if (!nodeData || nodeData.groupId === null) {
    return null;
  }

  const groupData = state.nodes.find((node) => node.id === nodeData.groupId);

  if (!groupData || groupData.type !== "group") {
    return null;
  }

  if (!groupData.isCollapsed) {
    return null;
  }

  return groupData;
}

export function getProxyPortSide(originalPort) {
  if (originalPort.classList.contains("construct-node-port-top")) {
    return "top";
  }

  if (originalPort.classList.contains("construct-node-port-right")) {
    return "right";
  }

  if (originalPort.classList.contains("construct-node-port-bottom")) {
    return "bottom";
  }

  return "left";
}

export function getOrCreateProxyPort(groupData, side, connectionIndex, totalConnections) {
  const groupElement = groupData?.element;
  if (!groupElement) return null;

  let proxyContainer = groupElement.querySelector(
    `.construct-group-proxy-container-${side}`
  );

  if (!proxyContainer) {
    proxyContainer = document.createElement("div");

    proxyContainer.className =
      `construct-group-proxy-container construct-group-proxy-container-${side}`;

    groupElement.appendChild(proxyContainer);
  }

  let proxyPort = proxyContainer.querySelector(
    `[data-proxy-index="${connectionIndex}"]`
  );

  if (!proxyPort) {
    proxyPort = document.createElement("div");

    proxyPort.className =
      `construct-node-port construct-group-proxy-port construct-node-port-${side}`;

    proxyPort.dataset.proxyIndex = connectionIndex;

    proxyContainer.appendChild(proxyPort);
  }

  const spread = 32;
  const centerOffset = ((totalConnections - 1) * spread) / 2;
  const offset = (connectionIndex * spread) - centerOffset;

  if (side === "top" || side === "bottom") {
    proxyPort.style.left = `calc(50% + ${offset}px)`;
    proxyPort.style.top = "";
  } else {
    proxyPort.style.top = `calc(50% + ${offset}px)`;
    proxyPort.style.left = "";
  }

  return proxyPort;
}

export function getConnectionEndpointSortValue(connection, endpointKey, side) {
  const endpoint = connection[endpointKey];
  const nodeElement = endpoint?.closest(".construct-node");

  if (!endpoint || !nodeElement) return 0;

  const nodeX = parseFloat(nodeElement.style.left) || 0;
  const nodeY = parseFloat(nodeElement.style.top) || 0;

  const portLeft = parseFloat(endpoint.style.left) || 0;
  const portTop = parseFloat(endpoint.style.top) || 0;

  if (side === "top" || side === "bottom") {
    return nodeX + portLeft;
  }

  return nodeY + portTop;
}

export function getVisibleConnectionPort(portElement, connection, endpointKey) {
  const collapsedGroup = getCollapsedParentGroup(portElement);

  if (!collapsedGroup) {
    return portElement;
  }

  const side = getProxyPortSide(portElement);

  const matchingConnections = state.connections
    .filter((item) => {
      if (shouldHideConnection(item)) return false;

      const endpoint = item[endpointKey];
      const endpointGroup = getCollapsedParentGroup(endpoint);

      if (!endpointGroup || endpointGroup.id !== collapsedGroup.id) {
        return false;
      }

      return getProxyPortSide(endpoint) === side;
    })
    .sort((a, b) => {
      return (
        getConnectionEndpointSortValue(a, endpointKey, side) -
        getConnectionEndpointSortValue(b, endpointKey, side)
      );
    });

  const connectionIndex = matchingConnections.indexOf(connection);
  const totalConnections = matchingConnections.length;

  return getOrCreateProxyPort(
    collapsedGroup,
    side,
    Math.max(0, connectionIndex),
    Math.max(1, totalConnections)
  );
}

export function shouldHideConnection(connection) {
  const fromGroup = getCollapsedParentGroup(connection.from);
  const toGroup = getCollapsedParentGroup(connection.to);

  return (
    fromGroup &&
    toGroup &&
    fromGroup.id === toGroup.id
  );
}

export function setConnectionVisible(connection, isVisible) {
  const display = isVisible ? "" : "none";

  connection.line.style.display = display;
  connection.hitLine.style.display = display;
  connection.arrow.style.display = display;

  if (connection.line2) {
    connection.line2.style.display = isVisible && connection.style === "double"
      ? "block"
      : "none";
  }
}

export function updateSingleConnection(connection) {
  if (shouldHideConnection(connection)) {
    setConnectionVisible(connection, false);
    return;
  }

  setConnectionVisible(connection, true);

  const visibleFrom = getVisibleConnectionPort(
    connection.from,
    connection,
    "from"
  );

  const visibleTo = getVisibleConnectionPort(
    connection.to,
    connection,
    "to"
  );

  const start = getPortLocalPosition(visibleFrom);
  const end = getPortLocalPosition(visibleTo);

  connection.startDot.setAttribute("cx", String(start.x));
  connection.startDot.setAttribute("cy", String(start.y));

  connection.endDot.setAttribute("cx", String(end.x));
  connection.endDot.setAttribute("cy", String(end.y));

  connection.line.style.strokeWidth =
    `${CONNECTION_LINE_WIDTH}px`;

  connection.hitLine.style.strokeWidth =
    `${CONNECTION_HIT_WIDTH}px`;

  if (connection.line2) {
    connection.line2.style.strokeWidth =
      `${CONNECTION_LINE_WIDTH}px`;
  }

  connection.startDot.setAttribute(
    "r",
    String(CONNECTION_DOT_RADIUS)
  );

  connection.endDot.setAttribute(
    "r",
    String(CONNECTION_DOT_RADIUS)
  );

  connection.startDot.style.strokeWidth =
    `${CONNECTION_DOT_STROKE_WIDTH}px`;

  connection.endDot.style.strokeWidth =
    `${CONNECTION_DOT_STROKE_WIDTH}px`;

  const fromNodeColor =
    getNodeColorFromPort(connection.from);

  const toNodeColor =
    getNodeColorFromPort(connection.to);

  connection.startDot.style.stroke =
    fromNodeColor || "";

  connection.endDot.style.stroke =
    toNodeColor || "";  

  if (connection.style === "double") {
    const outerStrokeWidth =
      CONNECTION_LINE_WIDTH * 3;

    const innerStrokeWidth =
      CONNECTION_LINE_WIDTH;

    setPathPosition(
      connection.line,
      visibleFrom,
      visibleTo,
      start.x,
      start.y,
      end.x,
      end.y,
      connection.type
    );

    setPathPosition(
      connection.line2,
      visibleFrom,
      visibleTo,
      start.x,
      start.y,
      end.x,
      end.y,
      connection.type
    );

    connection.line.style.strokeWidth =
      `${outerStrokeWidth}px`;

    connection.line2.style.strokeWidth =
      `${innerStrokeWidth}px`;

    connection.line2.style.stroke =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--construct-bg-stage")
        .trim();

    connection.line2.removeAttribute("stroke-dasharray");

    connection.line2.style.display = "block";
  } else {
    setPathPosition(
      connection.line,
      visibleFrom,
      visibleTo,
      start.x,
      start.y,
      end.x,
      end.y,
      connection.type
    );

    connection.line2.style.display = "none";
  }

  setPathPosition(
    connection.hitLine,
    visibleFrom,
    visibleTo,
    start.x,
    start.y,
    end.x,
    end.y,
    connection.type
  );

  applyConnectionStyles(connection.line, connection);

  if (connection.style !== "double") {
    applyConnectionStyles(connection.line2, connection);
  }

  if (
    connection.type === "straight" ||
    connection.type === "bezier" ||
    connection.type === "orthogonal"
  ) {
    const arrowPath = connection.line;
    const totalLength = arrowPath.getTotalLength();

    if (totalLength > 1) {
      const TIP_OFFSET_PX = 45;
      const TAIL_OFFSET_PX = 65;
      const WIDTH_PX = 24;

      const tipOffset = TIP_OFFSET_PX;
      const tailOffset = TAIL_OFFSET_PX;

      const tipLength = Math.max(0, totalLength - tipOffset);
      const tailLength = Math.max(0, totalLength - tailOffset);

      const tip = arrowPath.getPointAtLength(tipLength);
      const tail = arrowPath.getPointAtLength(tailLength);

      let arrowTip = tip;
      let arrowTail = tail;

      if (connection.style === "double" && connection.line2) {
        const arrowPath2 = connection.line2;
        const totalLength2 = arrowPath2.getTotalLength();

        if (totalLength2 > 1) {
          const tipLength2 = Math.max(0, totalLength2 - tipOffset);
          const tailLength2 = Math.max(0, totalLength2 - tailOffset);

          const tip2 = arrowPath2.getPointAtLength(tipLength2);
          const tail2 = arrowPath2.getPointAtLength(tailLength2);

          arrowTip = {
            x: (tip.x + tip2.x) / 2,
            y: (tip.y + tip2.y) / 2
          };

          arrowTail = {
            x: (tail.x + tail2.x) / 2,
            y: (tail.y + tail2.y) / 2
          };
        }
      }

      const angle = Math.atan2(
        arrowTip.y - arrowTail.y,
        arrowTip.x - arrowTail.x
      );

      const width = WIDTH_PX;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const pA = {
        x: arrowTip.x,
        y: arrowTip.y
      };

      const pTail = {
        x: arrowTail.x,
        y: arrowTail.y
      };

      const pB = {
        x: pTail.x - sin * (width / 2),
        y: pTail.y + cos * (width / 2)
      };

      const pC = {
        x: pTail.x + sin * (width / 2),
        y: pTail.y - cos * (width / 2)
      };

      const d = `
        M ${pA.x} ${pA.y}
        L ${pB.x} ${pB.y}
        L ${pC.x} ${pC.y}
        Z
      `;

      connection.arrow.setAttribute("d", d);
      connection.arrow.style.fill = connection.color || "";
      connection.arrow.style.display = "block";
    } else {
      connection.arrow.style.display = "none";
    }
  } else {
    connection.arrow.style.display = "none";
  }
}

export function updateNodeConnections(nodeElement) {
  if (!nodeElement) return;
  portPositionCache = new WeakMap();

  const nodeId = Number(nodeElement.dataset.nodeId);

  state.connections.forEach((connection) => {
    const fromNode =
      connection.from?.closest(".construct-node");

    const toNode =
      connection.to?.closest(".construct-node");

    const fromId = Number(fromNode?.dataset.nodeId);
    const toId = Number(toNode?.dataset.nodeId);

    if (fromId === nodeId || toId === nodeId) {
      updateSingleConnection(connection);
    }
  });
}

export function updateAllConnections() {
  portPositionCache = new WeakMap();

  state.connections.forEach((connection) => {
    updateSingleConnection(connection);
  });
}

export function createConnectionFromPorts(fromPort, toPort, options = {}) {
  if (!fromPort || !toPort || fromPort === toPort) {
    return null;
  }

  const line = createLineElement("construct-connection-line");
  const line2 = createLineElement("construct-connection-line");
  const hitLine = createLineElement("construct-connection-hit-area");
  const arrow = createLineElement("construct-connection-arrow");
  const startDot = createConnectionDotElement();
  const endDot = createConnectionDotElement();

  if (!line || !line2 || !hitLine || !arrow || !startDot || !endDot) {
    return null;
  }

  const defaultConnectionColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--construct-connection-default")
      .trim();

  const connection = {
    from: fromPort,
    to: toPort,

    line,
    line2,
    hitLine,
    arrow,

    startDot,
    endDot,

    type: options.type || state.connectionType,
    style: options.style || "solid",
    color: options.color || defaultConnectionColor
  };

  line.__connection = connection;
  line2.__connection = connection;
  hitLine.__connection = connection;
  arrow.__connection = connection;
  startDot.__connection = connection;
  endDot.__connection = connection;

  hitLine.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    removeConnection(connection);
  });

  line2.style.display = "none";
  arrow.style.pointerEvents = "none";

  state.connections.push(connection);

  updateAllConnections();

  if (!options.skipSave) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }

  return connection;
}

export function finishConnection(targetPort) {
  if (!state.connectingPort || !state.previewLine) return;

  if (!targetPort || targetPort === state.connectingPort) {
    cancelConnection();
    return;
  }

  const line = createLineElement("construct-connection-line");
  const line2 = createLineElement("construct-connection-line");
  const hitLine = createLineElement("construct-connection-hit-area");
  const arrow = createLineElement("construct-connection-arrow");
  const startDot = createConnectionDotElement();
  const endDot = createConnectionDotElement();

  if (!line || !line2 || !hitLine || !startDot || !endDot) return;

  const defaultConnectionColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--construct-connection-default")
    .trim();

  const connection = {
    from: state.connectingPort,
    to: targetPort,

    line,
    line2,
    hitLine,
    arrow,

    startDot,
    endDot,

    type: state.connectionType,
    style: "solid",
    color: defaultConnectionColor
  };

  line.__connection = connection;
  line2.__connection = connection;
  hitLine.__connection = connection;
    hitLine.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    removeConnection(connection);
  });
  arrow.__connection = connection;
  startDot.__connection = connection;
  endDot.__connection = connection;

  line2.style.display = "none";
  arrow.style.pointerEvents = "none";

  state.connections.push(connection);

  state.previewLine.remove();
  state.previewLine = null;
  state.connectingPort = null;

  updateAllConnections();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function cancelConnection() {
  if (state.previewLine) {
    state.previewLine.remove();
  }

  state.previewLine = null;
  state.connectingPort = null;
}

export function removeConnection(
  connection,
  options = {}
) {
  if (!connection) return;

  if (connection.line) connection.line.remove();
  if (connection.line2) connection.line2.remove();
  if (connection.hitLine) connection.hitLine.remove();
  if (connection.arrow) connection.arrow.remove();
  if (connection.startDot) connection.startDot.remove();
  if (connection.endDot) connection.endDot.remove();

  state.connections = state.connections.filter(
    (c) => c !== connection
  );

  if (!options.skipSave) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }
}