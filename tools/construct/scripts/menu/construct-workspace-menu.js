import {
  state,
  getStage,
  screenToWorld,
  applyTransform,
  pasteClipboard,
  createTextLabel,
  createZone,
  closeAllContextMenus
} from "../../hub.js";

let workspaceMenuElement = null;
let workspaceMenuActionHandler = null;

export function ensureWorkspaceContextMenu() {
  if (workspaceMenuElement) {
    return workspaceMenuElement;
  }

  workspaceMenuElement =
    document.createElement("div");

  workspaceMenuElement.className =
    "construct-workspace-menu construct-menu";

  workspaceMenuElement.hidden = true;

  document
    .querySelector(".construct-stage")
    ?.appendChild(workspaceMenuElement);

  workspaceMenuElement.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    }
  );

  workspaceMenuElement.addEventListener(
    "click",
    (event) => {
      const item =
        event.target.closest(
          "[data-action]"
        );

      if (!item) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const action =
        item.dataset.action;

      workspaceMenuElement.hidden = true;

      workspaceMenuActionHandler?.(
        action
      );
    }
  );

  return workspaceMenuElement;
}

export function initWorkspaceContextMenu({
  createNode
}) {
  document.addEventListener("contextmenu", (event) => {
    const stage =
      getStage();

    if (!stage) {
      return;
    }

    if (!stage.contains(event.target)) {
      return;
    }

    if (
      event.target.closest(
        ".construct-node, " +
        ".construct-text-label, " +
        ".construct-zone, " +
        ".construct-workspace-menu"
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    closeAllContextMenus();

    const rect =
      stage.getBoundingClientRect();

    const screenX =
      event.clientX - rect.left;

    const screenY =
      event.clientY - rect.top;

    const worldPoint =
      screenToWorld(
        screenX,
        screenY
      );

    openWorkspaceContextMenu(
      event.clientX,
      event.clientY,
      {
        onAction: (action) => {
          if (action === "Create text node") {
            createNode(
              worldPoint.x,
              worldPoint.y,
              {
                type: "text"
              }
            );

            return;
          }

          if (action === "Create image node") {
            createNode(
              worldPoint.x,
              worldPoint.y,
              {
                type: "image"
              }
            );

            return;
          }

          if (action === "Create multi node") {
            createNode(
              worldPoint.x,
              worldPoint.y,
              {
                type: "multi"
              }
            );

            return;
          }

          if (action === "Create text label") {
            createTextLabel({
              x: worldPoint.x,
              y: worldPoint.y
            });

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );

            return;
          }

          if (action === "Create rectangle zone") {
            createZone({
              x: worldPoint.x,
              y: worldPoint.y,
              width: 500,
              height: 300,
              shape: "rect"
            });

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );

            return;
          }

          if (action === "Create circle zone") {
            createZone({
              x: worldPoint.x,
              y: worldPoint.y,
              width: 300,
              height: 300,
              shape: "circle"
            });

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );

            return;
          }

          if (action === "Paste") {
            pasteClipboard({
              createNode,
              worldX: worldPoint.x,
              worldY: worldPoint.y
            });

            return;
          }

          if (action === "Grid dots") {
            state.gridMode = "dots";
            applyTransform();

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );

            return;
          }

          if (action === "Grid lines") {
            state.gridMode = "lines";
            applyTransform();

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );

            return;
          }

          if (action === "Grid none") {
            state.gridMode = "none";
            applyTransform();

            window.dispatchEvent(
              new Event(
                "construct:workspace-changed"
              )
            );
          }
        }
      }
    );
  });
}

export function openWorkspaceContextMenu(
  clientX,
  clientY,
  helpers = {}
) {
  const menu =
    ensureWorkspaceContextMenu();

  if (!menu) {
    return;
  }

  workspaceMenuActionHandler =
    helpers.onAction || null;

  menu.hidden = false;
  menu.style.left = "0px";
  menu.style.top = "0px";

  menu.innerHTML = `
    <div class="construct-menu-label">Add node</div>

    <button class="construct-menu-button" type="button" data-action="Create text node" title="Create text node">
      <i data-lucide="file-text"></i>
      <span>Text node</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Create image node" title="Create image node">
      <i data-lucide="image"></i>
      <span>Image node</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Create multi node" title="Create multi node">
      <i data-lucide="layers-3"></i>
      <span>Multi node</span>
    </button>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Add objects</div>

    <button class="construct-menu-button" type="button" data-action="Create text label" title="Create text label">
      <i data-lucide="type"></i>
      <span>Text label</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Create rectangle zone" title="Create rectangle zone">
      <i data-lucide="rectangle-horizontal"></i>
      <span>Rectangle zone</span>
    </button>

    <button class="construct-menu-button" type="button" data-action="Create circle zone" title="Create circle zone">
      <i data-lucide="circle"></i>
      <span>Circle zone</span>
    </button>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Clipboard</div>

    <button class="construct-menu-button" type="button" data-action="Paste" title="Paste">
      <i data-lucide="clipboard-paste"></i>
      <span>Paste</span>
    </button>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Grid type</div>

    <div class="construct-workspace-grid-modes">
      <button class="construct-menu-button" type="button" data-action="Grid dots">
        <i data-lucide="grip"></i>
      </button>

      <button class="construct-menu-button" type="button" data-action="Grid lines">
        <i data-lucide="grid-3x3"></i>
      </button>

      <button class="construct-menu-button" type="button" data-action="Grid none">
        <i data-lucide="square"></i>
      </button>
    </div>
  `;

  window.lucide?.createIcons();

  const rect =
    menu.getBoundingClientRect();

  const stage =
    document.querySelector(
      ".construct-stage"
    );

  const stageRect =
    stage?.getBoundingClientRect();

  const minX =
    stageRect ? stageRect.left : 0;

  const minY =
    stageRect ? stageRect.top : 0;

  const maxX =
    stageRect
      ? stageRect.right - rect.width
      : window.innerWidth - rect.width;

  const maxY =
    stageRect
      ? stageRect.bottom - rect.height
      : window.innerHeight - rect.height;

  menu.style.left =
    `${Math.min(
      Math.max(clientX, minX),
      Math.max(minX, maxX)
    )}px`;

  menu.style.top =
    `${Math.min(
      Math.max(clientY, minY),
      Math.max(minY, maxY)
    )}px`;
}