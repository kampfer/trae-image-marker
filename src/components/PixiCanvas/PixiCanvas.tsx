import React from 'react';
import { connect } from 'react-redux';

import type { ImageInfo } from '../../types/fileTypes';
import { RootState } from '../../store';
import type { AnnotationType } from '../../store/slices/annotationSlice';
import type { ToolType } from '../../store/slices/commandSlice';
import { CanvasRuntime } from './runtime/CanvasRuntime';
import type { ImageRendererStatus } from './renderers/ImageRenderer';

import styles from './PixiCanvas.module.css';

interface PixiCanvasProps {
  imageId: string;
  activeImage: ImageInfo | undefined;
  annotations: AnnotationType[];
  activeTool: ToolType;
  zoom: number;
  rotation: number;
  showAuxiliaryLines: boolean;
}

interface PixiCanvasState {
  isLoading: boolean;
  error: string | null;
}

class PixiCanvas extends React.Component<PixiCanvasProps, PixiCanvasState> {
  private readonly canvasContainerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private runtime: CanvasRuntime | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isUnmounted = false;
  private isInitializing = false;

  constructor(props: PixiCanvasProps) {
    super(props);
    this.state = {
      isLoading: Boolean(props.activeImage),
      error: null,
    };
  }

  componentDidMount(): void {
    this.isUnmounted = false;
    this.resizeObserver = new ResizeObserver(this.handleResize);

    const container = this.canvasContainerRef.current;
    if (container) {
      this.resizeObserver.observe(container);
    }

    this.initializeRuntimeIfNeeded();
  }

  componentDidUpdate(): void {
    if (!this.runtime) {
      this.initializeRuntimeIfNeeded();
      return;
    }

    this.syncRuntime();
  }

  componentWillUnmount(): void {
    this.isUnmounted = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.runtime?.destroy();
    this.runtime = null;
  }

  private initializeRuntimeIfNeeded = (): void => {
    if (this.runtime || this.isInitializing || this.isUnmounted) {
      return;
    }

    const container = this.canvasContainerRef.current;
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) {
      return;
    }

    this.isInitializing = true;
    const runtime = new CanvasRuntime({
      container,
      onImageStatusChange: this.handleImageStatusChange,
    });
    this.runtime = runtime;

    void runtime
      .initialize()
      .then(() => {
        if (this.isUnmounted || this.runtime !== runtime) {
          runtime.destroy();
          return;
        }

        this.setState({ error: null });
        this.syncRuntime();
      })
      .catch((error: unknown) => {
        if (this.isUnmounted || this.runtime !== runtime) {
          return;
        }

        this.runtime = null;
        runtime.destroy();
        this.setState({
          isLoading: false,
          error: error instanceof Error ? error.message : 'PixiJS 初始化失败',
        });
      })
      .finally(() => {
        this.isInitializing = false;
      });
  };

  private syncRuntime = (): void => {
    if (!this.runtime) {
      return;
    }

    const { activeImage, zoom, rotation } = this.props;
    this.runtime.sync({ activeImage, zoom, rotation });
  };

  private handleResize = (): void => {
    const container = this.canvasContainerRef.current;
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) {
      return;
    }

    if (!this.runtime) {
      this.initializeRuntimeIfNeeded();
      return;
    }

    this.runtime.resize(container.clientWidth, container.clientHeight);
  };

  private handleImageStatusChange = (status: ImageRendererStatus): void => {
    if (this.isUnmounted) {
      return;
    }

    this.setState({
      isLoading: status.isLoading,
      error: status.error,
    });
  };

  render(): React.ReactNode {
    const { activeImage } = this.props;
    const { isLoading, error } = this.state;

    return (
      <div className={styles.canvasContainer} ref={this.canvasContainerRef}>
        {error && <div className={styles.error}>{error}</div>}
        {!error && activeImage && isLoading && <div className={styles.loading}>加载中...</div>}
        {!error && !activeImage && <div className={styles.empty}>请打开图片文件</div>}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: { imageId: string }) => ({
  activeImage:
    state.image.activeImageId === ownProps.imageId
      ? state.image.images.find((image) => image.id === ownProps.imageId)
      : undefined,
  annotations: state.annotation.annotationsByImage[ownProps.imageId] || [],
  activeTool: state.command.activeTool,
  zoom: state.canvas.zoomByImage[ownProps.imageId] || 100,
  rotation: state.canvas.rotationByImage[ownProps.imageId] || 0,
  showAuxiliaryLines: state.canvas.showAuxiliaryLinesByImage[ownProps.imageId] || false,
});

export default connect(mapStateToProps)(PixiCanvas);
