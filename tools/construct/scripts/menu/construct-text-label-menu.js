import {
  closeAllContextMenus
} from "../../hub.js";

let textLabelMenu =
  null;

export function ensureTextLabelMenu({
  getSelectedTextLabels,
  getTextLabelData,
  syncTextLabelData,
  deleteSelectedTextLabels
}) {
  if (textLabelMenu) {
    return textLabelMenu;
  }

  textLabelMenu =
    document.createElement("div");

  textLabelMenu.className =
    "construct-text-label-menu";

  textLabelMenu.hidden = true;

  document
    .querySelector(".construct-stage")
    ?.appendChild(textLabelMenu);

  textLabelMenu.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    }
  );

  textLabelMenu.addEventListener(
    "click",
    (event) => {
      handleTextLabelMenuClick(
        event,
        {
          getSelectedTextLabels,
          getTextLabelData,
          syncTextLabelData,
          deleteSelectedTextLabels
        }
      );
    }
  );

  return textLabelMenu;
}

export function closeTextLabelMenu() {
  if (!textLabelMenu) {
    return;
  }

  textLabelMenu.hidden = true;
}

export function openTextLabelMenu(
  label,
  clientX,
  clientY,
  {
    getTextLabelData
  }
) {
  const menu =
    textLabelMenu;

  closeAllContextMenus();

  if (!menu) {
    return;
  }

  const data =
    getTextLabelData(label);

  menu.hidden = false;

  menu.classList.add(
    "construct-menu"
  );

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

    <button
      class="construct-menu-button"
      type="button"
      data-action="lock"
    >
      <i data-lucide="${data?.locked ? "unlock" : "lock"}"></i>
      <span>${data?.locked ? "Unlock" : "Lock"}</span>
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

  const stage =
    document.querySelector(
      ".construct-stage"
    );

  const stageRect =
    stage?.getBoundingClientRect();

  const menuRect =
    menu.getBoundingClientRect();

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

export function handleTextLabelMenuClick(
  event,
  {
    getSelectedTextLabels,
    getTextLabelData,
    syncTextLabelData,
    deleteSelectedTextLabels
  }
) {
  const button =
    event.target.closest("button");

  if (!button) {
    return;
  }

  event.stopPropagation();

  const action =
    button.dataset.action;

  const value =
    button.dataset.value;

  const selectedLabels =
    getSelectedTextLabels();

  if (action === "color") {
    selectedLabels.forEach((label) => {
      label.style.color =
        value;

      syncTextLabelData(label);
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    closeTextLabelMenu();
    return;
  }

  if (action === "lock") {
    selectedLabels.forEach((label) => {
      const data =
        getTextLabelData(label);

      if (!data) {
        return;
      }

      data.locked =
        !data.locked;

      label.dataset.locked =
        String(data.locked);
    });

    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );

    closeTextLabelMenu();
    return;
  }

  if (action === "delete") {
    deleteSelectedTextLabels();

    closeTextLabelMenu();
  }
}