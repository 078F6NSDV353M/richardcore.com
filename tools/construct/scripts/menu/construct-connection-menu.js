import {
  state,
  getConnectionsLayer,
  openMultiselectMenu,
  getSelectedConnection,
  setSelectedConnection,
  getSelectedConnections,
  clearSelectedConnections,
  applyConnectionSelection,
  hasMixedSelection,
  removeConnection,
  updateAllConnections,
  getShapeIcon,
  getLineIcon,
  closeAllContextMenus
} from "../../hub.js";


export function updateMenuState(menu) {
  if (!getSelectedConnection()) return;

  const shapeIcon = menu.querySelector('[data-current="shape"]');
  const lineIcon = menu.querySelector('[data-current="line"]');
  const colorIcon = menu.querySelector('[data-current="color"]');

  if (shapeIcon) {
    shapeIcon.innerHTML = "";
    shapeIcon.insertAdjacentHTML(
      "beforeend",
      getShapeIcon(getSelectedConnection().type)
    );
  }

  if (lineIcon) {
    lineIcon.innerHTML = "";
    lineIcon.insertAdjacentHTML(
      "beforeend",
      getLineIcon(getSelectedConnection().style)
    );
  }

  if (colorIcon) {
    const defaultConnectionColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--construct-connection-default")
        .trim();

    colorIcon.style.backgroundColor =
      getSelectedConnection().color || defaultConnectionColor;
  }
}

export function initMenuIcons() {
  const shapeButtons =
    document.querySelectorAll('[data-action="type"]');

  const lineButtons =
    document.querySelectorAll('[data-action="style"]');

  shapeButtons.forEach((button) => {
    const type = button.dataset.value;
    button.innerHTML = getShapeIcon(type);
  });

  lineButtons.forEach((button) => {
    const style = button.dataset.value;
    button.innerHTML = getLineIcon(style);
  });
}

