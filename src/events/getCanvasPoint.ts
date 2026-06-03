import * as PIXI from 'pixi.js-legacy';

export function getCanvasPoint(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
): PIXI.Point {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return new PIXI.Point(
    (event.clientX - rect.left) * scaleX,
    (event.clientY - rect.top) * scaleY,
  );
}