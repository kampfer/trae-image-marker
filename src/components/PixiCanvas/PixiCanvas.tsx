import * as PIXI from 'pixi.js';
import { Application, Graphics, Sprite, Container, Text } from 'pixi.js';
import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';

import styles from './PixiCanvas.module.css';

interface PixiCanvasProps {
  imageId: string;
  activeImageId: string | null;
  activeImage:
    | {
        id: string;
        name: string;
        path: string;
        width: number;
        height: number;
        createdAt: string;
      }
    | undefined;
  annotations: Array<{
    id: string;
    type:
      | 'horizontal-line'
      | 'vertical-line'
      | 'normal-protractor'
      | 'horizontal-protractor'
      | 'vertical-protractor';
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
  }>;
  activeTool:
    | 'none'
    | 'horizontal-line'
    | 'vertical-line'
    | 'normal-protractor'
    | 'horizontal-protractor'
    | 'vertical-protractor';
  zoom: number | null;
  rotation: number | null;
  showAuxiliaryLines: boolean;
}

interface PixiCanvasState {
  isLoading: boolean;
  error: string | null;
}

class PixiCanvas extends React.Component<PixiCanvasProps, PixiCanvasState> {
  private canvasContainerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private app: Application | null = null;
  private isUnmounted = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(props: PixiCanvasProps) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.isUnmounted = false;
    this.initializePixi();
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('resize', this.handleResize);

    const app = this.app;
    this.app = null;
    if (app) {
      this.destroyApp(app);
    }
  }

  componentDidUpdate(prevProps: PixiCanvasProps) {
    const { activeImage, annotations, zoom, rotation } = this.props;

    if (
      activeImage !== prevProps.activeImage ||
      annotations !== prevProps.annotations ||
      zoom !== prevProps.zoom ||
      rotation !== prevProps.rotation
    ) {
      this.renderCanvas();
    }
  }

  private initializePixi = () => {
    const container = this.canvasContainerRef.current;
    if (!container) {
      this.setState({ error: '画布容器不存在', isLoading: false });
      return;
    }

    if (container.clientWidth === 0 || container.clientHeight === 0) {
      this.resizeObserver?.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        if (
          this.isUnmounted ||
          this.app ||
          container.clientWidth === 0 ||
          container.clientHeight === 0
        ) {
          return;
        }

        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.initializePixi();
      });
      this.resizeObserver.observe(container);
      return;
    }

    const app = new Application();
    this.app = app;

    app
      .init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x1e1e1e,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
      })
      .then(() => {
        if (this.isUnmounted || this.app !== app) {
          this.destroyApp(app);
          return;
        }

        const canvasElement = app.renderer?.canvas;
        if (!canvasElement) {
          this.app = null;
          this.destroyApp(app);
          this.setState({
            error: 'PixiJS application initialization failed: canvas not available',
            isLoading: false,
          });
          return;
        }

        container.appendChild(canvasElement);
        window.addEventListener('resize', this.handleResize);
        this.resizeObserver?.disconnect();
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(container);
        this.renderCanvas();
      })
      .catch(() => {
        if (this.isUnmounted || this.app !== app) {
          this.destroyApp(app);
          return;
        }

        this.app = null;
        this.destroyApp(app);
        this.setState({
          error: 'PixiJS application initialization failed',
          isLoading: false,
        });
      });
  };

  private destroyApp = (app: Application) => {
    const renderer = app.renderer;
    if (!renderer) {
      app.stage.removeChildren();
      return;
    }

    const canvasElement = renderer.canvas;
    const container = this.canvasContainerRef.current;
    if (container && canvasElement.parentNode === container) {
      container.removeChild(canvasElement);
    }

    app.destroy();
  };

  private handleResize = () => {
    const app = this.app;
    const container = this.canvasContainerRef.current;
    if (app?.renderer && container && container.clientWidth > 0 && container.clientHeight > 0) {
      app.renderer.resize(container.clientWidth, container.clientHeight);
      this.renderCanvas();
    }
  };

  private renderCanvas = () => {
    const app = this.app;
    if (!app || !app.renderer) return;

    const { activeImage, annotations, zoom, rotation } = this.props;

    app.stage.removeChildren();

    if (!activeImage) {
      const text = new Text({
        text: '请打开图片文件',
        style: {
          fill: 0x969696,
          fontSize: 16,
        },
      });
      text.position.set(
        app.screen.width / 2 - text.width / 2,
        app.screen.height / 2 - text.height / 2
      );
      app.stage.addChild(text);
      this.setState({ isLoading: false });
      return;
    }

    this.setState({ isLoading: true });

    const imageContainer = new Container();
    app.stage.addChild(imageContainer);

    const texture = PIXI.Texture.from(activeImage.path);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.position.set(app.screen.width / 2, app.screen.height / 2);
    sprite.scale.set(((zoom || 100) / 100) * 0.5);
    sprite.rotation = ((rotation || 0) * Math.PI) / 180;
    imageContainer.addChild(sprite);

    annotations.forEach((annotation) => {
      const graphics = new Graphics();
      graphics.lineStyle(2, 0x007acc);

      switch (annotation.type) {
        case 'horizontal-line':
          graphics.moveTo(annotation.startX as number, annotation.startY as number);
          graphics.lineTo(annotation.endX as number, annotation.endY as number);
          break;
        case 'vertical-line':
          graphics.moveTo(annotation.startX as number, annotation.startY as number);
          graphics.lineTo(annotation.endX as number, annotation.endY as number);
          break;
        case 'normal-protractor':
        case 'horizontal-protractor':
        case 'vertical-protractor':
          graphics.moveTo(annotation.vertexX as number, annotation.vertexY as number);
          graphics.lineTo(annotation.startX as number, annotation.startY as number);
          graphics.lineTo(annotation.vertexX as number, annotation.vertexY as number);
          graphics.lineTo(annotation.endX as number, annotation.endY as number);
          break;
      }

      imageContainer.addChild(graphics);
    });

    this.setState({ isLoading: false });
  };

  render() {
    const { isLoading, error } = this.state;

    if (error) {
      return (
        <div className={styles.canvasContainer} ref={this.canvasContainerRef}>
          <div className={styles.error}>{error}</div>
        </div>
      );
    }

    return (
      <div className={styles.canvasContainer} ref={this.canvasContainerRef}>
        {isLoading && <div className={styles.loading}>加载中...</div>}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: { imageId: string }) => {
  const activeImageId = state.image.activeImageId;
  const activeImage = state.image.images.find((image) => image.id === ownProps.imageId);

  return {
    activeImageId,
    activeImage: activeImageId === ownProps.imageId ? activeImage : undefined,
    annotations: state.annotation.annotationsByImage[ownProps.imageId] || [],
    activeTool: state.command.activeTool,
    zoom: state.canvas.zoomByImage[ownProps.imageId] || 100,
    rotation: state.canvas.rotationByImage[ownProps.imageId] || 0,
    showAuxiliaryLines: state.canvas.showAuxiliaryLinesByImage[ownProps.imageId] || false,
  };
};

export default connect(mapStateToProps)(PixiCanvas);
