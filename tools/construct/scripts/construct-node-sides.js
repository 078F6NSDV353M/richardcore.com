import {
  setImage
} from "../hub.js";


export function updateSideIndicator(
  sideIndicator,
  side
) {
  if (!sideIndicator) {
    return;
  }

  sideIndicator.textContent =
    `${side}`;

  sideIndicator.classList.remove(
    "side-a",
    "side-b"
  );

  sideIndicator.classList.add(
    side === "B"
      ? "side-b"
      : "side-a"
  );
}

export function saveCurrentSideContent(
  nodeData,
  textElement,
  imageContainer,
  whiteboardSvg
) {
  if (!nodeData) {
    return;
  }

  const currentSide =
    nodeData.currentSide || "A";

  if (
    !nodeData.sides ||
    !nodeData.sides[currentSide]
  ) {
    return;
  }

  nodeData.sides[currentSide].text =
    textElement?.textContent || "";

  nodeData.sides[currentSide].image =
    imageContainer?.dataset.imageSrc || "";
}

export function applySideContent(
  nodeData,
  side,
  textElement,
  imageContainer,
  whiteboardSvg
) {
  if (!nodeData) {
    return;
  }

  const sideData =
    nodeData.sides?.[side];

  if (textElement) {
    textElement.textContent =
      sideData?.text || "";
  }

  if (!imageContainer) {
    return;
  }

  imageContainer
    .querySelectorAll("img")
    .forEach((img) => {
      img.remove();
    });

  imageContainer.classList.remove(
    "has-image"
  );

  delete imageContainer.dataset.imageSrc;

  if (sideData?.image) {
    setImage(
      nodeData.element,
      imageContainer,
      sideData.image
    );
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function flipNodeSide(
  nodeElement,
  nodeData
) {
  if (!nodeElement || !nodeData) {
    return;
  }

  const textElement =
    nodeElement.querySelector(
      ".construct-node-text"
    );

  const imageContainer =
    nodeElement.querySelector(
      ".construct-node-image"
    );

  const whiteboardSvg =
    nodeElement.querySelector(
      ".construct-node-whiteboard-svg"
    );

  const sideIndicator =
    nodeElement.querySelector(
      ".construct-node-side-indicator"
    );

  saveCurrentSideContent(
    nodeData,
    textElement,
    imageContainer,
    whiteboardSvg
  );

  const nextSide =
    nodeData.currentSide === "A"
      ? "B"
      : "A";

  nodeData.currentSide =
    nextSide;

  updateSideIndicator(
    sideIndicator,
    nextSide
  );

  applySideContent(
    nodeData,
    nextSide,
    textElement,
    imageContainer,
    whiteboardSvg
  );
}