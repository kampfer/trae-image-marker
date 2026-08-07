export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  canvasWidth: number;
  canvasHeight: number;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  rotation: number;
}

export interface ImagePoint {
  x: number;
  y: number;
}

export type CanvasPoint = Point;
