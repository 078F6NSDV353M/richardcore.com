import {
  setCurrentProjectDirectoryHandle,
  setCurrentProjectFileHandle,
  setCurrentImagesDirectoryHandle,
  setIsProjectLoaded,
  getCurrentProjectFileHandle,
  showConstructPrompt
} from "../hub.js";


export async function createProject() {

  const directoryHandle =
    await window.showDirectoryPicker();

  const constructDirectoryHandle =
    await directoryHandle.getDirectoryHandle(
      "_sources",
      {
        create: true
      }
    );

  const imagesDirectoryHandle =
    await constructDirectoryHandle.getDirectoryHandle(
      "images",
      {
        create: true
      }
    );

  await constructDirectoryHandle.getDirectoryHandle(
    "exports",
    {
      create: true
    }
  );

  const rawProjectName =
    await showConstructPrompt({
      title: "Create Project",
      message:
        "Enter project name.",
      value: "project",
      placeholder:
        "Project name"
    });

  if (!rawProjectName) {
    return null;
  }

  const safeProjectName =
    rawProjectName
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-");

  if (!safeProjectName) {
    return null;
  }

  const projectFileName =
    safeProjectName.endsWith(".construct")
      ? safeProjectName
      : `${safeProjectName}.construct`;

  const projectFileHandle =
    await directoryHandle.getFileHandle(
      projectFileName,
      {
        create: true
      }
    );

  setCurrentProjectDirectoryHandle(
    directoryHandle
  );

  setCurrentImagesDirectoryHandle(
    imagesDirectoryHandle
  );

  setCurrentProjectFileHandle(
    projectFileHandle
  );

  document.body.dataset.projectName =
    projectFileHandle.name || "project.construct";

  window.dispatchEvent(
    new Event(
      "construct:project-changed"
    )
  );

  setIsProjectLoaded(true);

  return {
    directoryHandle,
    imagesDirectoryHandle,
    projectFileHandle
  };
}

export async function openProjectFile() {

  const projectDirectoryHandle =
    await window.showDirectoryPicker();

  if (!projectDirectoryHandle) {
    return null;
  }

  let projectFileHandle =
    null;

  for await (
    const [
      name,
      handle
    ] of projectDirectoryHandle.entries()
  ) {

    if (
      handle.kind === "file" &&
      name.endsWith(".construct")
    ) {
      projectFileHandle =
        handle;

      break;
    }
  }

  if (!projectFileHandle) {

    window.alert(
      "No .construct project file found in this folder."
    );

    return null;
  }

  const constructDirectoryHandle =
    await projectDirectoryHandle.getDirectoryHandle(
      "_sources",
      {
        create: true
      }
    );

  const imagesDirectoryHandle =
    await constructDirectoryHandle.getDirectoryHandle(
      "images",
      {
        create: true
      }
    );

  await constructDirectoryHandle.getDirectoryHandle(
    "exports",
    {
      create: true
    }
  );

  setCurrentProjectDirectoryHandle(
    projectDirectoryHandle
  );

  setCurrentImagesDirectoryHandle(
    imagesDirectoryHandle
  );

  setCurrentProjectFileHandle(
    projectFileHandle
  );

  document.body.dataset.projectName =
    projectFileHandle.name || "project.construct";

  window.dispatchEvent(
    new Event(
      "construct:project-changed"
    )
  );

  return projectFileHandle;
}

export async function saveProjectFile(
  json
) {

  const fileHandle =
    getCurrentProjectFileHandle();

  if (!fileHandle) {
    return saveProjectFileAs(json);
  }

  const writable =
    await fileHandle.createWritable();

  await writable.write(json);
  await writable.close();
}

export async function saveProjectFileAs(
  json
) {

  const fileHandle =
    await window.showSaveFilePicker({
      suggestedName:
        "project.construct",

      types: [
        {
          description:
            "ConStruct Project",

          accept: {
            "application/json": [
              ".construct"
            ]
          }
        }
      ]
    });

  if (!fileHandle) {
    return;
  }

  setCurrentProjectFileHandle(
    fileHandle
  );

  const writable =
    await fileHandle.createWritable();

  await writable.write(json);
  await writable.close();
}