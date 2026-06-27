// import {
//   
// } from "../hub.js";

export function createDialogBase({
  title,
  message,
  value = "",
  placeholder = ""
}) {
  const overlay =
    document.createElement("div");

  overlay.className =
    "construct-dialog-overlay";

  overlay.innerHTML = `
    <div class="construct-dialog">
      <div class="construct-dialog-title">${title}</div>

      <div class="construct-dialog-message">${message}</div>

      <input
        class="construct-dialog-input"
        type="text"
        value="${value}"
        placeholder="${placeholder}"
      />

      <div class="construct-dialog-actions">
        <button
          type="button"
          data-action="cancel"
        >
          Cancel
        </button>

        <button
          type="button"
          data-action="ok"
        >
          OK
        </button>
      </div>
    </div>
  `;

  return overlay;
}

export function showConstructPrompt({
  title,
  message,
  value = "",
  placeholder = ""
}) {
  return new Promise((resolve) => {
    const stage =
      document.querySelector(".construct-stage");

    if (!stage) {
      resolve(null);
      return;
    }

    const overlay =
      createDialogBase({
        title,
        message,
        value,
        placeholder
      });

    stage.appendChild(overlay);

    const input =
      overlay.querySelector(
        ".construct-dialog-input"
      );

    requestAnimationFrame(() => {
      input?.focus();
      input?.select();
    });

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    overlay.addEventListener("click", (event) => {
      const button =
        event.target.closest("button");

      if (!button) {
        return;
      }

      if (button.dataset.action === "cancel") {
        close(null);
        return;
      }

      if (button.dataset.action === "ok") {
        close(input?.value || "");
      }
    });

    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close(null);
        return;
      }

      if (event.key === "Enter") {
        close(input?.value || "");
      }
    });
  });
}