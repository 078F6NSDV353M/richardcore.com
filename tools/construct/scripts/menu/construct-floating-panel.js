import {
  state,
  createWorkspaceSnapshot,
  createHistorySnapshot,
  restoreWorkspaceState,
  CURRENT_PROJECT_VERSION,
  clearHistoryState,
  pushHistoryState,
  clampZoom,
  fitWorkspaceToContent,
  applyTransform,
  togglePresentationMode,
  createProject,
  openProjectFile,
  saveProjectFile,
  saveProjectFileAs,
  showExportStatus,
  hideExportStatus,
  getCurrentImagesDirectoryHandle,
  copyProjectImageAssets,
  getProjectAutosaveEnabled,
  setProjectAutosaveEnabled,
  updateAllConnections
} from "../../hub.js";

let currentProjectFileHandle = null;

export async function renderGraphToPngDataUrl() {
  const stage =
    document.querySelector(".construct-stage");

  const world =
    document.querySelector(".construct-world");

  const exportItems =
    [
      ...document.querySelectorAll(".construct-node"),
      ...document.querySelectorAll(".construct-text-label")
    ];

  if (
    !stage ||
    !world ||
    !exportItems.length ||
    !window.htmlToImage
  ) {
    return;
  }

  const EXPORT_PADDING = 200;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  exportItems.forEach((item) => {
    const left =
      parseFloat(item.style.left) || 0;

    const top =
      parseFloat(item.style.top) || 0;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);

    maxX = Math.max(
      maxX,
      left + item.offsetWidth
    );

    maxY = Math.max(
      maxY,
      top + item.offsetHeight
    );
  });

  const exportWidth =
    maxX - minX + EXPORT_PADDING * 2;

  const exportHeight =
    maxY - minY + EXPORT_PADDING * 2;

  const exportStage =
    stage.cloneNode(true);

  exportStage.style.position =
    "fixed";

  exportStage.style.left =
    "0";

  exportStage.style.top =
    "0";

  exportStage.style.zIndex =
    "-1";

  exportStage.style.pointerEvents =
    "none";

  exportStage.style.width =
    `${exportWidth}px`;

  exportStage.style.height =
    `${exportHeight}px`;

  exportStage.style.overflow =
    "hidden";

  const exportWorld =
    exportStage.querySelector(
      ".construct-world"
    );

  if (!exportWorld) {
    return null;
  }

  exportWorld.style.transition =
    "none";

  exportWorld.style.transform =
    `translate(${(-minX + EXPORT_PADDING)}px, ${(-minY + EXPORT_PADDING)}px) scale(1)`;

  document.body.appendChild(exportStage);

  try {
    return await window.htmlToImage.toPng(
      exportStage,
      {
        cacheBust: true,
        pixelRatio: 2,

        width: exportWidth,
        height: exportHeight,

        canvasWidth:
          exportWidth * 2,

        canvasHeight:
          exportHeight * 2,

        backgroundColor:
          "#111111",

        fontEmbedCSS: "",

        filter: (node) => {
          return !(
            node.classList?.contains(
              "construct-floating-panel-group"
            ) ||
            node.classList?.contains(
              "construct-presentation-trigger"
            )
          );
        },
      }
    );
  } finally {
    exportStage.remove();
  }
}

