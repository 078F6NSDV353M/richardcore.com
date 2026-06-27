import {
  state,
  saveImageAsset,
  showConstructPrompt
} from "../hub.js";

export function isImageFile(file) {
  return Boolean(file && file.type && file.type.startsWith("image/"));
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const MAX_SIZE = 1000;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext("2d");

        if (!ctx) {
          reject(
            new Error(
              "Failed to create image canvas."
            )
          );

          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressed =
          canvas.toDataURL(
            "image/webp",
            0.96
          );

        resolve(compressed);
      };

      img.onerror = () => {
        reject(
          new Error(
            "Failed to load image."
          )
        );
      };

      img.src = reader.result;
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Failed to read image file."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

export function setImage(
  node,
  imageContainer,
  src,
  keepScroll
) {
  if (!imageContainer || !src) {
    return;
  }

  imageContainer.dataset.imageSrc = src;

  const placeholder =
    imageContainer.querySelector(
      ".construct-node-image-placeholder"
    );

  imageContainer
    .querySelectorAll("img")
    .forEach((img) => {
      img.remove();
    });

  const img =
    document.createElement("img");

  if (
    src.startsWith("images/")
  ) {

    import(
      "./construct-project-assets.js"
    ).then(async ({
      loadImageAsset
    }) => {

      const objectUrl =
        await loadImageAsset(src);

      if (objectUrl) {
        img.src = objectUrl;
      }
    });

  } else {
    img.src = src;
  }
  
  img.alt = "Node image";
  img.draggable = false;

  imageContainer.appendChild(img);

  imageContainer.classList.add(
    "has-image"
  );

  if (placeholder) {
    imageContainer.appendChild(
      placeholder
    );
  }

  requestAnimationFrame(() => {
    window.dispatchEvent(
      new Event(
        "construct:workspace-changed"
      )
    );
  });

  const nodeId =
    Number(node?.dataset?.nodeId);

  if (
    state &&
    Array.isArray(state.nodes)
  ) {
    const nodeData =
      state.nodes.find(
        (item) => item.id === nodeId
      );

    if (nodeData) {
      const currentSide =
        nodeData.currentSide || "A";

      if (
        nodeData.sides &&
        nodeData.sides[currentSide]
      ) {
        nodeData.sides[currentSide].image =
          src;
      }
    }
  }

  keepScroll?.(node);
}

export function removeImage(
  node,
  imageContainer,
  keepScroll
) {
  if (!imageContainer) {
    return;
  }

  delete imageContainer.dataset.imageSrc;

  imageContainer
    .querySelectorAll("img")
    .forEach((img) => {
      img.remove();
    });

  imageContainer.classList.remove(
    "has-image"
  );

  const nodeId =
    Number(node?.dataset?.nodeId);

  if (
    state &&
    Array.isArray(state.nodes)
  ) {
    const nodeData =
      state.nodes.find(
        (item) => item.id === nodeId
      );

    if (nodeData) {
      const currentSide =
        nodeData.currentSide || "A";

      if (
        nodeData.sides &&
        nodeData.sides[currentSide]
      ) {
        nodeData.sides[currentSide].image =
          "";
      }
    }
  }

  keepScroll?.(node);

  window.dispatchEvent(
    new Event(
      "construct:workspace-changed"
    )
  );
}

export async function setImageFromFile(node, imageContainer, file, keepScroll) {
  if (!isImageFile(file)) return;

  try {

    const nodeId =
      Number(node?.dataset?.nodeId);

    const nodeData =
      window.state?.nodes?.find(
        (item) => item.id === nodeId
      );

    const currentSide =
      nodeData?.currentSide || "A";

    const currentImagePath =
      nodeData?.sides?.[currentSide]?.image || null;

    const assetPath =
      await saveImageAsset(
        file,
        currentImagePath
      );
      
    if (!assetPath) {
      return;
    }

    setImage(
      node,
      imageContainer,
      assetPath,
      keepScroll
    );
  } catch (error) {
    console.error(error);
  }
}

export function handleImagePaste(event, node, getNodeData, setImageFromFileFn) {
  const nodeData = getNodeData(node);
  if (!nodeData || !nodeData.isEditing) {
    return false;
  }

  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));

  if (!imageItem) return false;

  const file = imageItem.getAsFile();
  if (!file) return false;

  event.preventDefault();
  setImageFromFileFn(file);
  return true;
}

export async function openImageUrlPrompt(
  node,
  getNodeData,
  setImageFn
) {
  const nodeData =
    getNodeData(node);

  if (!nodeData || !nodeData.isEditing) {
    return;
  }

  const value =
    await showConstructPrompt({
      title: "Image URL",
      message: "Enter image URL.",
      value: "",
      placeholder: "https://..."
    });

  if (!value) {
    return;
  }

  const src =
    value.trim();

  if (!src) {
    return;
  }

  setImageFn(src);
}

export function setupImageHandlers({
  node,
  imageContainer,
  uploadButton,
  linkButton,
  pasteButton,
  removeButton,
  fileInput,
  getNodeData,
  pasteImageIntoNode,
  setImageFromFile,
  openImageUrlPrompt,
  setImageFromUrl,
  keepNodeScrollInside
}) {
  if (imageContainer) {
    imageContainer.addEventListener("paste", (event) => {
      pasteImageIntoNode(event);
    });

    imageContainer.addEventListener("mousedown", (event) => {
      const nodeData = getNodeData(node);

      if (!nodeData?.isEditing) {
        return;
      }

      event.stopPropagation();
    });
  }

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", (event) => {
      const nodeData = getNodeData(node);
      if (!nodeData || !nodeData.isEditing) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      const nodeData = getNodeData(node);
      if (!nodeData || !nodeData.isEditing) {
        fileInput.value = "";
        return;
      }

      const file = fileInput.files?.[0];
      if (!file) return;

      await setImageFromFile(
        node,
        imageContainer,
        file,
        keepNodeScrollInside
      );

      fileInput.value = "";
    });
  }

  if (linkButton) {
    linkButton.addEventListener("click", (event) => {
      const nodeData = getNodeData(node);
      if (!nodeData || !nodeData.isEditing) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.stopPropagation();

      openImageUrlPrompt(
        node,
        getNodeData,
        setImageFromUrl
      );
    });
  }

  if (pasteButton) {
    pasteButton.addEventListener("click", async (event) => {
      const nodeData = getNodeData(node);

      if (!nodeData || !nodeData.isEditing) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        const items =
          await navigator.clipboard.read();

        for (const item of items) {
          const type =
            item.types.find((value) =>
              value.startsWith("image/")
            );

          if (!type) {
            continue;
          }

          const blob =
            await item.getType(type);

          const file =
            new File(
              [blob],
              "clipboard-image.png",
              { type }
            );

          await setImageFromFile(
            node,
            imageContainer,
            file,
            keepNodeScrollInside
          );

          return;
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  if (removeButton) {
    removeButton.addEventListener("click", (event) => {
      const nodeData = getNodeData(node);
      if (!nodeData || !nodeData.isEditing) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.stopPropagation();

      removeImage(
        node,
        imageContainer,
        keepNodeScrollInside
      );
    });
  }
}