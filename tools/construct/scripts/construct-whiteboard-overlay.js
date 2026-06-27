import {
  setImage,
  keepNodeScrollInside,
  saveImageAsset
} from "../hub.js";

let targetImageNode = null;
let targetImageContainer = null;

export function fitWhiteboardFrame(frame, width, height) {
  const toolbarHeight = 0;
  const windowPadding = 28;

  const maxWidth =
    window.innerWidth * 0.96 - windowPadding;

  const minToolbarWidth = 1180;  

  const maxHeight =
    window.innerHeight * 0.82 -
    toolbarHeight -
    windowPadding;

  const aspect =
    width / height;

  let frameWidth =
    Math.max(
      minToolbarWidth,
      maxWidth
    );

  let frameHeight =
    frameWidth / aspect;

  if (frameHeight > maxHeight) {
    frameHeight =
      maxHeight;

    frameWidth =
      frameHeight * aspect;
  }

  frame.style.width =
    `${frameWidth}px`;

  frame.style.height =
    `${frameHeight + toolbarHeight}px`;

  const windowElement =
    frame.closest(
      ".construct-whiteboard-window"
    );

  if (windowElement) {
    windowElement.style.width =
      `${frameWidth + 28}px`;

    windowElement.style.margin =
      "0 auto";
  }

  frame.style.aspectRatio =
    `${width} / ${height}`;
}

export function ensureWhiteboardOverlay() {
  let overlay =
    document.querySelector(
      ".construct-whiteboard-overlay"
    );

  if (overlay) {
    return overlay;
  }

  overlay =
    document.createElement("div");

  overlay.className =
    "construct-whiteboard-overlay";

  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="construct-whiteboard-window">

      <iframe class="construct-whiteboard-frame" src="../whiteboard/index.html?embedded=1"></iframe>

    </div>
  `;

  const stage =
    document.querySelector(
      ".construct-stage"
    );

  if (!stage) {
    return null;
  }

  stage.appendChild(
    overlay
  );

  overlay.addEventListener(
    "click",
    (event) => {
      if (event.target === overlay) {
        overlay.hidden = true;
        return;
      }

      const button =
        event.target.closest("button");

      if (!button) {
        return;
      }

      const action =
        button.dataset.action;

      if (action === "whiteboard-close") {
        overlay.hidden = true;
      }
    }
  );

  window.addEventListener(
    "message",
    async (event) => {
      const data =
        event.data;

      if (
        !data ||
        data.type !== "whiteboard-export"
      ) {
        return;
      }

      if (
        !targetImageNode ||
        !targetImageContainer
      ) {
        return;
      }

      const response =
        await fetch(
          data.imageDataUrl
        );

      const blob =
        await response.blob();

      const file =
        new File(
          [blob],
          "whiteboard-export.png",
          {
            type: "image/png"
          }
        );

      const currentImagePath =
        targetImageNode
          ? window.state?.nodes
              ?.find(
                (item) =>
                  item.id ===
                  Number(targetImageNode.dataset.nodeId)
              )
              ?.sides
              ?.[
                window.state.nodes.find(
                  (item) =>
                    item.id ===
                    Number(targetImageNode.dataset.nodeId)
                )?.currentSide || "A"
              ]
              ?.image
          : null;

      const assetPath =
        await saveImageAsset(
          file,
          currentImagePath
        );

      if (!assetPath) {
        return;
      }

      setImage(
        targetImageNode,
        targetImageContainer,
        assetPath,
        keepNodeScrollInside
      );

      overlay.hidden = true;

      targetImageNode = null;
      targetImageContainer = null;
    }
  );

  return overlay;
}

export function openWhiteboardOverlay({
  node,
  imageContainer
} = {}) {
  const overlay =
    ensureWhiteboardOverlay();

  if (!overlay) {
    return;
  }

  targetImageNode =
    node || null;

  targetImageContainer =
    imageContainer || null;

  const frame =
    overlay.querySelector(
      ".construct-whiteboard-frame"
    );

  const existingImage =
    targetImageContainer
      ?.querySelector("img")
      ?.src || "";
  
  const existingImageElement =
    targetImageContainer
      ?.querySelector("img");

  const existingImageWidth =
    existingImageElement?.naturalWidth || 1600;

  const existingImageHeight =
    existingImageElement?.naturalHeight || 900;

  if (frame) {
    fitWhiteboardFrame(
      frame,
      existingImageWidth,
      existingImageHeight
    );
      
    const params =
      new URLSearchParams();

    params.set("embedded", "1");
    params.set("reset", String(Date.now()));

    sessionStorage.removeItem(
      "construct-whiteboard-start-image"
    );

    const startImage =
      existingImage;

    frame.style.visibility = "hidden";

    frame.addEventListener(
      "load",
      () => {
        frame.style.visibility = "";

        if (startImage) {
          frame.contentWindow?.postMessage(
            {
              type: "whiteboard-start-image",
              imageDataUrl: startImage
            },
            "*"
          );
        }
      },
      {
        once: true
      }
    );

    frame.src =
      `../whiteboard/index.html?${params.toString()}`;
  }

  overlay.style.opacity = "0";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "";
    });
  });

  overlay.hidden = false;
}