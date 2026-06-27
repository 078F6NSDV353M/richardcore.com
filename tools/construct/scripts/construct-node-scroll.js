// import {
//   
// } from "../hub.js";

export function keepNodeScrollInside(
  node,
  position = "top"
) {
  const content =
    node.querySelector(
      ".construct-node-content"
    );

  if (!content) {
    return;
  }

  if (position === "bottom") {
    content.scrollTop =
      content.scrollHeight;

    return;
  }

  content.scrollTop = 0;
  content.scrollLeft = 0;
}

export function setupScrollHandlers(
  contentEl,
  pasteImageIntoNode
) {
  if (!contentEl) {
    return;
  }

  contentEl.addEventListener(
    "wheel",
    (event) => {
      const isScrollable =
        contentEl.scrollHeight >
        contentEl.clientHeight;

      if (isScrollable) {
        event.stopPropagation();
      }
    },
    {
      passive: true
    }
  );

  contentEl.addEventListener(
    "paste",
    (event) => {
      pasteImageIntoNode(event);
    }
  );
}