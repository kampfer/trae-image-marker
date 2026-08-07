import { Application } from 'pixi.js';

import type { ImageInfo } from '../../../types/fileTypes';
import { ImageRenderer, ImageRendererStatus } from '../renderers/ImageRenderer';
import type { ViewportState } from '../model/viewportTypes';
import { ViewportMapper } from '../utils/coordinateMapper';
import { CanvasLayers } from './CanvasLayers';

export interface CanvasRuntimeProps {
  activeImage?: ImageInfo;
  zoom: number;
  rotation: number;
}

export interface CanvasRuntimeOptions {
  container: HTMLDivElement;
  onImageStatusChange: (status: ImageRendererStatus) => void;
}

export class CanvasRuntime {
  private app: Application | null = null;
  private layers: CanvasLayers | null = null;
  private imageRenderer: ImageRenderer | null = null;
  private readonly viewportMapper = new ViewportMapper();
  private pendingProps: CanvasRuntimeProps | null = null;
  private currentImageKey: string | null = null;
  private initializationPromise: Promise<Application> | null = null;
  private destructionPromise: Promise<void> | null = null;

  constructor(private readonly options: CanvasRuntimeOptions) {}

  async initialize(): Promise<void> {
    if (this.app || this.destructionPromise) {
      return;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    const { container } = this.options;
    const app = new Application();
    const initializationPromise = this.initializeApplication(app, container);
    this.initializationPromise = initializationPromise;

    try {
      await initializationPromise;
    } finally {
      if (this.initializationPromise === initializationPromise) {
        this.initializationPromise = null;
      }
    }
  }

  private async initializeApplication(
    app: Application,
    container: HTMLDivElement
  ): Promise<Application> {
    await app.init({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: 0x1e1e1e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    this.app = app;

    try {
      const canvas = app.renderer?.canvas;
      if (!canvas) {
        throw new Error('PixiJS application initialization failed: canvas not available');
      }

      container.appendChild(canvas);
      this.layers = new CanvasLayers(app.stage);
      this.imageRenderer = new ImageRenderer(this.layers.imageLayer, {
        loadDataUrl: (filePath) => window.electronAPI.readImageDataUrl(filePath),
        onStatusChange: (status) => this.options.onImageStatusChange(status),
      });

      if (this.pendingProps) {
        this.sync(this.pendingProps);
      }

      return app;
    } catch (error) {
      this.disposeApplication(app);
      throw error;
    }
  }

  sync(props: CanvasRuntimeProps): void {
    this.pendingProps = props;

    if (!this.app || !this.layers || !this.imageRenderer) {
      return;
    }

    const viewport = this.createViewport(props);
    this.viewportMapper.update(viewport);
    this.imageRenderer.applyViewport(viewport);

    const imageKey = props.activeImage ? `${props.activeImage.id}:${props.activeImage.path}` : null;

    if (imageKey !== this.currentImageKey) {
      this.currentImageKey = imageKey;
      void this.imageRenderer.loadImage(props.activeImage).catch((): undefined => undefined);
    }
  }

  resize(width: number, height: number): void {
    if (!this.app?.renderer || width <= 0 || height <= 0) {
      return;
    }

    this.app.renderer.resize(width, height);

    if (this.pendingProps) {
      this.sync(this.pendingProps);
    }
  }

  destroy(): void {
    if (this.destructionPromise) {
      return;
    }

    this.destructionPromise = this.destroyWhenReady();
  }

  private async destroyWhenReady(): Promise<void> {
    const app = this.app ?? (await this.waitForInitialization());

    this.imageRenderer?.destroy();
    this.imageRenderer = null;

    this.layers?.destroy();
    this.layers = null;

    if (app && this.app === app) {
      this.app = null;
      this.disposeApplication(app);
    }
  }

  private async waitForInitialization(): Promise<Application | null> {
    if (!this.initializationPromise) {
      return null;
    }

    try {
      return await this.initializationPromise;
    } catch {
      return null;
    }
  }

  private disposeApplication(app: Application): void {
    const canvas = app.renderer?.canvas;
    if (canvas && canvas.parentNode === this.options.container) {
      this.options.container.removeChild(canvas);
    }

    app.destroy();
  }

  private createViewport(props: CanvasRuntimeProps): ViewportState {
    const image = props.activeImage;

    return {
      canvasWidth: this.options.container.clientWidth,
      canvasHeight: this.options.container.clientHeight,
      imageWidth: image?.width ?? 0,
      imageHeight: image?.height ?? 0,
      zoom: this.clampZoom(props.zoom),
      rotation: props.rotation,
    };
  }

  private clampZoom(zoom: number): number {
    if (!Number.isFinite(zoom)) {
      return 100;
    }

    return Math.min(800, Math.max(10, zoom));
  }
}
