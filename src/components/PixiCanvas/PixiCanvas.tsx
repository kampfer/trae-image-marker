import * as PIXI from 'pixi.js';
import { Application, Graphics, Sprite, Container, Text } from 'pixi.js';
import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';

import styles from './PixiCanvas.module.css';

interface PixiCanvasProps {
  activeImageId: string | null;
  activeImage: {
    id: string;
    name: string;
    path: string;
    width: number;
    height: number;
    createdAt: string;
  } | undefined;
  annotations: Array<{
    id: string;
    type: 'horizontal-line' | 'vertical-line' | 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
  }>;
  activeTool: 'none' | 'horizontal-line' | 'vertical-line' | 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';
  zoom: number | null;
  rotation: number | null;
  showAuxiliaryLines: boolean;
}

interface PixiCanvasState {
  isLoading: boolean;
  error: string | null;
}

class PixiCanvas extends React.Component<PixiCanvasProps, PixiCanvasState> {
  private canvasRef: React.RefObject<HTMLDivElement> = React.createRef();
  private app: Application | null = null;

  constructor(props: PixiCanvasProps) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
    };
  }

  async componentDidMount() {
    if (this.canvasRef.current) {
      try {
        // 使用Application.init()初始化PixiJS应用
        this.app = new Application();
        await this.app.init({
          width: this.canvasRef.current.clientWidth,
          height: this.canvasRef.current.clientHeight,
          backgroundColor: 0x1e1e1e,
          resolution: window.devicePixelRatio || 1,
          antialias: true,
        });

        if (this.app && this.app.canvas) {
          this.canvasRef.current.appendChild(this.app.canvas as HTMLCanvasElement);

          // 处理窗口大小变化
          window.addEventListener('resize', this.handleResize);

          // 初始渲染
          this.renderCanvas();
        } else {
          throw new Error('PixiJS application initialization failed: canvas not available');
        }
      } catch (error) {
        console.error('Error initializing PixiJS app:', error);
        this.setState({ error: '初始化画布失败', isLoading: false });
      }
    } else {
      this.setState({ error: '画布容器不存在', isLoading: false });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.app) {
      try {
        // 移除canvas元素
        if (this.app.canvas && this.canvasRef.current) {
          const canvasElement = this.app.canvas as HTMLCanvasElement;
          if (canvasElement.parentNode === this.canvasRef.current) {
            this.canvasRef.current.removeChild(canvasElement);
          }
        }
        // 清空stage
        if (this.app.stage) {
          this.app.stage.removeChildren();
        }
        // 避免调用destroy方法，使用手动清理
        this.app = null;
      } catch (error) {
        console.warn('Error cleaning up PixiJS app:', error);
      }
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
    if (this.app && this.canvasRef.current) {
      this.app.renderer.resize(this.canvasRef.current.clientWidth, this.canvasRef.current.clientHeight);
      this.renderCanvas();
    }
  };

  private renderCanvas = () => {
    if (!this.app) return;

    const { activeImage, annotations, zoom, rotation } = this.props;

    this.app.stage.removeChildren();

    if (!activeImage) {
      // 显示空状态
      const text = new Text({
        text: '请打开图片文件',
        style: {
          fill: 0x969696,
          fontSize: 16,
        },
      });
      text.position.set(this.app.screen.width / 2 - text.width / 2, this.app.screen.height / 2 - text.height / 2);
      this.app.stage.addChild(text);
      this.setState({ isLoading: false });
      return;
    }

    this.setState({ isLoading: true });

    // 创建图片容器
    const imageContainer = new Container();
    this.app.stage.addChild(imageContainer);

    // 加载图片
    const texture = PIXI.Texture.from(activeImage.path);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    sprite.scale.set(((zoom || 100) / 100) * 0.5);
    sprite.rotation = ((rotation || 0) * Math.PI) / 180;
    imageContainer.addChild(sprite);

    // 渲染标注
    annotations.forEach(annotation => {
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
        <div className={styles.canvasContainer} ref={this.canvasRef}>
          <div className={styles.error}>{error}</div>
        </div>
      );
    }

    return (
      <div className={styles.canvasContainer} ref={this.canvasRef}>
        {isLoading && <div className={styles.loading}>加载中...</div>}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const activeImageId = state.image.activeImageId;
  const activeImage = activeImageId
    ? state.image.images.find(image => image.id === activeImageId)
    : undefined;

  return {
    activeImageId,
    activeImage,
    annotations: activeImageId ? (state.annotation.annotationsByImage[activeImageId] || []) : [],
    activeTool: state.tool.activeTool,
    zoom: activeImageId ? state.canvas.zoomByImage[activeImageId] || 100 : null,
    rotation: activeImageId ? state.canvas.rotationByImage[activeImageId] || 0 : null,
    showAuxiliaryLines: activeImageId ? state.canvas.showAuxiliaryLinesByImage[activeImageId] || false : false,
  };
};

export default connect(mapStateToProps)(PixiCanvas);
