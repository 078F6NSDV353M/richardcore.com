import {
  state,
  getZonesLayer,
  updateNodeConnections,
  closeAllContextMenus,
  startDragSelection,
  selectObject
} from "../hub.js";

export const DEFAULT_ZONE_TITLE = "Zone title";

export function createZone({
  x = 0,
  y = 0,
  width = 400,
  height = 250,
  shape = "rect"
} = {}) {

  const zonesLayer =
    getZonesLayer();

  if (!zonesLayer) {
    return null;
  }

  const zone =
    document.createElement("div");

  const zoneData = {
    id: crypto.randomUUID(),
    title: DEFAULT_ZONE_TITLE,
    x,
    y,
    width,
    height,
    color: "",
    style: "solid",
    shape,
    locked: false,
    isEditingTitle: false,
    element: zone
  };

  zone.dataset.locked =
    "false";

  zone.className =
    "construct-zone";
  const zoneSvg =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

  zoneSvg.classList.add(
    "construct-zone-svg"
  );

  const zoneRect =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );

  zoneRect.classList.add(
    "construct-zone-rect"
  );

  zoneSvg.appendChild(
    zoneRect
  );

  const zoneRectInner =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );

  zoneRectInner.classList.add(
    "construct-zone-rect-inner"
  );

  zoneSvg.appendChild(
    zoneRectInner
  );

  zone.appendChild(
    zoneSvg
  );

  zone.__zoneRect =
    zoneRect;

  zone.__zoneRectInner =
    zoneRectInner;
    
  zone.__zoneData =
    zoneData;

  applyZoneShapeToElement(
    zone,
    zoneData.shape
  );

  const title =
    document.createElement("div");

  title.className =
    "construct-zone-title";

  title.textContent =
    zoneData.title || DEFAULT_ZONE_TITLE;

  title.spellcheck =
    false;

  zone.appendChild(
    title
  );

  setupZoneTitle(
    title,
    zoneData
  );  

  zone.style.left =
    `${x}px`;

  zone.style.top =
    `${y}px`;

  zone.style.width =
    `${width}px`;

  zone.style.height =
    `${height}px`;

  [
    "tl",
    "tr",
    "br",
    "bl"
  ].forEach((corner) => {
    const handle =
      document.createElement("div");

    handle.className =
      `construct-zone-corner construct-zone-corner-${corner}`;

    handle.dataset.corner =
      corner;

    const handleSvg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    handleSvg.setAttribute(
      "viewBox",
      "0 0 20 20"
    );

    const handlePath =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

    const pathMap = {
      tl: "M18 2 Q2 2 2 18",
      tr: "M2 2 Q18 2 18 18",
      br: "M18 2 Q18 18 2 18",
      bl: "M2 2 Q2 18 18 18"
    };

    handlePath.setAttribute(
      "d",
      pathMap[corner]
    );

    handleSvg.appendChild(
      handlePath
    );

    handle.appendChild(
      handleSvg
    );

    zone.appendChild(
      handle
    );
  });

  zone.addEventListener(
    "mousedown",
    (event) => {

      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const corner =
        event.target.closest(
          ".construct-zone-corner"
        );

      closeAllContextMenus();  

      selectObject(
        zone,
        event
      );

      if (corner) {
        startZoneResize(
          event,
          zone,
          corner.dataset.corner,
          zoneData
        );

        return;
      }

      startDragSelection(
        event,
        zone
      );
    }
  );

  zonesLayer.appendChild(
    zone
  );

  state.zones.push(
    zoneData
  );

  return zone;
}

