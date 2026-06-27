export function closeConnectionMenu() {
  const menu =
    document.querySelector(
      ".construct-connection-menu"
    );

  const submenu =
    document.querySelector(
      ".construct-connection-floating-submenu"
    );

  if (menu) {
    menu.style.display = "none";
  }

  if (submenu) {
    submenu.style.display = "none";
  }
}

export function closeWorkspaceMenu() {
  document
    .querySelectorAll(
      ".construct-workspace-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
    });
}

export function closeNodeMenu() {
  document
    .querySelectorAll(
      ".construct-node-context-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
      menu.style.left = "";
      menu.style.top = "";
    });
}

export function closeZoneMenuGlobal() {
  document
    .querySelectorAll(
      ".construct-zone-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
    });
}

export function closeTextLabelMenuGlobal() {
  document
    .querySelectorAll(
      ".construct-text-label-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
    });
}

export function closeMultiselectMenuGlobal() {
  document
    .querySelectorAll(
      ".construct-multiselect-menu"
    )
    .forEach((menu) => {
      menu.hidden = true;
    });
}

export function closeAllContextMenus() {
  closeConnectionMenu();
  closeWorkspaceMenu();
  closeNodeMenu();
  closeZoneMenuGlobal();
  closeTextLabelMenuGlobal();
  closeMultiselectMenuGlobal();
}