// import {
//   state
// } from "../../hub.js";


export function positionMenu(
  menu,
  clientX,
  clientY
) {
  if (!menu) {
    return;
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