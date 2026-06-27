// import {

// } from "../hub.js";


export function moveCaretToEnd(element) {
  const range = document.createRange();
  const selection = window.getSelection();

  if (!selection) return;

  range.selectNodeContents(element);
  range.collapse(false);

  selection.removeAllRanges();
  selection.addRange(range);
}

export function clampTextLength(element, maxChars) {
  const text = element.textContent || "";

  if (text.length <= maxChars) {
    return false;
  }

  element.textContent = text.slice(0, maxChars);
  moveCaretToEnd(element);
  return true;
}

export function setupTextHandlers({
  node,
  textEl,
  titleEl,
  getNodeData,
  clampTextLength,
  keepNodeScrollInside,
  pasteImageIntoNode,
  onContentChange,
  MAX_TEXT_CHARS,
  MAX_TITLE_CHARS
}) {
  textEl.addEventListener("mousedown", (event) => {
    const nodeData = getNodeData(node);

    if (!nodeData || !nodeData.isEditing) {
      return;
    }

    if (event.target !== textEl) {
      return;
    }

    textEl.focus();
  });

  textEl.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();

      document.execCommand(
        "insertLineBreak"
      );

      keepNodeScrollInside(node);
      onContentChange?.();
    }
  );

  textEl.addEventListener("input", () => {
    clampTextLength(textEl, MAX_TEXT_CHARS);
    keepNodeScrollInside(node);

    onContentChange?.();

  });

  textEl.addEventListener("click", (event) => {
    const nodeData = getNodeData(node);

    if (!nodeData || !nodeData.isEditing) {
      return;
    }

    if (event.target !== textEl) {
      return;
    }

    textEl.focus();

    if (window.getSelection()?.toString()) {
      return;
    }

    const range =
      document.caretRangeFromPoint?.(
        event.clientX,
        event.clientY
      );

    const clickedInsideText =
      range &&
      textEl.contains(range.startContainer);

    if (clickedInsideText) {
      return;
    }

    moveCaretToEnd(textEl);
  });

  textEl.addEventListener("paste", (event) => {
    const nodeData = getNodeData(node);
    if (!nodeData || !nodeData.isEditing) {
      event.preventDefault();
      return;
    }

    if (pasteImageIntoNode(event)) return;

    event.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const currentText = textEl.textContent || "";
    const selectedText = selection.toString();
    const availableChars =
      MAX_TEXT_CHARS - currentText.length + selectedText.length;

    if (availableChars <= 0) return;

    const pastedText =
      (event.clipboardData?.getData("text/plain") || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .slice(0, availableChars);

    const range =
      selection.getRangeAt(0);

    range.deleteContents();

    const textNode =
      document.createTextNode(pastedText);

    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    selection.removeAllRanges();
    selection.addRange(range);

    clampTextLength(textEl, MAX_TEXT_CHARS);
    keepNodeScrollInside(node);
    onContentChange?.();
  });

  titleEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  });

  titleEl.addEventListener("input", () => {
    clampTextLength(titleEl, MAX_TITLE_CHARS);

  });

  titleEl.addEventListener("paste", (event) => {
    const nodeData = getNodeData(node);
    if (!nodeData || !nodeData.isEditing) {
      event.preventDefault();
      return;
    }

    if (pasteImageIntoNode(event)) return;

    event.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const currentText = titleEl.textContent || "";
    const selectedText = selection.toString();
    const availableChars =
      MAX_TITLE_CHARS - currentText.length + selectedText.length;

    if (availableChars <= 0) return;

    const pastedText =
      (event.clipboardData?.getData("text/plain") || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, availableChars);

    document.execCommand("insertText", false, pastedText);

    clampTextLength(titleEl, MAX_TITLE_CHARS);
  });
}