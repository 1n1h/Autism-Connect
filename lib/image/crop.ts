/**
 * Turn a source image URL + pixel crop coordinates into a square JPEG Blob.
 * Output is resized to a consistent `outputSize` (default 512×512) so avatars
 * in the DB don't vary wildly in size.
 */
export async function getCroppedBlob(
  src: string,
  crop: { x: number; y: number; width: number; height: number },
  outputSize = 512,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't get 2D canvas context.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, outputSize, outputSize,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null"))),
      mime,
      quality,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    // For data: or blob: URLs, crossOrigin isn't needed. For remote URLs,
    // we'd set it — but our source is always a local blob URL.
    img.src = src;
  });
}
