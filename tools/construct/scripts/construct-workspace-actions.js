import {
  exportWorkspacePng
} from "../hub.js";

export function getSearchInput() {
  return document.querySelector(
    ".construct-floating-panel-search"
  );
}

export function getOpenButton() {
  return document.querySelector(
    '[data-action="open"]'
  );
}

export function getSaveButton() {
  return document.querySelector(
    '[data-action="save"]'
  );
}

export function getExportPngButton() {
  return document.querySelector(
    '[data-action="export-png"]'
  );
}

export function focusSearchInput() {
  const searchInput =
    getSearchInput();

  searchInput?.focus();
  searchInput?.select();
}

export function triggerOpenProject() {
  getOpenButton()?.click();
}

export function triggerSaveProject() {
  getSaveButton()?.click();
}

export function triggerSaveAsProject() {
  document
    .querySelector(
      '[data-action="save-as"]'
    )
    ?.click();
}

export function triggerExportWorkspacePng() {
  getExportPngButton()?.click();
}

export function triggerFitWorkspace() {
  document
    .querySelector('[data-action="fit"]')
    ?.click();
}