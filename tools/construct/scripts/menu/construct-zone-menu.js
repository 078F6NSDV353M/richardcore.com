import {
  deleteSelectedZone,
  getSelectedZone,
  getLineIcon,
  toggleZoneLock,
  openMultiselectMenu,
  getSelectedConnections,
  closeAllContextMenus
} from "../../hub.js";


export function getSelectedZones() {
  return [
    ...document.querySelectorAll(
      ".construct-zone.is-selected"
    )
  ];
}

export function applyZoneColor(
  zone,
  color,
  {
    skipHistory = false
  } = {}
) {
  if (!zone || !color) {
    return;
  }

  const zoneData =
    zone.__zoneData;

  if (!zoneData) {
    return;
  }

  zoneData.color =
    color;

  zone.style.borderColor =
    color;

  zone.style.setProperty(
    "--construct-zone-color",
    color
  );

  if (!skipHistory) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }
}

export function applyZoneLineStyle(
  zone,
  style,
  {
    skipHistory = false
  } = {}
) {
  if (!zone || !style) {
    return;
  }

  const zoneData =
    zone.__zoneData;

  if (!zoneData) {
    return;
  }

  const rect =
    zone.__zoneRect;

  const innerRect =
    zone.__zoneRectInner;

  zoneData.style =
    style;

  if (!rect) {
    return;
  }

  rect.removeAttribute(
    "stroke-dasharray"
  );

  rect.setAttribute(
    "stroke-linecap",
    "butt"
  );

  if (innerRect) {
    innerRect.removeAttribute(
      "stroke-dasharray"
    );

    innerRect.setAttribute(
      "stroke-linecap",
      "butt"
    );

    innerRect.style.display =
      "none";
  }

  if (style === "dashed") {
    rect.setAttribute(
      "stroke-dasharray",
      "16 8"
    );
  }

  if (style === "dotted") {
    rect.setAttribute(
      "stroke-dasharray",
      "4 8"
    );

    rect.setAttribute(
      "stroke-linecap",
      "butt"
    );
  }

  if (style === "dashdot") {
    rect.setAttribute(
      "stroke-dasharray",
      "16 8 4 8"
    );

    rect.setAttribute(
      "stroke-linecap",
      "butt"
    );
  }

  if (style === "double" && innerRect) {
    innerRect.style.display =
      "block";
  }

  if (!skipHistory) {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  }
}

export function closeZoneMenu(
  menu
) {
  if (!menu) {
    return;
  }

  menu.hidden = true;
}

