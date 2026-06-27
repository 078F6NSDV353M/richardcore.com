import {
  state,
  getWorld,
  closeAllContextMenus,
  ensureTextLabelMenu,
  closeTextLabelMenu,
  openTextLabelMenu,
  selectObject,
  startDragSelection
} from "../hub.js";

export const DEFAULT_TEXT_LABEL_TEXT =
  "Text label";

export const DEFAULT_TEXT_LABEL_COLOR =
  "#ffffff";

export const DEFAULT_TEXT_LABEL_FONT_SIZE =
  48;

export function ensureTextLabelsLayer() {
  let layer =
    document.querySelector(
      ".construct-text-labels"
    );

  if (layer) {
    return layer;
  }

  const world =
    getWorld();

  if (!world) {
    return null;
  }

  layer =
    document.createElement("div");

  layer.className =
    "construct-text-labels";

  world.appendChild(
    layer
  );

  return layer;
}

export function getTextLabelData(label) {
  return label?.__textLabelData || null;
}

export function getSelectedTextLabels() {
  return [
    ...document.querySelectorAll(
      ".construct-text-label.is-selected"
    )
  ];
}

export function clearTextLabelSelection() {
  document
    .querySelectorAll(
      ".construct-text-label.is-selected"
    )
    .forEach((label) => {
      label.classList.remove(
        "is-selected"
      );
    });
}

export function selectTextLabel(
  label,
  event
) {
  selectObject(
    label,
    event
  );
}

export function syncTextLabelData(
  label
) {
  const data =
    getTextLabelData(label);

  if (!data) {
    return;
  }

  data.x =
    parseFloat(label.style.left) || 0;

  data.y =
    parseFloat(label.style.top) || 0;

  data.text =
    label
      .querySelector(".construct-text-label-text")
      ?.textContent || DEFAULT_TEXT_LABEL_TEXT;

  data.color =
    label.style.color || DEFAULT_TEXT_LABEL_COLOR;

  data.fontSize =
    parseFloat(label.style.fontSize) ||
    DEFAULT_TEXT_LABEL_FONT_SIZE;

  data.locked =
    label.dataset.locked === "true";
}

export function createTextLabel({
  x = 0,
  y = 0,
  text = DEFAULT_TEXT_LABEL_TEXT,
  color = DEFAULT_TEXT_LABEL_COLOR,
  fontSize = DEFAULT_TEXT_LABEL_FONT_SIZE,
  locked = false
} = {}) {
  const layer =
    ensureTextLabelsLayer();

  if (!layer) {
    return null;
  }

  const label =
    document.createElement("div");

  label.className =
    "construct-text-label";

  label.style.left =
    `${x}px`;

  label.style.top =
    `${y}px`;

  label.style.color =
    color;

  label.style.fontSize =
    `${fontSize}px`;

  label.dataset.locked =
    String(Boolean(locked));

  const textElement =
    document.createElement("div");

  textElement.className =
    "construct-text-label-text";

  textElement.textContent =
    text || DEFAULT_TEXT_LABEL_TEXT;

  textElement.spellcheck =
    false;

  textElement.contentEditable =
    "false";

  label.appendChild(
    textElement
  );

  [
    "tl",
    "tr",
    "br",
    "bl"
  ].forEach((corner) => {
    const handle =
      document.createElement("div");

    handle.className =
      `construct-text-label-corner construct-text-label-corner-${corner}`;

    handle.dataset.corner =
      corner;

    label.appendChild(
      handle
    );
  });

  const labelData = {
    id: crypto.randomUUID(),
    x,
    y,
    text:
      text || DEFAULT_TEXT_LABEL_TEXT,
    color,
    fontSize,
    locked:
      Boolean(locked),
    element:
      label
  };

  label.__textLabelData =
    labelData;

  label.addEventListener(
    "mousedown",
    (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      closeAllContextMenus();
      closeTextLabelMenu();

      if (
        !label.classList.contains(
          "is-selected"
        )
      ) {
        selectTextLabel(
          label,
          event
        );
      }

      const corner =
        event.target.closest(
          ".construct-text-label-corner"
        );

      if (corner) {
        startTextLabelResize(
          event,
          label,
          corner.dataset.corner
        );

        return;
      }

      startDragSelection(
        event,
        label
      );
    }
  );

  label.addEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        label.dataset.locked === "true"
      ) {
        return;
      }

      textElement.contentEditable =
        "true";

      textElement.focus();

      const range =
        document.createRange();

      range.selectNodeContents(
        textElement
      );

      const selection =
        window.getSelection();

      selection.removeAllRanges();
      selection.addRange(range);
    }
  );

  textElement.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        textElement.blur();
      }
    }
  );

  textElement.addEventListener(
    "paste",
    (event) => {
      event.preventDefault();

      const text =
        event.clipboardData
          .getData("text/plain")
          .replace(/\r?\n|\r/g, " ");

      document.execCommand(
        "insertText",
        false,
        text
      );
    }
  );

  textElement.addEventListener(
    "blur",
    () => {
      textElement.contentEditable =
        "false";

      if (
        !textElement.textContent.trim()
      ) {
        textElement.textContent =
          DEFAULT_TEXT_LABEL_TEXT;
      }

      syncTextLabelData(label);

      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );
    }
  );

  label.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !label.classList.contains(
          "is-selected"
        )
      ) {
        selectTextLabel(
          label,
          event
        );
      }

      openTextLabelMenu(
        label,
        event.clientX,
        event.clientY,
        {
          getTextLabelData
        }
      );
    }
  );

  layer.appendChild(label);

  state.textLabels.push(
    labelData
  );

  return label;
}

