import type { Point } from '../model/viewportTypes';
import type { ViewportState } from '../model/viewportTypes';

export class ViewportMapper {
  private viewport: ViewportState = {
    canvasWidth: 0,
    canvasHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
    zoom: 100,
    rotation: 0,
  };

  update(viewport: ViewportState): void {
    this.viewport = viewport;
  }

  imageToScreen(point: Point): Point {
    const { canvasWidth, canvasHeight, imageWidth, imageHeight, zoom } = this.viewport;
    const scale = zoom / 100;

    return {
      x: canvasWidth / 2 + (point.x - imageWidth / 2) * scale,
      y: canvasHeight / 2 + (point.y - imageHeight / 2) * scale,
    };
  }

  screenToImage(point: Point): Point {
    const { canvasWidth, canvasHeight, imageWidth, imageHeight, zoom } = this.viewport;
    const scale = zoom / 100;

    return {
      x: imageWidth / 2 + (point.x - canvasWidth / 2) / scale,
      y: imageHeight / 2 + (point.y - canvasHeight / 2) / scale,
    };
  }
}
