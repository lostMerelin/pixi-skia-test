import * as PIXI from 'pixi.js-legacy';

export function hitTest(
  container: PIXI.Container,
  globalPoint: PIXI.Point,
): PIXI.DisplayObject | null {
  container.updateTransform();

  for (let i = container.children.length - 1; i >= 0; i -= 1) {
    const child = container.children[i];

    if (!child.visible || !child.renderable) {
      continue;
    }

    if (child instanceof PIXI.Container) {
      const nestedTarget = hitTest(child, globalPoint);

      if (nestedTarget) {
        return nestedTarget;
      }
    }

    if (child instanceof PIXI.Graphics) {
      const localPoint = child.worldTransform.applyInverse(globalPoint);

      if (containsGraphicsPoint(child, localPoint)) {
        return child;
      }
    }

    if (child instanceof PIXI.Sprite) {
      const localPoint = child.worldTransform.applyInverse(globalPoint);

      if (containsSpritePoint(child, localPoint)) {
        return child;
      }
    }
  }

  return null;
}

function containsGraphicsPoint(
  graphics: PIXI.Graphics,
  localPoint: PIXI.Point,
): boolean {
  const geometry = graphics.geometry as any;
  const graphicsData = geometry.graphicsData ?? [];

  for (let i = graphicsData.length - 1; i >= 0; i -= 1) {
    const data = graphicsData[i];
    const shape = data.shape;

    if (!shape) {
      continue;
    }

    switch (shape.type) {
      case PIXI.SHAPES.RECT:
        if (
          localPoint.x >= shape.x &&
          localPoint.x <= shape.x + shape.width &&
          localPoint.y >= shape.y &&
          localPoint.y <= shape.y + shape.height
        ) {
          return true;
        }

        break;

      case PIXI.SHAPES.ELIP: {
        const dx = localPoint.x - shape.x;
        const dy = localPoint.y - shape.y;

        const rx = shape.width;
        const ry = shape.height;

        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
          return true;
        }

        break;
      }

      case PIXI.SHAPES.POLY:
        if (containsPolyPoint(shape.points ?? [], localPoint)) {
          return true;
        }

        if (isPointNearPolyline(shape.points ?? [], localPoint, getLineWidth(data))) {
          return true;
        }

        break;

      default:
        break;
    }
  }

  return false;
}

function containsSpritePoint(
  sprite: PIXI.Sprite,
  localPoint: PIXI.Point,
): boolean {
  const width = sprite.width;
  const height = sprite.height;

  const left = -sprite.anchor.x * width;
  const top = -sprite.anchor.y * height;

  return (
    localPoint.x >= left &&
    localPoint.x <= left + width &&
    localPoint.y >= top &&
    localPoint.y <= top + height
  );
}

function containsPolyPoint(points: number[], point: PIXI.Point): boolean {
  if (points.length < 6) {
    return false;
  }

  let inside = false;

  for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
    const xi = points[i];
    const yi = points[i + 1];
    const xj = points[j];
    const yj = points[j + 1];

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}

function isPointNearPolyline(
  points: number[],
  point: PIXI.Point,
  lineWidth: number,
): boolean {
  if (points.length < 4) {
    return false;
  }

  const tolerance = Math.max(lineWidth / 2, 6);

  for (let i = 0; i < points.length - 2; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];

    const distance = distanceToSegment(point.x, point.y, x1, y1, x2, y2);

    if (distance <= tolerance) {
      return true;
    }
  }

  return false;
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)),
  );

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

function getLineWidth(data: any): number {
  const line = data.lineStyle;

  if (!line || !line.visible) {
    return 0;
  }

  return line.width ?? 0;
}