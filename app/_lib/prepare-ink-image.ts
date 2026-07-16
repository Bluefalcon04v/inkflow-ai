export function prepareInkImage(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (pixels.data[(y * canvas.width + x) * 4 + 3] < 20) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) return null;

  const padding = 32;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(canvas.width, right + padding);
  bottom = Math.min(canvas.height, bottom + padding);
  const width = right - left;
  const height = bottom - top;
  const scale = Math.max(2, Math.min(4, 900 / Math.max(width, height)));
  const output = document.createElement("canvas");
  output.width = Math.round(width * scale);
  output.height = Math.round(height * scale);
  const outputContext = output.getContext("2d");
  if (!outputContext) return null;
  outputContext.fillStyle = "#ffffff";
  outputContext.fillRect(0, 0, output.width, output.height);
  const inkOnly = document.createElement("canvas");
  inkOnly.width = width;
  inkOnly.height = height;
  const inkContext = inkOnly.getContext("2d");
  if (!inkContext) return null;
  const crop = context.getImageData(left, top, width, height);
  for (let index = 0; index < crop.data.length; index += 4) {
    if (crop.data[index + 3] < 20) continue;
    crop.data[index] = 20;
    crop.data[index + 1] = 20;
    crop.data[index + 2] = 20;
    crop.data[index + 3] = 255;
  }
  inkContext.putImageData(crop, 0, 0);
  outputContext.drawImage(inkOnly, 0, 0, width, height, 0, 0, output.width, output.height);
  return output.toDataURL("image/png");
}
