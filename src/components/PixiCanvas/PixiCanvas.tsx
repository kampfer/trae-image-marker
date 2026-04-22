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

  constructor(props: PixiCanvasProps) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
    };
  }

  async componentDidMount() {
    if (this.canvasContainerRef.current) {
      this.app = new Application();
      await this.app.init({
        width: this.canvasContainerRef.current.clientWidth,
        height: this.canvasContainerRef.current.clientHeight,
        backgroundColor: 0x1e1e1e,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
      });

      if (this.app && this.app.canvas) {
        this.canvasContainerRef.current.appendChild(this.app.canvas as HTMLCanvasElement);
        window.addEventListener('resize', this.handleResize);
        this.renderCanvas();
      } else {
        this.setState({
          error: 'PixiJS application initialization failed: canvas not available',
          isLoading: false,
        });
      }
    } else {
      this.setState({ error: '画布容器不存在', isLoading: false });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.app) {
      if (this.app.canvas && this.canvasContainerRef.current) {
        const canvasElement = this.app.canvas as HTMLCanvasElement;
        if (canvasElement.parentNode === this.canvasContainerRef.current) {
          this.canvasContainerRef.current.removeChild(canvasElement);
        }
      }
      if (this.app.stage) {
        this.app.stage.removeChildren();
      }
      this.app = null;
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

  private handleResize = () => {
    if (this.app && this.canvasContainerRef.current) {
      this.app.renderer.resize(
        this.canvasContainerRef.current.clientWidth,
        this.canvasContainerRef.current.clientHeight
      );
      this.renderCanvas();
    }
  };

  private renderCanvas = () => {
    if (!this.app) return;

    const { activeImage, annotations, zoom, rotation } = this.props;

    this.app.stage.removeChildren();

    if (!activeImage) {
      const text = new Text({
        text: '请打开图片文件',
        style: {
          fill: 0x969696,
          fontSize: 16,
        },
      });
      text.position.set(
        this.app.screen.width / 2 - text.width / 2,
        this.app.screen.height / 2 - text.height / 2
      );
      this.app.stage.addChild(text);
      this.setState({ isLoading: false });
      return;
    }

    this.setState({ isLoading: true });

    const imageContainer = new Container();
    this.app.stage.addChild(imageContainer);

    const texture = PIXI.Texture.from(activeImage.path);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
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
