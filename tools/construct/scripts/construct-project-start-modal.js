import {
  createProject,
  openProjectFile,
  CURRENT_PROJECT_VERSION,
  createHistorySnapshot,
  clearHistoryState,
  pushHistoryState,
  setProjectAutosaveEnabled,
  createDemoProjectSnapshot,
  setIsProjectLoaded
} from "../hub.js";


export function createModalElement() {
  const overlay =
    document.createElement("div");

  overlay.className =
    "construct-project-start-overlay";

  overlay.innerHTML = `
    <div class="construct-project-start-modal">
      <h1>ConStruct</h1>

      <p>
        Create a new project or open an existing project.
      </p>

      <label class="construct-project-start-autosave">
        <input
          type="checkbox"
          class="construct-project-start-autosave-input"
          checked
        />

        <span>
          Enable autosave
          <strong>(Recommended)</strong>

          <small>
            You can change this later in File menu.
          </small>
        </span>
      </label>

      <div class="construct-project-start-actions">
        <button
          type="button"
          data-action="create-project"
        >
          New Project
        </button>

        <button
          type="button"
          data-action="open-project"
        >
          Open Project
        </button>

        <button
          type="button"
          data-action="open-demo"
        >
          Open Demo
        </button>
      </div>
    </div>
  `;

  return overlay;
}

export async function showProjectStartModal({
  restoreWorkspaceSnapshot
} = {}) {
  return new Promise((resolve) => {
    const overlay =
      createModalElement();

    const autosaveInput =
      overlay.querySelector(
        ".construct-project-start-autosave-input"
      );

    setProjectAutosaveEnabled(
      autosaveInput?.checked
    );  

    const stage =
      document.querySelector(".construct-stage");

    if (!stage) {
      resolve(null);
      return;
    }

    stage.appendChild(overlay);

    autosaveInput?.addEventListener(
      "change",
      () => {
        setProjectAutosaveEnabled(
          autosaveInput.checked
        );
      }
    );

    overlay.addEventListener("click", async (event) => {
      const button =
        event.target.closest("button");

      if (!button) {
        return;
      }

      const action =
        button.dataset.action;

      try {
        if (action === "create-project") {
          await createProject();

          overlay.remove();

          resolve({
            mode: "create"
          });

          return;
        }

        if (action === "open-project") {
          const projectFileHandle =
            await openProjectFile();

          if (!projectFileHandle) {
            return;
          }

          const file =
            await projectFileHandle.getFile();

          const text =
            await file.text();

          const data =
            JSON.parse(text);

          if (
            data.app !== "RichardCore.ConStruct" ||
            data.version > CURRENT_PROJECT_VERSION
          ) {
            window.alert(
              "This is not a valid ConStruct project file."
            );

            return;
          }

          setIsProjectLoaded(false);

          restoreWorkspaceSnapshot?.(data);

          setIsProjectLoaded(true);

          clearHistoryState();

          pushHistoryState(
            createHistorySnapshot()
          );

          window.dispatchEvent(
            new Event(
              "construct:workspace-changed"
            )
          );

          overlay.remove();

          resolve({
            mode: "open",
            projectFileHandle
          });
        }

        if (action === "open-demo") {

          restoreWorkspaceSnapshot?.(
            createDemoProjectSnapshot()
          );

          overlay.remove();

          resolve({
            mode: "demo"
          });

          return;
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error(error);
        }
      }
    });
  });
}