export function startZoneDrag(
  event,
  zone,
  zoneData
) {
  if (
    zoneData.isEditingTitle
  ) {
    return;
  }

  if (zoneData.locked) {
    return;
  }

  const selectedNodes =
    [
      ...document.querySelectorAll(
        ".construct-node.is-selected"
      )
    ];

  const selectedZones =
    [
      ...document.querySelectorAll(
        ".construct-zone.is-selected"
      )
    ];

  const unlockedSelectedZones =
    selectedZones.filter((selectedZone) => {
      const selectedZoneData =
        selectedZone.__zoneData;

      if (
        selectedZoneData &&
        selectedZoneData.locked
      ) {
        selectedZone.classList.remove(
          "is-selected"
        );

        return false;
      }

      return Boolean(
        selectedZoneData
      );
    });

  const dragItems =
    zone.classList.contains("is-selected")
      ? [
          ...selectedNodes,
          ...unlockedSelectedZones
        ]
      : [zone];

  const startX =
    event.clientX;

  const startY =
    event.clientY;

  const startItems =
    dragItems.map((element) => ({
      element,
      startLeft:
        parseFloat(element.style.left) || 0,
      startTop:
        parseFloat(element.style.top) || 0
    }));

  function handleMouseMove(
    moveEvent
  ) {

    const deltaX =
      (moveEvent.clientX - startX) /
      state.zoom;

    const deltaY =
      (moveEvent.clientY - startY) /
      state.zoom;

    startItems.forEach((item) => {
      item.element.style.left =
        `${Math.round(
          item.startLeft + deltaX
        )}px`;

      item.element.style.top =
        `${Math.round(
          item.startTop + deltaY
        )}px`;

      if (
        item.element.classList.contains(
          "construct-zone"
        )
      ) {
        const itemZoneData =
          item.element.__zoneData;

        if (itemZoneData) {
          itemZoneData.x =
            parseFloat(
              item.element.style.left
            );

          itemZoneData.y =
            parseFloat(
              item.element.style.top
            );
        }
      }
    });

    startItems.forEach((item) => {
      if (
        item.element.classList.contains(
          "construct-node"
        )
      ) {
        updateNodeConnections(
          item.element
        );
      }
    });
  }

  function handleMouseUp() {
    window.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    window.removeEventListener(
      "mouseup",
      handleMouseUp
    );

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "mouseup",
    handleMouseUp
  );

  event.stopPropagation();
}

export function startZoneResize(
  event,
  zone,
  corner,
  zoneData
) {
  if (zoneData.locked) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const startX =
    event.clientX;

  const startY =
    event.clientY;

  const startLeft =
    parseFloat(
      zone.style.left
    ) || 0;

  const startTop =
    parseFloat(
      zone.style.top
    ) || 0;

  const startWidth =
    zone.offsetWidth;

  const startHeight =
    zone.offsetHeight;

  const minWidth =
    100;

  const minHeight =
    60;

  function handleMouseMove(
    moveEvent
  ) {

    const deltaX =
      (moveEvent.clientX - startX) /
      state.zoom;

    const deltaY =
      (moveEvent.clientY - startY) /
      state.zoom;

    let nextLeft =
      startLeft;

    let nextTop =
      startTop;

    let nextWidth =
      startWidth;

    let nextHeight =
      startHeight;

    if (corner.includes("r")) {
      nextWidth =
        startWidth + deltaX;
    }

    if (corner.includes("l")) {
      nextWidth =
        startWidth - deltaX;

      nextLeft =
        startLeft + deltaX;
    }

    if (corner.includes("b")) {
      nextHeight =
        startHeight + deltaY;
    }

    if (corner.includes("t")) {
      nextHeight =
        startHeight - deltaY;

      nextTop =
        startTop + deltaY;
    }

    if (nextWidth < minWidth) {
      nextWidth = minWidth;

      if (corner.includes("l")) {
        nextLeft =
          startLeft +
          startWidth -
          minWidth;
      }
    }

    if (nextHeight < minHeight) {
      nextHeight = minHeight;

      if (corner.includes("t")) {
        nextTop =
          startTop +
          startHeight -
          minHeight;
      }
    }

    if (zoneData.shape === "circle") {
      const nextSize =
        Math.max(
          nextWidth,
          nextHeight,
          minWidth,
          minHeight
        );

      if (corner.includes("l")) {
        nextLeft =
          startLeft +
          startWidth -
          nextSize;
      }

      if (corner.includes("t")) {
        nextTop =
          startTop +
          startHeight -
          nextSize;
      }

      nextWidth =
        nextSize;

      nextHeight =
        nextSize;
    }

    zone.style.left =
      `${Math.round(nextLeft)}px`;

    zone.style.top =
      `${Math.round(nextTop)}px`;

    zone.style.width =
      `${Math.round(nextWidth)}px`;

    zone.style.height =
      `${Math.round(nextHeight)}px`;

    zoneData.x =
      parseFloat(zone.style.left);

    zoneData.y =
      parseFloat(zone.style.top);

    zoneData.width =
      parseFloat(zone.style.width);

    zoneData.height =
      parseFloat(zone.style.height);  
  }

  function handleMouseUp() {
    window.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    window.removeEventListener(
      "mouseup",
      handleMouseUp
    );

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "mouseup",
    handleMouseUp
  );
}