export function initFloatingPanel({
  undo,
  redo,
  restoreWorkspaceSnapshot
}) {
  const stage =
    document.querySelector(".construct-stage");

  if (!stage) return;

  const panelGroup =
    document.createElement("div");

  const projectLabel =
    document.createElement("div");

  projectLabel.className =
    "construct-project-label";

  projectLabel.textContent =
    "Demo project";  

  panelGroup.className =
    "construct-floating-panel-group";

  const panel =
    document.createElement("div");

  const fileDropdown =
    document.createElement("div");

  fileDropdown.className =
    "construct-floating-file-dropdown construct-menu";

  fileDropdown.hidden = true;

  fileDropdown.innerHTML = `
    <button class="construct-menu-button" type="button" data-action="new">
      <i data-lucide="file-plus"></i>
      <span>New</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="open">
      <i data-lucide="folder-open"></i>
      <span>Open</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="save">
      <i data-lucide="save"></i>
      <span>Save</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="save-as">
      <i data-lucide="save-all"></i>
      <span>Save As</span>
    </button>

    <div class="construct-menu-separator"></div>

    <button class="construct-menu-button" type="button" data-action="export-png">
      <i data-lucide="image-down"></i>
      <span>Export PNG</span>
    </button>

    <div class="construct-menu-separator"></div>

    <label class="construct-floating-autosave">
      <input
        class="construct-floating-autosave-input"
        type="checkbox"
      />

      <span>Autosave</span>
    </label>
  `;

  stage.appendChild(fileDropdown);  

  panel.className =
    "construct-floating-panel";

  const searchPanel =
    document.createElement("div");

  searchPanel.className =
    "construct-floating-search-panel";

  panel.innerHTML = `
    <div class="construct-floating-file-menu">
      <button
        class="construct-menu-button"
        type="button"
        data-action="toggle-file-menu"
      >
        <i data-lucide="folder"></i>
        <span>File</span>
      </button>

    </div>

    <div class="construct-floating-panel-separator"></div>

    <button
      class="construct-floating-icon-button"
      type="button"
      data-action="undo"
      title="Undo"
    >
      <i data-lucide="undo-2"></i>
    </button>

    <button
      class="construct-floating-icon-button"
      type="button"
      data-action="redo"
      title="Redo"
    >
      <i data-lucide="redo-2"></i>
    </button>

    <div class="construct-floating-panel-separator"></div>

    <button
      class="construct-menu-button"
      type="button"
      data-action="presentation"
    >
      <i data-lucide="presentation"></i>
      <span>Presentation</span>
    </button>

    <input
      class="construct-floating-panel-file"
      type="file"
      accept=".construct,application/json,.json"
    />
  `;

  searchPanel.innerHTML = `
    <div class="construct-floating-zoom-controls">

      <button type="button" data-action="zoom-out" title="Zoom out">
        <i data-lucide="zoom-out"></i>
      </button>

      <input
        class="construct-floating-zoom-input"
        type="text"
        value="100%"
        inputmode="numeric"
      />

      <button type="button" data-action="zoom-in" title="Zoom in">
        <i data-lucide="zoom-in"></i>
      </button>

      <div class="construct-floating-panel-separator"></div>

      <button type="button" data-action="fit" title="Fit workspace">
        <i data-lucide="expand"></i>
      </button>

    </div>

    <div class="construct-floating-panel-separator"></div>

    <input
      class="construct-floating-panel-search"
      type="search"
      placeholder="Search nodes"
    />
  `;

  const presentationTrigger =
    document.createElement("div");

  presentationTrigger.className =
    "construct-presentation-trigger";

  stage.appendChild(
    presentationTrigger
  );

  panelGroup.appendChild(panel);
  panelGroup.appendChild(projectLabel);
  panelGroup.appendChild(searchPanel);

  stage.appendChild(panelGroup);
  window.lucide?.createIcons();

  const fileInput =
    panel.querySelector(".construct-floating-panel-file");

  const fileMenu =
    panel.querySelector(
      ".construct-floating-file-menu"
    );

  const autosaveInput =
    fileDropdown.querySelector(
      ".construct-floating-autosave-input"
    );

  if (autosaveInput) {
    autosaveInput.checked =
      getProjectAutosaveEnabled();

    autosaveInput.addEventListener(
      "change",
      () => {
        setProjectAutosaveEnabled(
          autosaveInput.checked
        );
      }
    );
  }

  window.addEventListener(
    "construct:autosave-changed",
    () => {
      if (!autosaveInput) {
        return;
      }

      autosaveInput.checked =
        getProjectAutosaveEnabled();
    }
  );

  const searchInput =
    searchPanel.querySelector(
      ".construct-floating-panel-search"
    );

  const zoomInput =
    searchPanel.querySelector(
      ".construct-floating-zoom-input"
    );

  const storageFill =
    searchPanel.querySelector(
      ".construct-storage-fill"
    );

  const storageText =
    searchPanel.querySelector(
      ".construct-storage-text"
    );  

  function updateZoomInput() {
    if (!zoomInput) {
      return;
    }

    zoomInput.value =
      `${Math.round(state.zoom * 100)}%`;
  }

  async function updateStorageIndicator() {
    if (
      !navigator.storage?.estimate ||
      !storageFill ||
      !storageText
    ) {
      return;
    }

    try {
      let usage = 0;

      Object.keys(localStorage)
        .filter((key) =>
          key.startsWith("construct-")
        )
        .forEach((key) => {
          usage +=
            key.length +
            localStorage.getItem(key).length;
        });

      const quota =
        5 * 1024 * 1024;

      const percent =
        Math.min(
          100,
          (usage * 2 / quota) * 100
        );

      storageFill.style.width =
        `${percent}%`;

      storageText.textContent =
        `Storage ${percent.toFixed(1)}%`;
    } catch (error) {
      console.error(error);
    }
  }

  function setZoomFromPercent(percent) {
    const stage =
      document.querySelector(".construct-stage");

    const nextZoom =
      clampZoom(percent / 100);

    if (!stage) {
      state.zoom = nextZoom;
      applyTransform();
      updateAllConnections();
      return;
    }

    const rect =
      stage.getBoundingClientRect();

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const worldCenterX =
      (centerX - state.panX) / state.zoom;

    const worldCenterY =
      (centerY - state.panY) / state.zoom;

    state.zoom = nextZoom;

    state.panX =
      centerX - worldCenterX * state.zoom;

    state.panY =
      centerY - worldCenterY * state.zoom;

    applyTransform();
    updateAllConnections();

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    updateZoomInput();
    updateStorageIndicator();
  }

  updateZoomInput();
  updateStorageIndicator();

  searchInput?.addEventListener("input", () => {
    const query =
      searchInput.value
        .trim()
        .toLowerCase();

    const exportItems =
      [
        ...document.querySelectorAll(
          ".construct-node"
        ),
        ...document.querySelectorAll(
          ".construct-text-label"
        )
      ];

    document.body.classList.remove(
      "construct-search-active"
    );

    exportItems.forEach((node) => {
      node.classList.remove(
        "is-search-match",
        "is-selected"
      );
    });

    document.body.classList.toggle(
      "construct-search-active",
      Boolean(query)
    );

    if (!query) {
      return;
    }

    exportItems.forEach((node) => {
      const titleElement =
        node.querySelector(
          ".construct-node-title"
        );

      const textElement =
        node.querySelector(
          ".construct-node-text"
        );

      const title =
        titleElement?.innerText || "";

      const text =
        textElement &&
        textElement.offsetParent !== null
          ? textElement.innerText
          : "";

      const searchableText =
        `${title} ${text}`
          .trim()
          .toLowerCase();

      if (
        !searchableText.includes(query)
      ) {
        return;
      }

      node.classList.add(
        "is-search-match",
        "is-selected"
      );
    });
  });

  document.addEventListener(
    "mousedown",
    (event) => {
      if (
        event.target.closest(
          ".construct-floating-search-panel"
        )
      ) {
        return;
      }

      if (!searchInput?.value) {
        return;
      }

      searchInput.value = "";

      document.body.classList.remove(
        "construct-search-active"
      );

      document
        .querySelectorAll(
          ".construct-node"
        )
        .forEach((node) => {
          node.classList.remove(
            "is-search-match",
            "is-selected"
          );
        });
    },
    true
  );

  panel.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });

  panel.addEventListener("dblclick", (event) => {
    event.stopPropagation();
  });

  searchPanel.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });

  searchPanel.addEventListener("click", (event) => {
    const button =
      event.target.closest("button");

    if (!button) {
      return;
    }

    event.stopPropagation();

    const action =
      button.dataset.action;

    if (action === "whiteboard-close") {
      const overlay =
        document.querySelector(
          ".construct-whiteboard-overlay"
        );

      if (overlay) {
        overlay.hidden = true;
      }

      return;
    }  

    if (action === "zoom-out") {
      setZoomFromPercent(
        Math.round(state.zoom * 100) - 10
      );

      return;
    }

    if (action === "zoom-in") {
      setZoomFromPercent(
        Math.round(state.zoom * 100) + 10
      );

      return;
    }

    if (action === "fit") {
      fitWorkspaceToContent();

      updateZoomInput();
      updateStorageIndicator();

      return;
    }
  });

  zoomInput?.addEventListener("change", () => {
    const value =
      Number(
        zoomInput.value.replace("%", "")
      );

    if (!Number.isFinite(value)) {
      updateZoomInput();
      updateStorageIndicator();
      return;
    }

    setZoomFromPercent(value);
  });

  window.addEventListener(
    "construct:workspace-changed",
    updateZoomInput
  );

  searchPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  searchPanel.addEventListener("dblclick", (event) => {
    event.stopPropagation();
  });

  async function handleFloatingPanelAction(event) {
    const button =
      event.target.closest("button");

    if (!button) return;

    event.stopPropagation();

    const action =
      button.dataset.action;

    if (
      action === "toggle-file-menu"
    ) {

      const isHidden =
        fileDropdown.hidden;

      if (!isHidden) {
        fileDropdown.hidden = true;
        return;
      }

      const rect =
        button.getBoundingClientRect();

      const stageRect =
        stage.getBoundingClientRect();

      fileDropdown.style.left =
        `${rect.left - stageRect.left - 6}px`;

      fileDropdown.style.top =
        `${rect.bottom - stageRect.top + 8}px`;

      fileDropdown.hidden = false;

      return;
    }

    if (fileDropdown) {
      fileDropdown.hidden = true;
    }

    if (action === "new") {
      await createProject();

      restoreWorkspaceSnapshot({
        app: "RichardCore.ConStruct",
        version: CURRENT_PROJECT_VERSION,
        zoom: 1,
        panX: 0,
        panY: 0,
        gridMode: "dots",
        nodes: [],
        connections: []
      });

      clearHistoryState();

      pushHistoryState(
        createHistorySnapshot()
      );

      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );

      await saveGraphFile({
        saveAs: false
      });

      return;
    }
    
    if (action === "open") {

      const projectFileHandle =
        await openProjectFile();

      if (!projectFileHandle) {
        return;
      }

      const file =
        await projectFileHandle.getFile();

      await openGraphFile({
        file,
        restoreWorkspaceSnapshot
      });

      return;
    }

    if (action === "save") {
      await saveGraphFile();
      return;
    }

    if (action === "export-png") {
      const stage =
        document.querySelector(".construct-stage");

      const world =
        document.querySelector(".construct-world");

      const exportItems =
        [
          ...document.querySelectorAll(".construct-node"),
          ...document.querySelectorAll(".construct-text-label")
        ];

      if (
        !stage ||
        !world ||
        !exportItems.length ||
        !window.htmlToImage
      ) {
        return;
      }

      const EXPORT_PADDING = 120;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      exportItems.forEach((node) => {
        const left =
          parseFloat(node.style.left) || 0;

        const top =
          parseFloat(node.style.top) || 0;

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);

        maxX = Math.max(
          maxX,
          left + node.offsetWidth
        );

        maxY = Math.max(
          maxY,
          top + node.offsetHeight
        );
      });

      const exportWidth =
        maxX - minX + EXPORT_PADDING * 2;

      const exportHeight =
        maxY - minY + EXPORT_PADDING * 2;

      const exportStage =
        stage.cloneNode(true);

      exportStage.style.position =
        "fixed";

      exportStage.style.left =
        "0";

      exportStage.style.top =
        "0";

      exportStage.style.zIndex =
        "-1";

      exportStage.style.pointerEvents =
        "none";

      exportStage.style.width =
        `${exportWidth}px`;

      exportStage.style.height =
        `${exportHeight}px`;

      exportStage.style.overflow =
        "hidden";

      const exportWorld =
        exportStage.querySelector(
          ".construct-world"
        );

      if (!exportWorld) {
        return;
      }

      exportWorld.style.transition =
        "none";

      exportWorld.style.transform =
        `translate(${(-minX + EXPORT_PADDING)}px, ${(-minY + EXPORT_PADDING)}px) scale(1)`;

      document.body.appendChild(exportStage);

      showExportStatus(
        "Preparing PNG export..."
      );

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const originalImages =
        [...document.querySelectorAll(".construct-node img")];

      const exportImages =
        [...exportStage.querySelectorAll(".construct-node img")];

      await Promise.all(
        exportImages.map(async (exportImage, index) => {
          const originalImage =
            originalImages[index];

          if (!originalImage?.src) {
            return;
          }

          const response =
            await fetch(originalImage.src);

          const blob =
            await response.blob();

          const dataUrl =
            await new Promise((resolve) => {
              const reader =
                new FileReader();

              reader.onload = () => {
                resolve(reader.result);
              };

              reader.readAsDataURL(blob);
            });

          exportImage.src =
            dataUrl;
        })
      );

      requestAnimationFrame(async () => {
        try {
          const dataUrl =
            await window.htmlToImage.toPng(
              exportStage,
              {
                cacheBust: true,
                pixelRatio: 2,
                width: exportWidth,
                height: exportHeight,
                canvasWidth: exportWidth * 2,
                canvasHeight: exportHeight * 2,
                backgroundColor: "#111111",
                fontEmbedCSS: "",
                filter: (node) => {
                  return !(
                    node.classList?.contains(
                      "construct-floating-panel-group"
                    ) ||
                    node.classList?.contains(
                      "construct-presentation-trigger"
                    )
                  );
                },
              }
            );

          const response =
            await fetch(dataUrl);

          const blob =
            await response.blob();

          const fileName =
            `construct-export-${Date.now()}.png`;

          if ("showSaveFilePicker" in window) {
            const handle =
              await window.showSaveFilePicker({
                suggestedName:
                  fileName,

                types: [
                  {
                    description:
                      "PNG image",

                    accept: {
                      "image/png": [
                        ".png"
                      ]
                    }
                  }
                ]
              });

            const writable =
              await handle.createWritable();

            await writable.write(blob);
            await writable.close();

            return;
          }

          const link =
            document.createElement("a");

          link.download =
            fileName;

          link.href =
            URL.createObjectURL(blob);

          document.body.appendChild(link);
          link.click();
          link.remove();

          URL.revokeObjectURL(link.href);
        } catch (error) {
          if (
            error?.name !== "AbortError"
          ) {
            console.error(error);
          }
        } finally {
          hideExportStatus();

          exportStage.remove();
        }
      });

      return;
    }
  
    if (action === "undo") {
      undo?.();
      return;
    }

    if (action === "redo") {
      redo?.();
      return;
    }
    
    if (action === "fit") {
      fitWorkspaceToContent();

      updateZoomInput();
      updateStorageIndicator();

      return;
    }

    if (action === "presentation") {
      togglePresentationMode();
      return;
    }

    if (action === "save-as") {
      const sourceImagesDirectoryHandle =
        getCurrentImagesDirectoryHandle();

      const snapshot =
        createWorkspaceSnapshot();

      await createProject();

      await copyProjectImageAssets(
        snapshot,
        sourceImagesDirectoryHandle
      );

      await saveGraphFile({
        saveAs: false
      });

      return;
    }
  }

  panel.addEventListener(
    "click",
    handleFloatingPanelAction
  );

  fileDropdown.addEventListener(
    "click",
    handleFloatingPanelAction
  );

  window.addEventListener(
    "pointerdown",
    (event) => {

      const clickedInsideDropdown =
        event.target.closest(
          ".construct-floating-file-dropdown"
        );

      const clickedFileButton =
        event.target.closest(
          ".construct-floating-file-button"
        );

      if (
        clickedInsideDropdown ||
        clickedFileButton
      ) {
        return;
      }

      fileDropdown.hidden = true;
    },
    true
  );

  window.addEventListener(
    "wheel",
    (event) => {
      const hoveredInsideDropdown =
        event.target.closest(
          ".construct-floating-file-dropdown"
        );

      if (hoveredInsideDropdown) {
        return;
      }

      fileDropdown.hidden = true;
    },
    {
      capture: true,
      passive: true
    }
  );

  function updateProjectLabel() {

    const name =
      document.body.dataset.projectName;

    projectLabel.textContent =
      name || "Demo project";
  }

  updateProjectLabel();

  window.addEventListener(
    "construct:project-changed",
    updateProjectLabel
  );
}

export async function saveGraphFile({
  saveAs = false
} = {}) {
  try {
    const snapshot =
      createWorkspaceSnapshot();

    const json =
      JSON.stringify(snapshot, null, 2);

    if (saveAs) {
      await saveProjectFileAs(json);
      return;
    }

    await saveProjectFile(json);
  } catch (error) {
    console.error(error);
  }
}

export async function openGraphFile({
  file,
  restoreWorkspaceSnapshot
}) {
  try {
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

    restoreWorkspaceSnapshot(data);

    clearHistoryState();

    pushHistoryState(
      createHistorySnapshot()
    );

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  } catch (error) {
    console.error(error);
    window.alert("Failed to open graph file.");
  }
}