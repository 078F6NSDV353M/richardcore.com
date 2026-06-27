export function getSelectedNodes() {
  return [
    ...document.querySelectorAll(
      ".construct-node.is-selected"
    )
  ];
}

export function getSelectedZones() {
  return [
    ...document.querySelectorAll(
      ".construct-zone.is-selected"
    )
  ];
}


export function getSelectedObjects() {
  return [
    ...getSelectedNodes(),
    ...getSelectedZones(),
    ...document.querySelectorAll(
      ".construct-text-label.is-selected"
    )
  ];
}

export function clearSelectedNodes() {
  getSelectedNodes().forEach((node) => {
    node.classList.remove(
      "is-selected"
    );
  });
}

export function clearSelectedZones() {
  getSelectedZones().forEach((zone) => {
    zone.classList.remove(
      "is-selected"
    );
  });
}

export function clearSelectedTextLabels() {
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

export function clearObjectSelection() {
  clearSelectedNodes();
  clearSelectedZones();
  clearSelectedTextLabels();
}

export function isAdditiveSelectionEvent(event) {
  return Boolean(
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

export function selectObject(
  element,
  event
) {
  if (!element) {
    return;
  }

  if (isAdditiveSelectionEvent(event)) {
    element.classList.toggle(
      "is-selected"
    );

    return;
  }

  if (
    element.classList.contains(
      "is-selected"
    )
  ) {
    return;
  }

  clearObjectSelection();

  element.classList.add(
    "is-selected"
  );
}

export function selectOnlyObject(element) {
  if (!element) {
    return;
  }

  clearObjectSelection();

  element.classList.add(
    "is-selected"
  );
}

export function selectAllObjects() {
  document
    .querySelectorAll(
      ".construct-node, " +
      ".construct-zone, " +
      ".construct-text-label"
    )
    .forEach((element) => {
      element.classList.add(
        "is-selected"
      );
    });
}

export function isObjectSelected(element) {
  return Boolean(
    element &&
    element.classList.contains(
      "is-selected"
    )
  );
}