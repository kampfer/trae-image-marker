import { Container } from 'pixi.js';

export class CanvasLayers {
  readonly backgroundLayer: Container;
  readonly imageLayer: Container;
  readonly annotationStage: Container;
  readonly annotationLayer: Container;
  readonly previewLayer: Container;
  readonly auxiliaryLayer: Container;

  constructor(stage: Container) {
    this.backgroundLayer = new Container();
    this.imageLayer = new Container();
    this.annotationStage = new Container();
    this.annotationLayer = new Container();
    this.previewLayer = new Container();
    this.auxiliaryLayer = new Container();

    this.annotationStage.addChild(this.annotationLayer, this.previewLayer, this.auxiliaryLayer);
    stage.addChild(this.backgroundLayer, this.imageLayer, this.annotationStage);
  }

  destroy(): void {
    this.backgroundLayer.destroy({ children: true });
    this.imageLayer.destroy({ children: true });
    this.annotationStage.destroy({ children: true });
  }
}
