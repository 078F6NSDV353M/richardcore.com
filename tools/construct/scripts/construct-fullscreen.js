// import {

// } from "../hub.js";

export function isBrowserFullscreen() {
  return document.fullscreenElement !== null;
}

export async function enterBrowserFullscreen() {
  const root =
    document.documentElement;

  if (!root.requestFullscreen) {
    return;
  }

  try {
    await root.requestFullscreen();
  } catch (error) {
    console.error(
      "Failed to enter browser fullscreen:",
      error
    );
  }
}

export async function exitBrowserFullscreen() {
  if (
    !document.exitFullscreen ||
    !isBrowserFullscreen()
  ) {
    return;
  }

  try {
    await document.exitFullscreen();
  } catch (error) {
    console.error(
      "Failed to exit browser fullscreen:",
      error
    );
  }
}

export async function togglePresentationMode() {
  document.body.classList.toggle(
    "construct-fullscreen"
  );

  const isEnabled =
    document.body.classList.contains(
      "construct-fullscreen"
    );

  if (isEnabled) {
    await enterBrowserFullscreen();
  } else {
    await exitBrowserFullscreen();
  }
}

export function handleBrowserFullscreenChange() {
  if (!isBrowserFullscreen()) {
    document.body.classList.remove(
      "construct-fullscreen"
    );
  }
}

export function handleEscapeKey(event) {
  if (event.code !== "Escape") {
    return;
  }

  if (
    !document.body.classList.contains(
      "construct-fullscreen"
    )
  ) {
    return;
  }

  document.body.classList.remove(
    "construct-fullscreen"
  );
}

export function initPresentationMode() {
  document.addEventListener(
    "fullscreenchange",
    handleBrowserFullscreenChange
  );

  window.addEventListener(
    "keydown",
    handleEscapeKey
  );
}