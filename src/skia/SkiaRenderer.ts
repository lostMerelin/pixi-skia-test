import * as PIXI from 'pixi.js-legacy';

type CanvasKitInstance = any;
type SkSurface = any;
type SkCanvas = any;
type SkPaint = any;

export class SkiaRenderer {
  constructor(
    private readonly CanvasKit: CanvasKitInstance,
    private readonly surface: SkSurface,
  ) {}

  render(container: PIXI.Container): void {
    const canvas = this.surface.getCanvas();

    canvas.clear(this.CanvasKit.WHITE);

    this.renderContainer(container, canvas);

    this.surface.flush();
  }

  private renderContainer(container: PIXI.Container, canvas: SkCanvas): void {
    canvas.save();

    this.applyTransform(container, canvas);

    for (const child of container.children) {
      if (child instanceof PIXI.Graphics) {
        this.renderGraphics(child, canvas);
      } else if (child instanceof PIXI.Container) {
        this.renderContainer(child, canvas);
      }
    }

    canvas.restore();
  }

  private renderGraphics(graphics: PIXI.Graphics, canvas: SkCanvas): void {
    canvas.save();

    this.applyTransform(graphics, canvas);

    const graphicsData = this.getGraphicsData(graphics);

    for (const data of graphicsData) {
      this.renderGraphicsData(data, canvas);
    }

    canvas.restore();
  }

  private renderGraphicsData(data: any, canvas: SkCanvas): void {
    const shape = data.shape;

    if (!shape) {
      return;
    }

    const fillPaint = this.createFillPaint(data);
    const strokePaint = this.createStrokePaint(data);

    switch (shape.type) {
      case PIXI.SHAPES.RECT:
        this.drawRect(shape, canvas, fillPaint, strokePaint);
        break;

      case PIXI.SHAPES.ELIP:
        this.drawEllipse(shape, canvas, fillPaint, strokePaint);
        break;

      case PIXI.SHAPES.POLY:
        this.drawPoly(shape, canvas, fillPaint, strokePaint);
        break;

      default:
        break;
    }

    fillPaint?.delete();
    strokePaint?.delete();
  }

  private drawRect(
    shape: any,
    canvas: SkCanvas,
    fillPaint: SkPaint | null,
    strokePaint: SkPaint | null,
  ): void {
    const rect = this.CanvasKit.XYWHRect(shape.x, shape.y, shape.width, shape.height);

    if (fillPaint) {
      canvas.drawRect(rect, fillPaint);
    }

    if (strokePaint) {
      canvas.drawRect(rect, strokePaint);
    }
  }

  private drawEllipse(
    shape: any,
    canvas: SkCanvas,
    fillPaint: SkPaint | null,
    strokePaint: SkPaint | null,
  ): void {
    const ovalRect = this.CanvasKit.LTRBRect(
      shape.x - shape.width,
      shape.y - shape.height,
      shape.x + shape.width,
      shape.y + shape.height,
    );

    if (fillPaint) {
      canvas.drawOval(ovalRect, fillPaint);
    }

    if (strokePaint) {
      canvas.drawOval(ovalRect, strokePaint);
    }
  }

private drawPoly(
  shape: any,
  canvas: SkCanvas,
  fillPaint: SkPaint | null,
  strokePaint: SkPaint | null,
): void {
  const points: number[] = shape.points ?? [];

  if (points.length < 4) {
    return;
  }

  let pathString = `M ${points[0]} ${points[1]}`;

  for (let i = 2; i < points.length; i += 2) {
    pathString += ` L ${points[i]} ${points[i + 1]}`;
  }

  if (shape.closeStroke || shape.closed) {
    pathString += ' Z';
  }

  const path = this.CanvasKit.Path.MakeFromSVGString(pathString);

  if (!path) {
    return;
  }

  if (fillPaint) {
    canvas.drawPath(path, fillPaint);
  }

  if (strokePaint) {
    canvas.drawPath(path, strokePaint);
  }

  path.delete();
}

private pathMoveTo(path: any, x: number, y: number): void {
  if (typeof path.moveTo === 'function') {
    path.moveTo(x, y);
    return;
  }

  if (typeof path.moveTo === 'function') {
    path.moveTo(x, y);
    return;
  }

  throw new Error('CanvasKit Path does not support moveTo/moveTo');
}

private pathLineTo(path: any, x: number, y: number): void {
  if (typeof path.lineTo === 'function') {
    path.lineTo(x, y);
    return;
  }

  if (typeof path.lineTo === 'function') {
    path.lineTo(x, y);
    return;
  }

  throw new Error('CanvasKit Path does not support lineTo/lineTo');
}

private pathClose(path: any): void {
  if (typeof path.close === 'function') {
    path.close();
    return;
  }

  if (typeof path.close === 'function') {
    path.close();
    return;
  }
}

  private applyTransform(object: PIXI.DisplayObject, canvas: SkCanvas): void {
    canvas.translate(object.position.x, object.position.y);

    if (object.rotation !== 0) {
      canvas.rotate((object.rotation * 180) / Math.PI, 0, 0);
    }

    canvas.scale(object.scale.x, object.scale.y);
  }

  private createFillPaint(data: any): SkPaint | null {
    const fill = data.fillStyle;

    if (!fill || !fill.visible || fill.alpha <= 0) {
      return null;
    }

    const paint = new this.CanvasKit.Paint();

    paint.setAntiAlias(true);
    paint.setStyle(this.CanvasKit.PaintStyle.Fill);
    paint.setColor(this.colorToSkiaColor(fill.color, fill.alpha));

    return paint;
  }

  private createStrokePaint(data: any): SkPaint | null {
    const line = data.lineStyle;

    if (!line || !line.visible || line.width <= 0 || line.alpha <= 0) {
      return null;
    }

    const paint = new this.CanvasKit.Paint();

    paint.setAntiAlias(true);
    paint.setStyle(this.CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(line.width);
    paint.setColor(this.colorToSkiaColor(line.color, line.alpha));

    return paint;
  }

  private colorToSkiaColor(color: number, alpha = 1): Float32Array {
    const r = ((color >> 16) & 255) / 255;
    const g = ((color >> 8) & 255) / 255;
    const b = (color & 255) / 255;

    return this.CanvasKit.Color4f(r, g, b, alpha);
  }

  private getGraphicsData(graphics: PIXI.Graphics): any[] {
  const geometry = graphics.geometry as any;
  const graphicsData = geometry.graphicsData ?? [];

  if (graphicsData.length === 0) {
    console.warn('Empty graphicsData for graphics:', graphics);
  }

  return graphicsData;
}
}