export function applyZoneShapeToSvg(
  zone,
  shape
) {
  const rect =
    zone.__zoneRect;

  const innerRect =
    zone.__zoneRectInner;

  if (!rect) {
    return;
  }

  const radius =
    shape === "circle"
      ? "9999"
      : "0";

  rect.setAttribute(
    "rx",
    radius
  );

  rect.setAttribute(
    "ry",
    radius
  );

  if (innerRect) {
    innerRect.setAttribute(
      "rx",
      radius
    );

    innerRect.setAttribute(
      "ry",
      radius
    );
  }
}

export function applyZoneShapeToElement(
  zone,
  shape
) {
  const rect =
    zone.__zoneRect;

  const innerRect =
    zone.__zoneRectInner;

  zone.dataset.shape =
    shape;

  zone.classList.toggle(
    "is-circle",
    shape === "circle"
  );

  const radius =
    shape === "circle"
      ? "50%"
      : "0";

  zone.style.borderRadius =
    radius;

  if (rect) {
    rect.setAttribute(
      "rx",
      shape === "circle" ? "50%" : "0"
    );

    rect.setAttribute(
      "ry",
      shape === "circle" ? "50%" : "0"
    );
  }

  if (innerRect) {
    innerRect.setAttribute(
      "rx",
      shape === "circle" ? "50%" : "0"
    );

    innerRect.setAttribute(
      "ry",
      shape === "circle" ? "50%" : "0"
    );
  }
}

export function getSelectedZone() {
  return document.querySelector(
    ".construct-zone.is-selected"
  );
}

