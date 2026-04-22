import { FloatButton, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { RootState, AppDispatch } from '../../store';
import {
  zoomIn,
  zoomOut,
  fitWindow,
  actualSize,
  addRotation,
  toggleAuxiliaryLines,
} from '../../store/slices/canvasSlice';
import {
  setActiveTool,
  ToolType,
  executeCommand,
  finishCommand,
} from '../../store/slices/commandSlice';

import styles from './Toolbar.module.css';

interface ToolbarProps {
  imageId: string;
  showAuxiliaryLines: boolean;
  dispatch: AppDispatch;
}

interface ToolbarState {
  activeKey: string | null;
}

class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
  constructor(props: ToolbarProps) {
    super(props);
    this.state = {
      activeKey: null,
    };
  }

  handleToolClick = async (toolType: ToolType, key: string) => {
    this.setState({ activeKey: key });
    this.props.dispatch(setActiveTool(toolType));
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    this.setState({ activeKey: null });
  };

  handleZoomIn = () => {
    this.props.dispatch(executeCommand('image-zoom-in'));
    this.props.dispatch(zoomIn(this.props.imageId));
    this.props.dispatch(finishCommand());
  };

  handleZoomOut = () => {
    this.props.dispatch(executeCommand('image-zoom-out'));
    this.props.dispatch(zoomOut(this.props.imageId));
    this.props.dispatch(finishCommand());
  };

  handleFitWindow = () => {
    this.props.dispatch(executeCommand('image-fit-window'));
    this.props.dispatch(fitWindow(this.props.imageId));
    this.props.dispatch(finishCommand());
  };

  handleActualSize = () => {
    this.props.dispatch(executeCommand('image-actual-size'));
    this.props.dispatch(actualSize(this.props.imageId));
    this.props.dispatch(finishCommand());
  };

  handleRotateClockwise = () => {
    this.props.dispatch(executeCommand('image-rotate'));
    this.props.dispatch(addRotation({ imageId: this.props.imageId, delta: 90 }));
    this.props.dispatch(finishCommand());
  };

  handleResetRotation = () => {
    this.props.dispatch(executeCommand('image-reset-rotation'));
    this.props.dispatch(addRotation({ imageId: this.props.imageId, delta: 0 }));
    this.props.dispatch(finishCommand());
  };

  handleToggleAuxiliaryLines = () => {
    this.props.dispatch(toggleAuxiliaryLines(this.props.imageId));
  };

  render() {
    const { showAuxiliaryLines } = this.props;
    const { activeKey } = this.state;

    return (
      <div className={styles.toolbar}>
        <FloatButton.Group shape="circle" className={styles.buttonGroup}>
          <Tooltip title="水平线段" position="left">
            <FloatButton
              icon={<span className={styles.icon}>—</span>}
              type={activeKey === 'tool-horizontal-line' ? 'primary' : 'default'}
              onClick={() => this.handleToolClick('horizontal-line', 'tool-horizontal-line')}
            />
          </Tooltip>
          <Tooltip title="垂直线段" position="left">
            <FloatButton
              icon={<span className={styles.icon}>|</span>}
              type={activeKey === 'tool-vertical-line' ? 'primary' : 'default'}
              onClick={() => this.handleToolClick('vertical-line', 'tool-vertical-line')}
            />
          </Tooltip>
          <Tooltip title="普通量角器" position="left">
            <FloatButton
              icon={<span className={styles.icon}>∠</span>}
              type={activeKey === 'tool-normal-protractor' ? 'primary' : 'default'}
              onClick={() => this.handleToolClick('normal-protractor', 'tool-normal-protractor')}
            />
          </Tooltip>
          <Tooltip title="水平量角器" position="left">
            <FloatButton
              icon={<span className={styles.icon}>⊝</span>}
              type={activeKey === 'tool-horizontal-protractor' ? 'primary' : 'default'}
              onClick={() =>
                this.handleToolClick('horizontal-protractor', 'tool-horizontal-protractor')
              }
            />
          </Tooltip>
          <Tooltip title="垂直量角器" position="left">
            <FloatButton
              icon={<span className={styles.icon}>⊞</span>}
              type={activeKey === 'tool-vertical-protractor' ? 'primary' : 'default'}
              onClick={() =>
                this.handleToolClick('vertical-protractor', 'tool-vertical-protractor')
              }
            />
          </Tooltip>
        </FloatButton.Group>

        <FloatButton.Group shape="circle" className={styles.buttonGroup}>
          <Tooltip title="放大 (Ctrl++)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>+</span>}
              onClick={this.handleZoomIn}
            />
          </Tooltip>
          <Tooltip title="缩小 (Ctrl+-)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>-</span>}
              onClick={this.handleZoomOut}
            />
          </Tooltip>
          <Tooltip title="适应窗口 (Ctrl+0)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>⊡</span>}
              onClick={this.handleFitWindow}
            />
          </Tooltip>
          <Tooltip title="实际大小 (Ctrl+1)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>1:1</span>}
              onClick={this.handleActualSize}
            />
          </Tooltip>
        </FloatButton.Group>

        <FloatButton.Group shape="circle" className={styles.buttonGroup}>
          <Tooltip title="顺时针旋转 (Ctrl+R)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>↻</span>}
              onClick={this.handleRotateClockwise}
            />
          </Tooltip>
          <Tooltip title="重置旋转 (Ctrl+Shift+0)" position="left">
            <FloatButton
              icon={<span className={styles.icon}>↺</span>}
              onClick={this.handleResetRotation}
            />
          </Tooltip>
        </FloatButton.Group>

        <FloatButton.Group shape="circle" className={styles.buttonGroup}>
          <Tooltip title="辅助线开关" position="left">
            <FloatButton
              icon={<span className={styles.icon}>⊥</span>}
              type={showAuxiliaryLines ? 'primary' : 'default'}
              onClick={this.handleToggleAuxiliaryLines}
            />
          </Tooltip>
        </FloatButton.Group>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: { imageId: string }) => ({
  showAuxiliaryLines: state.canvas.showAuxiliaryLinesByImage[ownProps.imageId] || false,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
