// import {
 
// } from "../hub.js";

let currentProjectDirectoryHandle =
  null;

let currentProjectFileHandle =
  null;

let currentImagesDirectoryHandle =
  null;

let isProjectLoaded =
  false;


export function getCurrentProjectDirectoryHandle() {
  return currentProjectDirectoryHandle;
}

export function getCurrentProjectFileHandle() {
  return currentProjectFileHandle;
}

export function getCurrentImagesDirectoryHandle() {
  return currentImagesDirectoryHandle;
}

export function getIsProjectLoaded() {
  return isProjectLoaded;
}

export function setCurrentProjectDirectoryHandle(
  handle
) {
  currentProjectDirectoryHandle =
    handle;
}

export function setCurrentProjectFileHandle(
  handle
) {
  currentProjectFileHandle =
    handle;
}

export function setCurrentImagesDirectoryHandle(
  handle
) {
  currentImagesDirectoryHandle =
    handle;
}

export function setIsProjectLoaded(
  value
) {
  isProjectLoaded =
    Boolean(value);
}

export function resetProjectRuntime() {
  currentProjectDirectoryHandle =
    null;

  currentProjectFileHandle =
    null;

  currentImagesDirectoryHandle =
    null;

  isProjectLoaded =
    false;
}