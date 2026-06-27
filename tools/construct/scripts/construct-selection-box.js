import {
  state,
  getStage,
  clearSelectedConnections,
  applyConnectionSelection
} from "../hub.js";


export function startSelectionBox(event) {
  const stage =
    getStage();

  if (!stage) {
    return;
  }

  const rect =
    stage.getBoundingClientRect();

  state.selectionStartX =
    event.clientX - rect.left;

  state.selectionStartY =
    event.clientY - rect.top;

  const selectionBox =
    document.createElement("div");

  selectionBox.className =
    "construct-selection-box";

  selectionBox.style.left =
    `${state.selectionStartX}px`;

  selectionBox.style.top =
    `${state.selectionStartY}px`;

  selectionBox.style.width =
    "0px";

  selectionBox.style.height =
    "0px";

  stage.appendChild(
    selectionBox
  );

  state.selectionBox =
    selectionBox;
}

export function updateSelectionBox(event) {
  if (!state.selectionBox) {
    return;
  }

  const stage =
    getStage();

  if (!stage) {
    return;
  }

  const rect =
    stage.getBoundingClientRect();

  const currentX =
    event.clientX - rect.left;

  const currentY =
    event.clientY - rect.top;

  const left =
    Math.min(
      state.selectionStartX,
      currentX
    );

  const top =
    Math.min(
      state.selectionStartY,
      currentY
    );

  const width =
    Math.abs(
      currentX -
      state.selectionStartX
    );

  const height =
    Math.abs(
      currentY -
      state.selectionStartY
    );

  state.selectionBox.style.left =
    `${left}px`;

  state.selectionBox.style.top =
    `${top}px`;

  state.selectionBox.style.width =
    `${width}px`;

  state.selectionBox.style.height =
    `${height}px`;

  const selectionRect =
    state.selectionBox.getBoundingClientRect();

  state.nodes.forEach((nodeData) => {
    const nodeRect =
      nodeData.element.getBoundingClientRect();

    const intersects =
      !(
        nodeRect.right < selectionRect.left ||
        nodeRect.left > selectionRect.right ||
        nodeRect.bottom < selectionRect.top ||
        nodeRect.top > selectionRect.bottom
      );

    nodeData.element.classList.toggle(
      "is-selected",
      intersects
    );
  });

  document
    .querySelectorAll(
      ".construct-zone"
    )
    .forEach((zone) => {

      const zoneRect =
        zone.getBoundingClientRect();

      const intersects =
        !(
          zoneRect.right < selectionRect.left ||
          zoneRect.left > selectionRect.right ||
          zoneRect.bottom < selectionRect.top ||
          zoneRect.top > selectionRect.bottom
        );

      zone.classList.toggle(
        "is-selected",
        intersects
      );
    });
  
  document
    .querySelectorAll(
      ".construct-text-label"
    )
    .forEach((label) => {

      const labelRect =
        label.getBoundingClientRect();

      const intersects =
        !(
          labelRect.right < selectionRect.left ||
          labelRect.left > selectionRect.right ||
          labelRect.bottom < selectionRect.top ||
          labelRect.top > selectionRect.bottom
        );

      label.classList.toggle(
        "is-selected",
        intersects
      );
    });  

  clearSelectedConnections();

  state.connections.forEach((connection) => {

    const line =
      connection.hitLine ||
      connection.line;

    if (!line) {
      return;
    }

    const lineRect =
      line.getBoundingClientRect();

    const intersects =
      !(
        lineRect.right < selectionRect.left ||
        lineRect.left > selectionRect.right ||
        lineRect.bottom < selectionRect.top ||
        lineRect.top > selectionRect.bottom
      );

    if (intersects) {
      applyConnectionSelection(
        connection,
        {
          additive: true
        }
      );
    }
  });
}

export function finishSelectionBox() {
  if (!state.selectionBox) {
    return;
  }

  state.selectionBox.remove();

  state.selectionBox =
    null;
}