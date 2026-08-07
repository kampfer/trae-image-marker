import { Assets, Container, Sprite, Texture } from 'pixi.js';

import type { ImageInfo } from '../../../types/fileTypes';
import type { ViewportState } from '../model/viewportTypes';

export type ImageDataUrlLoader = (filePath: string) => Promise<string>;

export interface ImageRendererStatus {
  isLoading: boolean;
  error: string | null;
}

export interface ImageRendererOptions {
  loadDataUrl: ImageDataUrlLoader;
  onStatusChange?: (status: ImageRendererStatus) => void;
}

export class ImageRenderer {
  private sprite: Sprite | null = null;
  private currentImageId: string | null = null;
  private currentAssetUrl: string | null = null;
  private loadRequestId = 0;

  constructor(
    private readonly layer: Container,
    private readonly options: ImageRendererOptions
  ) {}

  async loadImage(image: ImageInfo | undefined): Promise<void> {
    const requestId = ++this.loadRequestId;
    this.clearSprite();

    if (!image) {
      this.currentImageId = null;
      this.setStatus({ isLoading: false, error: null });
      return;
    }

    this.setStatus({ isLoading: true, error: null });

    try {
      const dataUrl = await this.options.loadDataUrl(image.path);
      if (requestId !== this.loadRequestId) {
        return;
      }

      const texture = await Assets.load<Texture>(dataUrl);
      if (requestId !== this.loadRequestId) {
        void Assets.unload(dataUrl).catch((): undefined => undefined);
        return;
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      this.sprite = sprite;
      this.currentImageId = image.id;
      this.currentAssetUrl = dataUrl;
      this.layer.addChild(sprite);

      this.setStatus({ isLoading: false, error: null });
    } catch (error) {
      if (requestId !== this.loadRequestId) {
        return;
      }

      this.currentImageId = null;
      this.setStatus({
        isLoading: false,
        error: this.getErrorMessage(error),
      });
    }
  }

  applyViewport(viewport: ViewportState): void {
    const scale = viewport.zoom / 100;

    this.layer.position.set(viewport.canvasWidth / 2, viewport.canvasHeight / 2);
    this.layer.scale.set(scale);
    this.layer.rotation = (viewport.rotation * Math.PI) / 180;
  }

  clear(): void {
    ++this.loadRequestId;
    this.clearSprite();
    this.currentImageId = null;
    this.setStatus({ isLoading: false, error: null });
  }

  destroy(): void {
    ++this.loadRequestId;
    this.clearSprite();
  }

  get imageId(): string | null {
    return this.currentImageId;
  }

  private clearSprite(): void {
    if (this.sprite) {
      this.layer.removeChild(this.sprite);
      this.sprite.destroy();
      this.sprite = null;
    }

    const assetUrl = this.currentAssetUrl;
    this.currentAssetUrl = null;

    if (assetUrl) {
      void Assets.unload(assetUrl).catch((): undefined => undefined);
    }
  }

  private setStatus(status: ImageRendererStatus): void {
    this.options.onStatusChange?.(status);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : '图片加载失败';
  }
}