export function startTextLabelDrag(
  event,
  label
) {
  const data =
    getTextLabelData(label);

  if (!data || data.locked) {
    return;
  }

  const selectedLabels =
    getSelectedTextLabels();

  const dragLabels =
    label.classList.contains(
      "is-selected"
    )
      ? selectedLabels
      : [label];

  const startX =
    event.clientX;

  const startY =
    event.clientY;

  const startItems =
    dragLabels.map((item) => ({
      element:
        item,
      startLeft:
        parseFloat(item.style.left) || 0,
      startTop:
        parseFloat(item.style.top) || 0
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

      syncTextLabelData(
        item.element
      );
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
}

export function startTextLabelResize(
  event,
  label,
  corner
) {
  const data =
    getTextLabelData(label);

  if (!data || data.locked) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const startFontSize =
    parseFloat(label.style.fontSize) ||
    DEFAULT_TEXT_LABEL_FONT_SIZE;

  const startLeft =
    parseFloat(label.style.left) || 0;

  const startTop =
    parseFloat(label.style.top) || 0;

  const startWidth =
    label.offsetWidth;

  const startHeight =
    label.offsetHeight;

  const oppositeWorld = {
    x:
      corner.includes("l")
        ? startLeft + startWidth
        : startLeft,

    y:
      corner.includes("t")
        ? startTop + startHeight
        : startTop
  };

  const oppositeScreen = {
    x:
      oppositeWorld.x * state.zoom +
      state.panX,

    y:
      oppositeWorld.y * state.zoom +
      state.panY
  };

  const startDistance =
    Math.max(
      1,
      Math.hypot(
        event.clientX - oppositeScreen.x,
        event.clientY - oppositeScreen.y
      )
    );

  const minFontSize =
    8;

  function handleMouseMove(
    moveEvent
  ) {
    const currentDistance =
      Math.max(
        1,
        Math.hypot(
          moveEvent.clientX - oppositeScreen.x,
          moveEvent.clientY - oppositeScreen.y
        )
      );

    const scale =
      currentDistance / startDistance;

    const nextFontSize =
      Math.max(
        minFontSize,
        startFontSize * scale
      );

    label.style.fontSize =
      `${Math.round(nextFontSize)}px`;

    const nextWidth =
      label.offsetWidth;

    const nextHeight =
      label.offsetHeight;

    let nextLeft =
      startLeft;

    let nextTop =
      startTop;

    if (corner.includes("l")) {
      nextLeft =
        oppositeWorld.x - nextWidth;
    }

    if (corner.includes("t")) {
      nextTop =
        oppositeWorld.y - nextHeight;
    }

    label.style.left =
      `${Math.round(nextLeft)}px`;

    label.style.top =
      `${Math.round(nextTop)}px`;

    syncTextLabelData(label);
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

export function deleteSelectedTextLabels() {
  const labels =
    getSelectedTextLabels();

  if (labels.length === 0) {
    return;
  }

  const dataSet =
    new Set(
      labels.map((label) =>
        getTextLabelData(label)
      )
    );

  labels.forEach((label) => {
    label.remove();
  });

  state.textLabels =
    state.textLabels.filter(
      (labelData) =>
        !dataSet.has(labelData)
    );

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function initTextLabelHotkeys() {
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Delete" &&
        event.key !== "Backspace"
      ) {
        return;
      }

      const activeElement =
        document.activeElement;

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

      if (
        getSelectedTextLabels().length === 0
      ) {
        return;
      }

      event.preventDefault();

      deleteSelectedTextLabels();
    }
  );
}

export function initTextLabelSelectionClear() {
  window.addEventListener(
    "mousedown",
    (event) => {
      if (event.button === 2) {
        return;
      }

      if (
        event.target.closest(
          ".construct-text-label, " +
          ".construct-text-label-menu, " +
          ".construct-multiselect-menu, " +
          ".construct-node, " +
          ".construct-zone"
        )
      ) {
        return;
      }

      clearTextLabelSelection();
      closeTextLabelMenu();
    },
    true
  );
}

export function initTextLabels() {
  ensureTextLabelsLayer();
  
  ensureTextLabelMenu({
    getSelectedTextLabels,
    getTextLabelData,
    syncTextLabelData,
    deleteSelectedTextLabels
  });

  initTextLabelHotkeys();
  initTextLabelSelectionClear();
}