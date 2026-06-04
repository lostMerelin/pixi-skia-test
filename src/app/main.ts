import '../styles.css';

import * as PIXI from 'pixi.js-legacy';

import { createPixiApp } from '../pixi/createPixiApp';
import { createDemoScene } from '../pixi/createDemoScene';
import { initSkia } from '../skia/initSkia';
import { SkiaRenderer } from '../skia/SkiaRenderer';
import { bindSkiaPointerEvents } from '../events/bindSkiaPointerEvents';

const pixiRootElement = document.querySelector<HTMLDivElement>('#pixi-root');
const skiaCanvasElement = document.querySelector<HTMLCanvasElement>('#skia-canvas');

const addRandomShapeButton = document.querySelector<HTMLButtonElement>('#addRandomShape');
const nextSceneButton = document.querySelector<HTMLButtonElement>('#nextScene');
const exportPdfButton = document.querySelector<HTMLButtonElement>('#exportPdf');

if (!pixiRootElement) {
  throw new Error('Element #pixi-root not found');
}

if (!skiaCanvasElement) {
  throw new Error('Element #skia-canvas not found');
}

const pixiRoot: HTMLDivElement = pixiRootElement;
const skiaCanvas: HTMLCanvasElement = skiaCanvasElement;

const pixiApp = createPixiApp(pixiRoot);
const mainContainer = await createDemoScene();

pixiApp.stage.addChild(mainContainer);

bindSkiaPointerEvents(skiaCanvas, mainContainer);

let skiaRenderer: SkiaRenderer | null = null;

addRandomShapeButton?.addEventListener('click', () => {
  const randomShape = createRandomShape();

  mainContainer.addChild(randomShape);

  rerender();

  console.log('Random shape added');
});

nextSceneButton?.addEventListener('click', () => {
  console.log('Scene switching will be implemented later.');
});

exportPdfButton?.addEventListener('click', () => {
  console.log('PDF export will be implemented later.');
});

async function bootstrapSkia(): Promise<void> {
  try {
    const CanvasKit = await initSkia();

    const surface = CanvasKit.MakeCanvasSurface(skiaCanvas);

    if (!surface) {
      throw new Error('Cannot create Skia surface');
    }

    skiaRenderer = new SkiaRenderer(CanvasKit, surface);

    console.log('Skia initialized successfully');

    rerender();
  } catch (error) {
    console.error('Skia initialization failed:', error);

    const context = skiaCanvas.getContext('2d');

    if (context) {
      context.clearRect(0, 0, skiaCanvas.width, skiaCanvas.height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, skiaCanvas.width, skiaCanvas.height);
      context.fillStyle = '#cc0000';
      context.font = '18px Arial';
      context.fillText('Skia initialization failed', 40, 60);
      context.fillStyle = '#333333';
      context.font = '14px Arial';
      context.fillText('Check browser console', 40, 90);
    }
  }
}

function rerender(): void {
  pixiApp.renderer.render(pixiApp.stage);

  if (!skiaRenderer) {
    return;
  }

  try {
    skiaRenderer.render(mainContainer);
  } catch (error) {
    console.error('Skia render failed:', error);
  }
}

function createRandomShape(): PIXI.Graphics {
  const graphics = new PIXI.Graphics();

  const x = Math.random() * 500 + 50;
  const y = Math.random() * 300 + 50;
  const size = Math.random() * 60 + 20;
  const color = Math.floor(Math.random() * 0xffffff);

  graphics.beginFill(color);
  graphics.drawRect(-size / 2, -size / 2, size, size);
  graphics.endFill();

  graphics.position.set(x, y);
  graphics.angle = Math.random() * 360;
  graphics.scale.set(0.5 + Math.random() * 1.5);

  graphics.eventMode = 'static';
  graphics.cursor = 'pointer';

  graphics.on('pointerdown', () => {
    console.log('Random shape pointerdown!');
  });

  graphics.on('pointerup', () => {
    console.log('Random shape pointerup!');
  });

  return graphics;
}

rerender();
bootstrapSkia();