export function applyColorToSelectedConnections(color) {
  if (!color) {
    return;
  }

  getSelectedConnections().forEach((connection) => {
    connection.color = color;
  });

  updateAllConnections();

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export function initConnectionMenu() {
  const menu = document.querySelector(
    ".construct-connection-menu"
  );

  const floatingSubmenu = document.querySelector(
    ".construct-connection-floating-submenu"
  );

  const connectionsLayer = getConnectionsLayer();

  if (!menu || !connectionsLayer) return;

  [
    "pointerdown",
    "mousedown",
    "dblclick",
    "contextmenu"
  ].forEach((eventName) => {
    menu.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );

    floatingSubmenu?.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );
  });

  menu.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    },
    false
  );

  floatingSubmenu?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    },
    false
  );

  menu.innerHTML = `
    <div class="construct-connection-menu-item">

      <button class="construct-connection-menu-trigger" type="button" title="Color">
        <span
          class="construct-connection-menu-icon construct-connection-menu-color-current"
          data-current="color"
        ></span>
      </button>

      <div class="construct-connection-submenu construct-connection-submenu-color">

        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#FF2E7B" style="background:#FF2E7B;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#FF3636" style="background:#FF3636;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#FF8000" style="background:#FF8000;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#FFEA00" style="background:#FFEA00;"></button>

        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#BFFF00" style="background:#BFFF00;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#00FF40" style="background:#00FF40;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#00FFCC" style="background:#00FFCC;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#00D0FF" style="background:#00D0FF;"></button>

        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#0095FF" style="background:#0095FF;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#5768FF" style="background:#5768FF;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#9B30FF" style="background:#9B30FF;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#FF2ED5" style="background:#FF2ED5;"></button>
        
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#ffffff" style="background:#ffffff;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#808080" style="background:#808080;"></button>
        <button class="construct-connection-menu-color" type="button" data-action="color" data-value="#000000" style="background:#000000;"></button>
      </div>

    </div>

    <div class="construct-connection-menu-item">

      <button class="construct-connection-menu-trigger" type="button" title="Shape">
        <span
          class="construct-connection-menu-icon"
          data-current="shape"
        ></span>
      </button>

      <div class="construct-connection-submenu construct-connection-submenu-shape">

        <button class="construct-connection-menu-button" type="button" data-action="type" data-value="straight"></button>
        <button class="construct-connection-menu-button" type="button" data-action="type" data-value="bezier"></button>
        <button class="construct-connection-menu-button" type="button" data-action="type" data-value="orthogonal"></button>

      </div>

    </div>

    <div class="construct-connection-menu-item">

      <button class="construct-connection-menu-trigger" type="button" title="Line">
        <span
          class="construct-connection-menu-icon"
          data-current="line"
        ></span>
      </button>

      <div class="construct-connection-submenu construct-connection-submenu-line">

        <button class="construct-connection-menu-button" type="button" data-action="style" data-value="solid"></button>
        <button class="construct-connection-menu-button" type="button" data-action="style" data-value="dashed"></button>
        <button class="construct-connection-menu-button" type="button" data-action="style" data-value="dotted"></button>
        <button class="construct-connection-menu-button" type="button" data-action="style" data-value="dashdot"></button>
        <button class="construct-connection-menu-button" type="button" data-action="style" data-value="double"></button>

      </div>

    </div>

    <button
      class="construct-connection-menu-delete"
      type="button"
      data-action="delete"
      title="Delete"
    >
      <span class="construct-connection-menu-icon">
        <i data-lucide="trash-2"></i>
      </span>
    </button>
  `;

  initMenuIcons();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  connectionsLayer.addEventListener(
    "mousedown",
    (event) => {

      if (event.button !== 2) {
        return;
      }

      const target =
        event.target;

      if (!(target instanceof SVGElement)) {
        return;
      }

      const path =
        target.classList.contains(
          "construct-connection-line"
        ) ||
        target.classList.contains(
          "construct-connection-hit-area"
        )
          ? target
          : target.closest(
              ".construct-connection-line, " +
              ".construct-connection-hit-area"
            );

      if (!path) {
        clearSelectedConnections();
        menu.style.display = "none";
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      closeAllContextMenus();

      if (
        hasMixedSelection() &&
        getSelectedConnections().includes(
          path.__connection
        )
      ) {

        menu.style.display = "none";

        openMultiselectMenu(
          event.clientX,
          event.clientY
        );

        return;
      }

      if (
        hasMixedSelection() &&
        !getSelectedConnections().includes(
          path.__connection
        )
      ) {
        closeAllContextMenus();
      }

      if (
        !getSelectedConnections().includes(
          path.__connection
        )
      ) {
        applyConnectionSelection(
          path.__connection
        );
      }

      setSelectedConnection(
        path.__connection
      );

      updateMenuState(menu);

      menu.style.display = "flex";
      menu.style.left = "0px";
      menu.style.top = "0px";

      const rect =
        menu.getBoundingClientRect();

      const stage =
        document.querySelector(
          ".construct-stage"
        );

      const toolbar =
        document.querySelector(
          ".construct-toolbar"
        );

      const stageRect =
        stage?.getBoundingClientRect();

      const toolbarRect =
        toolbar?.getBoundingClientRect();

      const minX =
        stageRect
          ? stageRect.left
          : 0;

      const minY =
        stageRect
          ? stageRect.top
          : 0;

      const rightLimit =
        stageRect &&
        toolbarRect &&
        !toolbar.hidden
          ? Math.min(
              stageRect.right,
              toolbarRect.left
            )
          : stageRect
            ? stageRect.right
            : window.innerWidth;

      const maxX =
        rightLimit - rect.width;

      const maxY =
        stageRect
          ? stageRect.bottom - rect.height
          : window.innerHeight - rect.height;

      const finalX = Math.min(
        Math.max(
          event.clientX,
          minX
        ),
        Math.max(minX, maxX)
      );

      const finalY = Math.min(
        Math.max(
          event.clientY,
          minY
        ),
        Math.max(minY, maxY)
      );

      menu.style.left =
        `${finalX}px`;

      menu.style.top =
        `${finalY}px`;

      const submenuWidth = 140;

      const shouldOpenLeft =
        finalX +
        rect.width +
        submenuWidth >
        rightLimit;

      menu.classList.toggle(
        "is-submenu-left",
        shouldOpenLeft
      );
    },
    true
  );

  connectionsLayer.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  connectionsLayer.addEventListener(
    "mousedown",
    (event) => {
      if (event.button !== 0) {
        return;
      }

      const multiselectMenu =
        document.querySelector(
          ".construct-multiselect-menu"
        );

      if (
        multiselectMenu &&
        !multiselectMenu.hidden
      ) {
        multiselectMenu.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const target =
        event.target;

      if (!(target instanceof SVGElement)) {
        return;
      }

      const path =
        target.classList.contains(
          "construct-connection-line"
        ) ||
        target.classList.contains(
          "construct-connection-hit-area"
        )
          ? target
          : target.closest(
              ".construct-connection-line, " +
              ".construct-connection-hit-area"
            );

      if (!path?.__connection) {
        clearSelectedConnections();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      applyConnectionSelection(
        path.__connection,
        {
          additive:
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        }
      );

      menu.style.display = "none";
    },
    true
  );

  window.addEventListener("mousedown", (event) => {
    if (event.button === 2) {
      if (
        hasMixedSelection() &&
        event.target.closest(
          ".construct-node.is-selected"
        )
      ) {
        return;
      }

      return;
    }

    if (hasMixedSelection()) {
      return;
    }

    if (
      event.target.closest(".construct-connection-menu") ||
      event.target.closest(".construct-connection-floating-submenu")
    ) {
      return;
    }

    const clickedConnection =
      event.target.closest(
        ".construct-connection-line, " +
        ".construct-connection-hit-area"
      );

    if (clickedConnection) {
      return;
    }

    clearSelectedConnections();
    menu.style.display = "none";
  });

  menu.addEventListener("mouseover", (event) => {
    const item = event.target.closest(
      ".construct-connection-menu-item"
    );

    if (!item) {
      if (floatingSubmenu) {
        floatingSubmenu.style.display = "none";
      }

      return;
    }

    if (!floatingSubmenu) {
      return;
    }

    const submenu = item.querySelector(
      ".construct-connection-submenu"
    );

    if (!submenu) {
      floatingSubmenu.style.display = "none";
      return;
    }

    floatingSubmenu.innerHTML = submenu.innerHTML;
    floatingSubmenu.className =
      `construct-connection-floating-submenu ${[...submenu.classList].join(" ")}`;

    floatingSubmenu.style.display = "grid";

    const itemRect = item.getBoundingClientRect();
    const submenuRect =
      floatingSubmenu.getBoundingClientRect();

    const toolbar = document.querySelector(
      ".construct-toolbar"
    );

    const toolbarRect =
      toolbar?.getBoundingClientRect();

    const stage = document.querySelector(
      ".construct-stage"
    );

    const stageRect =
      stage?.getBoundingClientRect();

    const rightLimit =
      toolbarRect && !toolbar.hidden
        ? toolbarRect.left
        : stageRect.right;

    const shouldOpenLeft =
      itemRect.right + submenuRect.width + 6 >
      rightLimit;

    floatingSubmenu.style.left = shouldOpenLeft
      ? `${itemRect.left - submenuRect.width - 6}px`
      : `${itemRect.right + 6}px`;

    const submenuTopOffset =
      submenu.classList.contains("construct-connection-submenu-color")
        ? 0
        : -8;

    floatingSubmenu.style.top =
      `${itemRect.top + submenuTopOffset}px`;
  });

  let submenuCloseTimer = null;

  function scheduleFloatingSubmenuClose() {
    submenuCloseTimer = window.setTimeout(() => {
      floatingSubmenu.style.display = "none";
    }, 180);
  }

  function cancelFloatingSubmenuClose() {
    if (!submenuCloseTimer) return;

    window.clearTimeout(submenuCloseTimer);
    submenuCloseTimer = null;
  }

  menu.addEventListener("mouseleave", () => {
    scheduleFloatingSubmenuClose();
  });

  floatingSubmenu.addEventListener("mouseenter", () => {
    cancelFloatingSubmenuClose();
  });

  floatingSubmenu.addEventListener("mouseleave", () => {
    scheduleFloatingSubmenuClose();
  });

  floatingSubmenu.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button || !getSelectedConnection()) {
      return;
    }

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (!action || !value) return;

    getSelectedConnections().forEach((connection) => {

      if (action === "type") {
        connection.type = value;
      }

      if (action === "style") {
        connection.style = value;
      }

      if (action === "color") {
        connection.color = value;
      }

    });

    updateAllConnections();
    updateMenuState(menu);

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    floatingSubmenu.style.display = "none";
  });

  menu.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button || !getSelectedConnection()) {
      return;
    }

    if (
      button.classList.contains(
        "construct-connection-menu-trigger"
      )
    ) {
      return;
    }

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action !== "delete" && !value) {
      return;
    }

    getSelectedConnections().forEach((connection) => {

      if (action === "type") {
        connection.type = value;
      }

      if (action === "style") {
        connection.style = value;
      }

      if (action === "color") {
        connection.color = value;
      }

    });

    if (action === "delete") {

      const connectionsToDelete =
        [...getSelectedConnections()];

      connectionsToDelete.forEach(
        (connection) => {

          connection.line?.remove();

          connection.line2?.remove();

          connection.hitLine?.remove();

          connection.arrow?.remove();

          connection.startDot?.remove();

          connection.endDot?.remove();

        }
      );

      state.connections =
        state.connections.filter(
          (connection) =>
            !connectionsToDelete.includes(
              connection
            )
        );

      clearSelectedConnections();

      menu.style.display = "none";

      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );

      return;
    }

    updateAllConnections();
    updateMenuState(menu);

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  });

  window.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Delete" &&
        event.key !== "Backspace"
      ) {
        return;
      }

      const connections =
        getSelectedConnections();

      if (
        connections.length === 0
      ) {
        return;
      }

      event.preventDefault();

      [...connections].forEach(
        (connection) => {
          removeConnection(
            connection,
            {
              skipSave: true
            }
          );
        }
      );

      clearSelectedConnections();

      window.dispatchEvent(
        new Event(
          "construct:workspace-changed"
        )
      );
    }
  );
}