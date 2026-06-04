export function exportCanvasAsPng(
  canvas: HTMLCanvasElement,
  fileName = 'pixi-skia-export.png',
): void {
  const imageUrl = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}