export function openZoneMenu(
  menu,
  zone,
  clientX,
  clientY
) {
  if (!menu || !zone) {
    return;
  }

  closeAllContextMenus();
  
  const zoneData =
    zone.__zoneData;

  const isLocked =
    Boolean(
      zoneData?.locked
    );

  
  menu.hidden = false;

  menu.classList.add(
    "construct-menu"
  );

  menu.style.left = "0px";
  menu.style.top = "0px";
  

  menu.innerHTML = `
    <div class="construct-menu-color-grid">
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#FF2E7B" style="background:#FF2E7B;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#FF3636" style="background:#FF3636;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#FF8000" style="background:#FF8000;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#FFEA00" style="background:#FFEA00;"></button>

      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#BFFF00" style="background:#BFFF00;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#00FF40" style="background:#00FF40;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#00FFCC" style="background:#00FFCC;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#00D0FF" style="background:#00D0FF;"></button>

      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#0095FF" style="background:#0095FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#5768FF" style="background:#5768FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#9B30FF" style="background:#9B30FF;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#FF2ED5" style="background:#FF2ED5;"></button>
      
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#ffffff" style="background:#ffffff;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#808080" style="background:#808080;"></button>
      <button class="construct-menu-color-button" type="button" data-action="color" data-value="#000000" style="background:#000000;"></button>
    </div>

    <div class="construct-menu-separator"></div>

    <div class="construct-menu-label">Border type</div>

    <div class="construct-zone-line-grid">

      <button class="construct-menu-button" type="button" data-action="style" data-value="solid">
        ${getLineIcon("solid")}
        <span>Solid</span>
      </button>

      <button class="construct-menu-button" type="button" data-action="style" data-value="dashed">
        ${getLineIcon("dashed")}
        <span>Dash</span>
      </button>

      <button class="construct-menu-button" type="button" data-action="style" data-value="dotted">
        ${getLineIcon("dotted")}
        <span>Dot</span>
      </button>

      <button class="construct-menu-button" type="button" data-action="style" data-value="dashdot">
        ${getLineIcon("dashdot")}
        <span>Dash-dot</span>
      </button>

      <button class="construct-menu-button" type="button" data-action="style" data-value="double">
        ${getLineIcon("double")}
        <span>Double</span>
      </button>

    </div>

    <div class="construct-menu-separator"></div>

    <button
      class="construct-menu-button"
      type="button"
      data-action="lock"
    >
      <i data-lucide="${isLocked ? "unlock" : "lock"}"></i>
      <span>${isLocked ? "Unlock" : "Lock"}</span>
    </button>

    <button
      class="construct-menu-button construct-menu-button-danger"
      type="button"
      data-action="delete"
    >
      <i data-lucide="trash-2"></i>
      <span>Delete</span>
    </button>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const menuRect =
    menu.getBoundingClientRect();

  const stage =
    document.querySelector(
      ".construct-stage"
    );

  const stageRect =
    stage?.getBoundingClientRect();

  const minX =
    stageRect
      ? stageRect.left
      : 0;

  const minY =
    stageRect
      ? stageRect.top
      : 0;

  const maxX =
    stageRect
      ? stageRect.right - menuRect.width
      : window.innerWidth - menuRect.width;

  const maxY =
    stageRect
      ? stageRect.bottom - menuRect.height
      : window.innerHeight - menuRect.height;

  const finalX =
    Math.min(
      Math.max(clientX, minX),
      Math.max(minX, maxX)
    );

  const finalY =
    Math.min(
      Math.max(clientY, minY),
      Math.max(minY, maxY)
    );

  menu.style.left =
    `${finalX}px`;

  menu.style.top =
    `${finalY}px`;
}

export function initZoneMenu() {
  let menu =
    document.querySelector(
      ".construct-zone-menu"
    );

  if (!menu) {
    menu =
      document.createElement("div");

    menu.className =
      "construct-zone-menu";

    menu.hidden = true;

    document.body.appendChild(
      menu
    );
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      const zone =
        event.target.closest(
          ".construct-zone"
        );

      if (!zone) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (
        !zone.classList.contains(
          "is-selected"
        )
      ) {
        document
          .querySelectorAll(
            ".construct-zone.is-selected"
          )
          .forEach((element) => {
            element.classList.remove(
              "is-selected"
            );
          });

        zone.classList.add(
          "is-selected"
        );
      }

      const selectedNodes =
        document.querySelectorAll(
          ".construct-node.is-selected"
        );

      const selectedConnections =
        getSelectedConnections();

      const selectedZones =
        document.querySelectorAll(
          ".construct-zone.is-selected"
        );

      const selectedKinds =
        [
          selectedNodes.length > 0,
          selectedConnections.length > 0,
          selectedZones.length > 0
        ].filter(Boolean).length;

      if (
        selectedKinds >= 2 &&
        zone.classList.contains(
          "is-selected"
        )
      ) {
        openMultiselectMenu(
          event.clientX,
          event.clientY
        );

        return;
      }

      openZoneMenu(
        menu,
        zone,
        event.clientX,
        event.clientY
      );
    },
    true
  );

  menu.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    }
  );

  menu.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "button"
        );

      if (!button) {
        return;
      }

      const zone =
        getSelectedZone();

      const selectedZones =
        getSelectedZones();

      const targetZones =
        selectedZones.length > 0
          ? selectedZones
          : [zone];  

      if (!zone) {
        closeZoneMenu(menu);
        return;
      }

      const action =
        button.dataset.action;

      const value =
        button.dataset.value;

      if (action === "color") {
        targetZones.forEach((targetZone) => {
          applyZoneColor(
            targetZone,
            value,
            {
              skipHistory: true
            }
          );
        });

        window.dispatchEvent(
          new Event(
            "construct:workspace-changed"
          )
        );

        closeZoneMenu(menu);
        return;
      }

      if (action === "style") {
        targetZones.forEach((targetZone) => {
          applyZoneLineStyle(
            targetZone,
            value,
            {
              skipHistory: true
            }
          );
        });

        window.dispatchEvent(
          new Event(
            "construct:workspace-changed"
          )
        );

        closeZoneMenu(menu);
        return;
      }

      if (action === "lock") {
        targetZones.forEach((targetZone) => {
          toggleZoneLock(
            targetZone
          );
        });

        closeZoneMenu(menu);
        return;
      }

      if (action === "delete") {
        deleteSelectedZone();

        closeZoneMenu(menu);
      }
    }
  );

  window.addEventListener(
    "mousedown",
    (event) => {
      if (
        event.target.closest(
          ".construct-zone-menu"
        )
      ) {
        return;
      }

      closeZoneMenu(menu);
    }
  );
}