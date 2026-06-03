import * as PIXI from 'pixi.js-legacy';

export function createPixiApp(rootElement: HTMLElement): PIXI.Application {
  const app = new PIXI.Application({
    width: 600,
    height: 400,
    backgroundColor: 0xffffff,
    forceCanvas: true,
    antialias: true,
  });

  rootElement.appendChild(app.view as HTMLCanvasElement);

  return app;
}