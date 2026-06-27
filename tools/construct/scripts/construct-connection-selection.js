let selectedConnection = null;

const selectedConnections =
  new Set();

export function getSelectedConnection() {
  return selectedConnection;
}

export function setSelectedConnection(connection) {
  selectedConnection = connection;
}

export function getSelectedConnections() {
  return [...selectedConnections];
}

export function hasSelectedConnections() {
  return selectedConnections.size > 0;
}

export function hasMixedSelection() {

  const selectedNodes =
    document.querySelectorAll(
      ".construct-node.is-selected"
    );

  const selectedZones =
    document.querySelectorAll(
      ".construct-zone.is-selected"
    );

  const selectedKinds =
    [
      selectedNodes.length > 0,
      selectedConnections.size > 0,
      selectedZones.length > 0
    ].filter(Boolean).length;

  return selectedKinds >= 2;
}

export function clearSelectedConnections() {

  document
    .querySelectorAll(
      ".construct-connection-line.is-selected, " +
      ".construct-connection-hit-area.is-selected"
    )
    .forEach((element) => {
      element.classList.remove(
        "is-selected"
      );
    });

  selectedConnections.clear();
  selectedConnection = null;
}

export function applyConnectionSelection(
  connection,
  {
    additive = false
  } = {}
) {

  if (!additive) {
    clearSelectedConnections();
  }

  if (!connection) {
    return;
  }

  const alreadySelected =
    selectedConnections.has(connection);

  if (additive && alreadySelected) {

    connection.line?.classList.remove(
      "is-selected"
    );

    connection.line2?.classList.remove(
      "is-selected"
    );

    connection.hitLine?.classList.remove(
      "is-selected"
    );

    selectedConnections.delete(connection);

    selectedConnection =
      [...selectedConnections].at(-1) ||
      null;

    return;
  }

  connection.line?.classList.add(
    "is-selected"
  );

  connection.line2?.classList.add(
    "is-selected"
  );

  connection.hitLine?.classList.add(
    "is-selected"
  );

  selectedConnections.add(connection);
  selectedConnection = connection;
}

export function restoreSelectedConnectionClasses() {
  selectedConnections.forEach((connection) => {
    connection.line?.classList.add("is-selected");
    connection.line2?.classList.add("is-selected");
    connection.hitLine?.classList.add("is-selected");
  });
}