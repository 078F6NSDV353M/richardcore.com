// import {

// } from "../hub.js";

export async function exportWorkspacePng() {
  const exportButton =
    document.querySelector(
      '[data-action="export-png"]'
    );

  exportButton?.click();
}