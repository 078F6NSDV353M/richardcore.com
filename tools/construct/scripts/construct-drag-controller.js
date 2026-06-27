import {
  state,
  updateNodeConnections,
  syncTextLabelData
} from "../hub.js";

function getUnlockedSelectedZones() {
  return [
    ...document.querySelectorAll(
      ".construct-zone.is-selected"
    )
  ].filter((zone) => {
    const zoneData =
      zone.__zoneData;

    return Boolean(
      zoneData &&
      !zoneData.locked
    );
  });
}

function getUnlockedSelectedTextLabels() {
  return [
    ...document.querySelectorAll(
      ".construct-text-label.is-selected"
    )
  ].filter((label) => {
    const labelData =
      label.__textLabelData;

    return Boolean(
      labelData &&
      !labelData.locked
    );
  });
}

function getSelectedNodes() {
  return [
    ...document.querySelectorAll(
      ".construct-node.is-selected"
    )
  ];
}

export function getSelectedDragItems() {
  return [
    ...getSelectedNodes(),
    ...getUnlockedSelectedZones(),
    ...getUnlockedSelectedTextLabels()
  ];
}

export function startDragSelection(
  event,
  originElement
) {
  if (!originElement) {
    return;
  }

  const shouldDragSelection =
    originElement.classList.contains(
      "is-selected"
    );

  const dragItems =
    shouldDragSelection
      ? getSelectedDragItems()
      : [originElement];

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

  function handleMouseMove(moveEvent) {
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
        const zoneData =
          item.element.__zoneData;

        if (zoneData) {
          zoneData.x =
            parseFloat(
              item.element.style.left
            ) || 0;

          zoneData.y =
            parseFloat(
              item.element.style.top
            ) || 0;
        }
      }

      if (
        item.element.classList.contains(
          "construct-text-label"
        )
      ) {
        syncTextLabelData(
          item.element
        );
      }

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