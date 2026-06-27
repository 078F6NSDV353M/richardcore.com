import {
  state,
  getSelectedNodeElements,
  getSelectedConnections,
  applyColorToSelectedConnections,
  applyZoneColor,
  closeAllContextMenus
} from "../../hub.js";


let multiselectMenu = null;

export function ensureMultiselectMenu() {
  if (multiselectMenu) {
    return multiselectMenu;
  }

  multiselectMenu =
    document.createElement("div");

  multiselectMenu.className =
    "construct-multiselect-menu construct-menu";

  multiselectMenu.hidden = true;

  document.querySelector(
    ".construct-stage"
  ).appendChild(
    multiselectMenu
  );

  multiselectMenu.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    }
  );

  multiselectMenu.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    }
  );

  window.addEventListener(
    "mousedown",
    (event) => {

      if (event.button === 1) {
        closeMultiselectMenu();
        return;
      }

      if (
        multiselectMenu.hidden ||
        multiselectMenu.contains(
          event.target
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      closeMultiselectMenu();
    },
    true
  );

  window.addEventListener(
    "auxclick",
    (event) => {
      if (event.button !== 1) {
        return;
      }

      closeMultiselectMenu();
    }
  );

  return multiselectMenu;
}

export function closeMultiselectMenu() {
  if (!multiselectMenu) {
    return;
  }

  multiselectMenu.hidden = true;
}

export function openMultiselectMenu(
  clientX,
  clientY
) {
  const selectedNodes =
    getSelectedNodeElements(state);

  const selectedConnections =
    getSelectedConnections();

  const selectedZones =
    [
      ...document.querySelectorAll(
        ".construct-zone.is-selected"
      )
    ];  

  const selectedKinds =
    [
      selectedNodes.length > 0,
      selectedConnections.length > 0,
      selectedZones.length > 0
    ].filter(Boolean).length;

  if (selectedKinds < 2) {
    closeMultiselectMenu();
    return;
  }

  const menu =
    ensureMultiselectMenu();

  closeAllContextMenus();  
  
  menu.hidden = false;

  const stage =
    document.querySelector(".construct-stage");

  const stageRect =
    stage?.getBoundingClientRect();

  const x =
    stageRect
      ? clientX - stageRect.left
      : clientX;

  const y =
    stageRect
      ? clientY - stageRect.top
      : clientY;

  menu.style.left =
    `${x}px`;

  menu.style.top =
    `${y}px`;

  menu.innerHTML = `
    <div class="construct-menu-label">
      Border color
    </div>

    <div class="construct-menu-color-grid">
    
      <button class="construct-menu-color-button" type="button" data-color="#FF2E7B" style="background:#FF2E7B;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#FF3636" style="background:#FF3636;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#FF8000" style="background:#FF8000;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#FFEA00" style="background:#FFEA00;"></button>

      <button class="construct-menu-color-button" type="button" data-color="#BFFF00" style="background:#BFFF00;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#00FF40" style="background:#00FF40;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#00FFCC" style="background:#00FFCC;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#00D0FF" style="background:#00D0FF;"></button>

      <button class="construct-menu-color-button" type="button" data-color="#0095FF" style="background:#0095FF;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#5768FF" style="background:#5768FF;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#9B30FF" style="background:#9B30FF;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#FF2ED5" style="background:#FF2ED5;"></button>
      
      <button class="construct-menu-color-button" type="button" data-color="#ffffff" style="background:#ffffff;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#808080" style="background:#808080;"></button>
      <button class="construct-menu-color-button" type="button" data-color="#000000" style="background:#000000;"></button>

    </div>
  `;

  menu.querySelectorAll(
    "[data-color]"
  ).forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const color =
          button.dataset.color;

        selectedNodes.forEach(
          (node) => {

            node.style.borderColor =
              color;

            node.style.setProperty(
              "--construct-node-port-color",
              color
            );
          }
        );

        selectedConnections.forEach((connection) => {
          connection.color = color;
        });

        selectedZones.forEach((zone) => {
          applyZoneColor(
            zone,
            color,
            {
              skipHistory: true
            }
          );
        });

        applyColorToSelectedConnections(
          color
        );

        window.dispatchEvent(
          new Event(
            "construct:workspace-changed"
          )
        );

        closeMultiselectMenu();
      }
    );

  });
}
