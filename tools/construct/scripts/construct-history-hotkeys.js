// import {

// } from "../hub.js";

export function handleHistoryHotkeys(
  event,
  helpers = {}
) {
  const {
    isTextEditingActive,
    undo,
    redo
  } = helpers;

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

  const isUndo =
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.code === "KeyZ";

  const isRedo =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyZ";

  if (isUndo) {
    event.preventDefault();
    event.stopPropagation();

    undo?.();

    return;
  }

  if (isRedo) {
    event.preventDefault();
    event.stopPropagation();

    redo?.();
  }
}