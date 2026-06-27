import {
  getStage
} from "../hub.js";

let isPointerOverWorkspace =
  false;

export function setWorkspacePointerState(value) {
  isPointerOverWorkspace =
    value;
}

export function isTextEditingActive() {
  const activeElement =
    document.activeElement;

  const isWhiteboardFocused =
    activeElement?.closest?.(
      ".construct-node-whiteboard"
    );

  if (isWhiteboardFocused) {
    return false;
  }

  return Boolean(
    activeElement &&
    (
      activeElement.isContentEditable ||
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA"
    )
  );
}

export function isWhiteboardOverlayOpen() {
  const overlay =
    document.querySelector(
      ".construct-whiteboard-overlay"
    );

  return Boolean(
    overlay &&
    !overlay.hidden
  );
}

export function blockBrowserWorkspaceDefaults({
  event,
  handleWorkspaceHotkeys,
  handleHistoryHotkeys,
  handleClipboardHotkeys
}) {
  const stage = getStage();

  const whiteboardOpened =
    isWhiteboardOverlayOpen();

  if (whiteboardOpened) {
    return;
  }

  if (!stage) {
    return;
  }

  const isInsideWorkspace =
    stage.contains(event.target) ||
    isPointerOverWorkspace;

  if (!isInsideWorkspace) {
    return;
  }

  const editingWhiteboard =
    document.querySelector(
      ".construct-node.is-editing.construct-node-type-whiteboard"
    );

  const isWhiteboardUndo =
    editingWhiteboard &&
    (event.ctrlKey || event.metaKey) &&
    event.code === "KeyZ";

  if (isWhiteboardUndo) {
    return;
  }

  if (
    isTextEditingActive() &&
    event.type !== "wheel"
  ) {
    const isClipboardShortcut =
      (event.ctrlKey || event.metaKey) &&
      (
        event.code === "KeyA" ||
        event.code === "KeyC" ||
        event.code === "KeyV" ||
        event.code === "KeyX" ||
        event.code === "KeyZ"
      );

    if (isClipboardShortcut) {
      return;
    }

    const hasModifier =
      event.ctrlKey ||
      event.metaKey ||
      event.altKey;

    if (hasModifier) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    return;
  }

  const hasModifier =
    event.ctrlKey ||
    event.metaKey ||
    event.altKey;

  if (!hasModifier) {
    return;
  }

  event.preventDefault();

  handleWorkspaceHotkeys(event);
  handleHistoryHotkeys(event);
  handleClipboardHotkeys(event);

  event.stopImmediatePropagation();
}