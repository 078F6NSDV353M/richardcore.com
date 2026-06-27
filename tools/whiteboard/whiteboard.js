const WHITEBOARD_STORAGE_KEY =
  "whiteboard-svg";
  
const params =
  new URLSearchParams(
    window.location.search
  );

const isEmbedded =
  params.get("embedded") === "1";
  
const svg =
  document.querySelector(
    ".whiteboard-svg"
  );

const workspace =
  document.querySelector(
    ".whiteboard-workspace"
  );
  
let whiteboardWidth = 1600;
let whiteboardHeight = 900;

function applyWhiteboardSize() {
  svg.setAttribute(
    "viewBox",
    `0 0 ${whiteboardWidth} ${whiteboardHeight}`
  );

  svg.setAttribute(
    "preserveAspectRatio",
    "none"
  );
}

applyWhiteboardSize();

let isDrawing = false;
let currentPath = null;
let currentColor = "#111111";
let currentBrushSize = 4;

function updateBrushCursor() {
  const size =
    Math.max(
      8,
      currentBrushSize
    );

  const radius =
    size / 2;

  const svgCursor =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius - 1}" fill="${currentColor}" stroke="#000000" stroke-width="1"/>
    </svg>`;

  const cursorUrl =
    `data:image/svg+xml;utf8,${encodeURIComponent(svgCursor)}`;

  svg.style.cursor =
    `url("${cursorUrl}") ${radius} ${radius}, crosshair`;
}

updateBrushCursor();

const savedState =
  localStorage.getItem(
    WHITEBOARD_STORAGE_KEY
  );

if (
  savedState &&
  !isEmbedded
) {
  const parsed =
    JSON.parse(savedState);

  svg.innerHTML =
    parsed.svg || "";

  currentColor =
    parsed.color || currentColor;

  currentBrushSize =
    parsed.size || currentBrushSize;
}

updateBrushCursor();

const undoStack = [];
const redoStack = [];

function getSvgPoint(event) {
  const point =
    svg.createSVGPoint();

  point.x = event.clientX;
  point.y = event.clientY;

  const ctm =
    svg.getScreenCTM();

  if (!ctm) {
    return { x: 0, y: 0 };
  }

  const transformed =
    point.matrixTransform(
      ctm.inverse()
    );

  return {
    x: transformed.x,
    y: transformed.y
  };
}

function startDrawing(event) {
  isDrawing = true;

  const point =
    getSvgPoint(event);

  currentPath =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

  currentPath.setAttribute(
    "fill",
    "none"
  );

  currentPath.setAttribute(
    "stroke",
    currentColor
  );

  currentPath.setAttribute(
    "stroke-width",
    currentBrushSize
  );

  currentPath.setAttribute(
    "stroke-linecap",
    "round"
  );

  currentPath.setAttribute(
    "stroke-linejoin",
    "round"
  );

  currentPath.setAttribute(
    "d",
    `M ${point.x} ${point.y}`
  );

  svg.appendChild(currentPath);

  undoStack.push(currentPath);
  redoStack.length = 0;
}

function draw(event) {
  if (
    !isDrawing ||
    !currentPath
  ) {
    return;
  }

  const point =
    getSvgPoint(event);

  const currentD =
    currentPath.getAttribute("d");

  currentPath.setAttribute(
    "d",
    `${currentD} L ${point.x} ${point.y}`
  );
}

function saveWhiteboardState() {
  if (isEmbedded) {
    return;
  }

  localStorage.setItem(
    WHITEBOARD_STORAGE_KEY,
    JSON.stringify({
      svg: svg.innerHTML,
      color: currentColor,
      size: currentBrushSize
    })
  );
}

function stopDrawing() {
  isDrawing = false;
  currentPath = null;

  saveWhiteboardState();
}

svg.addEventListener(
  "pointerdown",
  (event) => {
    svg.setPointerCapture(
      event.pointerId
    );

    startDrawing(event);
  }
);

svg.addEventListener(
  "pointerleave",
  stopDrawing
);

svg.addEventListener(
  "pointercancel",
  stopDrawing
);

window.addEventListener(
  "pointermove",
  draw
);

window.addEventListener(
  "pointerup",
  stopDrawing
);

document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest("button");

    if (!button) {
      return;
    }

    const action =
      button.dataset.action;

    if (action === "clear") {
      svg.innerHTML = "";

      localStorage.removeItem(
        WHITEBOARD_STORAGE_KEY
      );

      undoStack.length = 0;
      redoStack.length = 0;
    }

    if (action === "export-png") {
      renderWhiteboardToPngDataUrl()
        .then((dataUrl) => {
          const link =
            document.createElement("a");

          link.href =
            dataUrl;

          link.download =
            "whiteboard.png";

          link.click();
        });

      return;
    }

    if (action === "copy-clipboard") {
      renderWhiteboardToPngDataUrl()
        .then((dataUrl) => {
          return fetch(dataUrl);
        })
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          return navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob
            })
          ]);
        });

      return;
    }

    if (action === "export-node") {
      renderWhiteboardToPngDataUrl()
        .then((dataUrl) => {
          window.parent.postMessage(
            {
              type: "whiteboard-export",
              imageDataUrl: dataUrl
            },
            "*"
          );
        });

      return;
    }
  }
);

window.addEventListener(
  "keydown",
  (event) => {
    if (event.code === "Digit1") {
      currentBrushSize = 2;
    }

    if (event.code === "Digit2") {
      currentBrushSize = 4;
    }

    if (event.code === "Digit3") {
      currentBrushSize = 8;
    }

    if (event.code === "Digit4") {
      currentBrushSize = 12;
    }

    if (event.code === "Digit5") {
      currentBrushSize = 20;
    }

    if (event.code === "KeyR") {
      currentColor = "#ff3636";
    }

    if (event.code === "KeyB") {
      currentColor = "#0095ff";
    }

    if (event.code === "KeyG") {
      currentColor = "#00ff40";
    }

    if (event.code === "KeyW") {
      currentColor = "#ffffff";
    }

    if (event.code === "KeyK") {
      currentColor = "#111111";
    }
  }
);

if (isEmbedded) {
  document.body.classList.add(
    "whiteboard-embedded"
  );
}

function imageToDataUrl(image) {
  const canvas =
    document.createElement("canvas");

  canvas.width =
    image.naturalWidth;

  canvas.height =
    image.naturalHeight;

  const context =
    canvas.getContext("2d");

  if (!context) {
    return "";
  }

  context.drawImage(
    image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/png");
}

window.addEventListener(
  "message",
  (event) => {
    const data =
      event.data;

    if (
      !data ||
      data.type !==
        "whiteboard-start-image"
    ) {
      return;
    }

    const startImage =
      data.imageDataUrl;

    if (!startImage) {
      return;
    }

    const preloadImage =
      new Image();

    preloadImage.onload = () => {
      whiteboardWidth =
        preloadImage.naturalWidth;

      whiteboardHeight =
        preloadImage.naturalHeight;

      applyWhiteboardSize();

      const image =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );

      const embeddedImage =
        imageToDataUrl(preloadImage);

      image.setAttribute(
        "href",
        embeddedImage || startImage
      );

      image.setAttribute("x", "0");
      image.setAttribute("y", "0");

      image.setAttribute(
        "width",
        whiteboardWidth
      );

      image.setAttribute(
        "height",
        whiteboardHeight
      );

      image.setAttribute(
        "preserveAspectRatio",
        "none"
      );

      svg.prepend(image);
    };

    preloadImage.src =
      startImage;
  }
);

function renderWhiteboardToPngDataUrl() {
  return new Promise((resolve, reject) => {
    const serializer =
      new XMLSerializer();

    const source =
      serializer.serializeToString(svg);

    const blob =
      new Blob(
        [source],
        {
          type: "image/svg+xml;charset=utf-8"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const image =
      new Image();

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      canvas.width = whiteboardWidth;
      canvas.height = whiteboardHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context unavailable"));
        return;
      }

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const dataUrl =
        canvas.toDataURL(
          "image/png"
        );

      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render whiteboard SVG"));
    };

    image.src = url;
  });
}

document.addEventListener(
  "click",
  (event) => {
    const sizeButton =
      event.target.closest("[data-size]");

    if (sizeButton) {
      currentBrushSize =
        Number(sizeButton.dataset.size);

        updateBrushCursor();

      return;
    }

    const colorButton =
      event.target.closest("[data-color]");

    if (colorButton) {
      currentColor =
        colorButton.dataset.color;

        updateBrushCursor();

      return;
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    const isModifier =
      event.ctrlKey || event.metaKey;

    if (!isModifier) {
      return;
    }

    if (
      event.code === "KeyZ" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      const path =
        undoStack.pop();

      if (!path) {
        return;
      }

      redoStack.push(path);

      path.remove();

      saveWhiteboardState();

      return;
    }

    if (
      event.code === "KeyZ" &&
      event.shiftKey
    ) {
      event.preventDefault();

      const path =
        redoStack.pop();

      if (!path) {
        return;
      }

      undoStack.push(path);

      svg.appendChild(path);

      saveWhiteboardState();
    }
  }
);

function fitWhiteboardToolbar() {
  const toolbar =
    document.querySelector(
      ".whiteboard-toolbar"
    );

  if (!toolbar) {
    return;
  }

  toolbar.style.transform =
    "";

  const availableWidth =
    toolbar.parentElement?.clientWidth || 0;

  const realWidth =
    toolbar.scrollWidth;

  if (
    !availableWidth ||
    !realWidth ||
    realWidth <= availableWidth
  ) {
    return;
  }

  const scale =
    availableWidth / realWidth;

  toolbar.style.transform =
    `scale(${scale})`;
}

window.addEventListener(
  "resize",
  fitWhiteboardToolbar
);

requestAnimationFrame(
  fitWhiteboardToolbar
);