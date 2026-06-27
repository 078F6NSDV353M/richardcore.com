import {
  createWorkspaceSnapshot,
  saveProjectFile,
  getIsProjectLoaded
} from "../hub.js";


let isAutosaveEnabled =
  true;

export function setProjectAutosaveEnabled(value) {
  isAutosaveEnabled =
    Boolean(value);

  window.dispatchEvent(
    new Event(
      "construct:autosave-changed"
    )
  );
}

export function getProjectAutosaveEnabled() {
  return isAutosaveEnabled;
}

export function initProjectAutosave() {

  let autosaveTimeout =
    null;

  let isSaving =
    false;

  async function runAutosave() {

    if (
      isSaving ||
      !isAutosaveEnabled ||
      !getIsProjectLoaded()
    ) {
      return;
    }

    isSaving = true;

    try {

      document.body.dataset.saveState =
        "saving";

      const snapshot =
        createWorkspaceSnapshot();

      const json =
        JSON.stringify(
          snapshot,
          null,
          2
        );

      await saveProjectFile(json);

      document.body.dataset.saveState =
        "saved";

    } catch (error) {

      console.error(error);

      document.body.dataset.saveState =
        "error";

    } finally {

      isSaving = false;
    }
  }

  window.addEventListener(
    "construct:workspace-changed",
    () => {

      document.body.dataset.saveState =
        "unsaved";

      clearTimeout(
        autosaveTimeout
      );

      if (!isAutosaveEnabled) {
        return;
      }

      autosaveTimeout =
        setTimeout(
          runAutosave,
          1000
        );
    }
  );
}