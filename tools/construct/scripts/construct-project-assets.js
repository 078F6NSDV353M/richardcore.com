import {
  getCurrentProjectDirectoryHandle,
  getCurrentImagesDirectoryHandle
} from "../hub.js";


export async function saveImageAsset(
  file,
  preferredPath = null
) {

  const imagesDirectoryHandle =
    getCurrentImagesDirectoryHandle();

  if (!imagesDirectoryHandle) {
    return null;
  }

  const preferredFileName =
    preferredPath?.startsWith("images/")
      ? preferredPath.split("/").pop()
      : null;

  const extension =
    file.name.split(".").pop() ||
    "png";

  const fileName =
    preferredFileName ||
    `${crypto.randomUUID()}.${extension}`;

  const imageFileHandle =
    await imagesDirectoryHandle.getFileHandle(
      fileName,
      {
        create: true
      }
    );

  const writable =
    await imageFileHandle.createWritable();

  await writable.write(file);
  await writable.close();

  return `images/${fileName}`;
}

export async function loadImageAsset(
  relativePath
) {

  const imagesDirectoryHandle =
    getCurrentImagesDirectoryHandle();

  if (
    !imagesDirectoryHandle ||
    !relativePath
  ) {
    return null;
  }

  const fileName =
    relativePath.split("/").pop();

  if (!fileName) {
    return null;
  }

  try {
    const imageFileHandle =
      await imagesDirectoryHandle.getFileHandle(
        fileName
      );

    const file =
      await imageFileHandle.getFile();

    return URL.createObjectURL(file);
  } catch {
    const projectDirectoryHandle =
      getCurrentProjectDirectoryHandle();

    if (!projectDirectoryHandle) {
      return null;
    }

    const archiveDirectoryHandle =
      await projectDirectoryHandle.getDirectoryHandle(
        "_archive"
      );

    const archiveImagesDirectoryHandle =
      await archiveDirectoryHandle.getDirectoryHandle(
        "images"
      );

    const archivedFileHandle =
      await archiveImagesDirectoryHandle.getFileHandle(
        fileName
      );

    const archivedFile =
      await archivedFileHandle.getFile();

    const restoredFileHandle =
      await imagesDirectoryHandle.getFileHandle(
        fileName,
        {
          create: true
        }
      );

    const writable =
      await restoredFileHandle.createWritable();

    await writable.write(archivedFile);
    await writable.close();

    await archiveImagesDirectoryHandle.removeEntry(
      fileName
    );

    const restoredFile =
      await restoredFileHandle.getFile();

    return URL.createObjectURL(restoredFile);
  }
}

export async function duplicateImageAsset(
  relativePath
) {

  const imagesDirectoryHandle =
    getCurrentImagesDirectoryHandle();

  if (
    !imagesDirectoryHandle ||
    !relativePath ||
    !relativePath.startsWith("images/")
  ) {
    return relativePath;
  }

  const sourceFileName =
    relativePath.split("/").pop();

  if (!sourceFileName) {
    return relativePath;
  }

  const sourceFileHandle =
    await imagesDirectoryHandle.getFileHandle(
      sourceFileName
    );

  const sourceFile =
    await sourceFileHandle.getFile();

  return saveImageAsset(sourceFile);
}

export async function copyProjectImageAssets(
  snapshot,
  sourceImagesDirectoryHandle
) {
  const targetImagesDirectoryHandle =
    getCurrentImagesDirectoryHandle();

  if (
    !snapshot ||
    !sourceImagesDirectoryHandle ||
    !targetImagesDirectoryHandle
  ) {
    return;
  }

  const imagePaths =
    new Set();

  snapshot.nodes?.forEach((node) => {
    ["A", "B"].forEach((side) => {
      const image =
        node.sides?.[side]?.image;

      if (
        image &&
        image.startsWith("images/")
      ) {
        imagePaths.add(image);
      }
    });
  });

  for (const imagePath of imagePaths) {
    const fileName =
      imagePath.split("/").pop();

    if (!fileName) {
      continue;
    }

    const sourceFileHandle =
      await sourceImagesDirectoryHandle
        .getFileHandle(fileName);

    const sourceFile =
      await sourceFileHandle.getFile();

    const targetFileHandle =
      await targetImagesDirectoryHandle
        .getFileHandle(
          fileName,
          {
            create: true
          }
        );

    const writable =
      await targetFileHandle.createWritable();

    await writable.write(sourceFile);
    await writable.close();
  }
}

export async function archiveImageAsset(
  relativePath
) {
  const imagesDirectoryHandle =
    getCurrentImagesDirectoryHandle();

  if (
    !imagesDirectoryHandle ||
    !relativePath ||
    !relativePath.startsWith("images/")
  ) {
    return null;
  }

  const fileName =
    relativePath.split("/").pop();

  if (!fileName) {
    return null;
  }

  const sourceFileHandle =
    await imagesDirectoryHandle.getFileHandle(
      fileName
    );

  const sourceFile =
    await sourceFileHandle.getFile();

  const projectDirectoryHandle =
    getCurrentProjectDirectoryHandle();

  if (!projectDirectoryHandle) {
    return null;
  }

  const archiveDirectoryHandle =
    await projectDirectoryHandle.getDirectoryHandle(
      "_archive",
      {
        create: true
      }
    );

  const archiveImagesDirectoryHandle =
    await archiveDirectoryHandle.getDirectoryHandle(
      "images",
      {
        create: true
      }
    );

  const targetFileHandle =
    await archiveImagesDirectoryHandle.getFileHandle(
      fileName,
      {
        create: true
      }
    );

  const writable =
    await targetFileHandle.createWritable();

  await writable.write(sourceFile);
  await writable.close();

  await imagesDirectoryHandle.removeEntry(
    fileName
  );

  return `_archive/images/${fileName}`;
}

export function archiveImageAssetLater(relativePath) {
  if (
    !relativePath ||
    !relativePath.startsWith("images/")
  ) {
    return;
  }

  setTimeout(() => {
    archiveImageAsset(relativePath)
      .catch((error) => {
        console.warn(
          "Failed to archive image asset.",
          error
        );
      });
  }, 0);
}

export async function restoreImageAsset(relativePath) {
  if (
    !relativePath ||
    !relativePath.startsWith("images/")
  ) {
    return null;
  }

  return loadImageAsset(relativePath);
}