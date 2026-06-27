// import {

// } from "../hub.js";

let overlayElement =
  null;

export function createOverlay(message) {

  const overlay =
    document.createElement("div");

  overlay.className =
    "construct-export-status-overlay";

  overlay.innerHTML = `
    <div class="construct-export-status">
      <div class="construct-export-status-spinner"></div>

      <div class="construct-export-status-text">
        ${message}
      </div>
    </div>
  `;

  return overlay;
}

export function showExportStatus(
  message = "Preparing export..."
) {

  hideExportStatus();

  const stage =
    document.querySelector(
      ".construct-stage"
    );

  if (!stage) {
    return;
  }

  overlayElement =
    createOverlay(message);

  stage.appendChild(
    overlayElement
  );
}

export function hideExportStatus() {

  overlayElement?.remove();

  overlayElement = null;
}
