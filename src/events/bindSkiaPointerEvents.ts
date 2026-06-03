import * as PIXI from 'pixi.js-legacy';

import { getCanvasPoint } from './getCanvasPoint';
import { hitTest } from './hitTest';

export function bindSkiaPointerEvents(
  canvas: HTMLCanvasElement,
  rootContainer: PIXI.Container,
): void {
  canvas.addEventListener('pointerdown', (event) => {
    emitPixiPointerEvent('pointerdown', event, canvas, rootContainer);
  });

  canvas.addEventListener('pointerup', (event) => {
    emitPixiPointerEvent('pointerup', event, canvas, rootContainer);
  });
}

function emitPixiPointerEvent(
  eventName: 'pointerdown' | 'pointerup',
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  rootContainer: PIXI.Container,
): void {
  const point = getCanvasPoint(event, canvas);
  const target = hitTest(rootContainer, point);

  if (!target) {
    return;
  }

  console.log(`Skia ${eventName} target:`, target);

  target.emit(eventName, {
    type: eventName,
    global: point,
    target,
    currentTarget: target,
    originalEvent: event,
    nativeEvent: event,
  } as unknown as PIXI.FederatedPointerEvent);
}