export function deleteSelectedZone() {

  const zones =
    [
      ...document.querySelectorAll(
        ".construct-zone.is-selected"
      )
    ];

  if (zones.length === 0) {
    return;
  }

  const zoneDataSet =
    new Set(
      zones.map((zone) => zone.__zoneData)
    );

  zones.forEach((zone) => {
    zone.remove();
  });

  state.zones =
    state.zones.filter(
      (zoneData) =>
        !zoneDataSet.has(zoneData)
    );

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function toggleZoneLock(
  zone
) {

  if (!zone) {
    return;
  }

  const zoneData =
    zone.__zoneData;

  if (!zoneData) {
    return;
  }

  zoneData.locked =
    !zoneData.locked;

  zone.dataset.locked =
    String(
      zoneData.locked
    );

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function clearZoneSelection() {
  document
    .querySelectorAll(
      ".construct-zone.is-selected"
    )
    .forEach((zone) => {
      zone.classList.remove(
        "is-selected"
      );
    });
}

export function initZoneSelection() {
  window.addEventListener(
    "mousedown",
    (event) => {
      if (event.button === 2) {
        return;
      }

      const clickedZone =
        event.target.closest(
          ".construct-zone"
        );

      const clickedZoneTitle =
        event.target.closest(
          ".construct-zone-title"
        );

      if (
        clickedZone &&
        !clickedZoneTitle
      ) {
        return;
      }

            if (
        event.target.closest(
          ".construct-text-label"
        )
      ) {
        return;
      }

      if (
        event.target.closest(
          ".construct-node, " +
          ".construct-text-label"
        )
      ) {
        return;
      }

      if (
        event.target.closest(
          ".construct-connection-line, " +
          ".construct-connection-hit-area, " +
          ".construct-connection-menu, " +
          ".construct-connection-floating-submenu"
        )
      ) {
        clearZoneSelection();
        return;
      }

      if (
        event.target.closest(
          ".construct-node-context-menu"
        )
      ) {
        clearZoneSelection();
        return;
      }

      if (
        event.target.closest(
          ".construct-zone-menu"
        )
      ) {
        return;
      }

      if (
        event.target.closest(
          ".construct-multiselect-menu"
        )
      ) {
        return;
      }

      clearZoneSelection();
    },
    true
  );
}

export function setupZoneTitle(
  title,
  zoneData
) {
  const MAX_ZONE_TITLE_CHARS =
    30;

  title.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    }
  );

  title.addEventListener(
    "pointerdown",
    (event) => {
      event.stopPropagation();
    }
  );

  title.addEventListener(
    "dragstart",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    }
  );

  title.addEventListener(
    "selectstart",
    (event) => {
      event.stopPropagation();
    }
  );  

  title.addEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      title.contentEditable =
        "true";

      title.classList.add(
        "is-editing"
      );

      title.focus();

      const range =
        document.createRange();

      range.selectNodeContents(
        title
      );

      range.collapse(
        false
      );

      const selection =
        window.getSelection();

      selection.removeAllRanges();

      selection.addRange(
        range
      );

      zoneData.isEditingTitle =
        true;
    }
  );

  title.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {
        event.preventDefault();
        title.blur();
        return;
      }

      const isControlKey =
        event.ctrlKey ||
        event.metaKey ||
        event.altKey;

      if (isControlKey) {
        return;
      }

      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Tab"
      ];

      if (
        allowedKeys.includes(
          event.key
        )
      ) {
        return;
      }

      const selection =
        window.getSelection();

      const selectedText =
        selection?.toString() || "";

      const selectedLength =
        title.contains(
          selection?.anchorNode
        )
          ? selectedText.length
          : 0;

      if (
        title.textContent.length -
          selectedLength >=
        MAX_ZONE_TITLE_CHARS
      ) {
        event.preventDefault();
      }
    }
  );

  title.addEventListener(
    "input",
    () => {

      const cleanText =
        title.textContent
          .replace(/\r?\n|\r/g, " ")
          .slice(
            0,
            MAX_ZONE_TITLE_CHARS
          );

      zoneData.title =
        cleanText;
    }
  );

  title.addEventListener(
    "paste",
    (event) => {
      event.preventDefault();

      const currentText =
        title.textContent;

      const availableChars =
        MAX_ZONE_TITLE_CHARS -
        currentText.length;

      const text =
        event.clipboardData
          .getData("text/plain")
          .replace(/\r?\n|\r/g, " ")
          .slice(
            0,
            Math.max(
              0,
              availableChars
            )
          );

      document.execCommand(
        "insertText",
        false,
        text
      );
    }
  );

  title.addEventListener(
    "blur",
    () => {
      title.contentEditable =
        "false";

      zoneData.isEditingTitle =
        false;  

      title.classList.remove(
        "is-editing"
      );

      const normalizedTitle =
        title.textContent
          .trim()
          .slice(
            0,
            MAX_ZONE_TITLE_CHARS
          ) || DEFAULT_ZONE_TITLE;

      title.textContent =
        normalizedTitle;

      zoneData.title =
        normalizedTitle;

      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );
    }
  );

  title.contentEditable =
    "false";
}