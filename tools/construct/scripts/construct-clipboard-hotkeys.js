// import {
 
// } from "../hub.js";

export function handleClipboardHotkeys(
  event,
  helpers = {}
) {
  const {
    isTextEditingActive,
    copy,
    copyWithConnections,
    paste
  } = helpers;

  if (
    typeof isTextEditingActive ===
      "function" &&
    isTextEditingActive()
  ) {
    return;
  }

  const isCopy =
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.code === "KeyC";

  const isCopyWithConnections =
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyC";

  const isPaste =
    (event.ctrlKey || event.metaKey) &&
    event.code === "KeyV";

  if (isCopy) {
    event.preventDefault();
    event.stopPropagation();

    copy?.();

    return;
  }

  if (isCopyWithConnections) {
    event.preventDefault();
    event.stopPropagation();

    copyWithConnections?.();

    return;
  }

  if (isPaste) {
    event.preventDefault();
    event.stopPropagation();

    paste?.();
  }
}