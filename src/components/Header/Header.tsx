import { Dropdown, Menu, Button } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { RootState, AppDispatch } from '../../store';
import {
  selectActiveImageId,
  selectIsFileOpened,
  selectIsModified,
  selectCanUndo,
  selectCanRedo,
  selectHasAnnotations,
  selectHasSelectedAnnotations,
  selectActiveImageZoom,
} from '../../store/selectors';
import {
  setActiveTool,
  ToolType,
} from '../../store/slices/toolSlice';
import {
  clearAllAnnotations,
  deleteSelectedAnnotations,
} from '../../store/slices/annotationSlice';
import {
  undo,
  redo,
} from '../../store/slices/historySlice';
import {
  zoomIn,
  zoomOut,
  fitWindow,
  actualSize,
  setRotation,
} from '../../store/slices/canvasSlice';
import {
  newMarkerFile,
} from '../../store/slices/fileSlice';

import styles from './Header.module.css';

interface HeaderProps {
  activeImageId: string | null;
  isFileOpened: boolean;
  isModified: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasAnnotations: boolean;
  hasSelectedAnnotations: boolean;
  zoom: number | null;
  dispatch: AppDispatch;
}

class Header extends React.Component<HeaderProps> {
  handleNewMarkerFile = () => {
    this.props.dispatch(newMarkerFile());
  };

  handleOpenMarkerFile = () => {
    // 实现打开文件的逻辑
    console.log('打开文件');
  };

  handleSaveMarkerFile = () => {
    // 实现保存文件的逻辑
    console.log('保存文件');
  };

  handleSaveMarkerFileAs = () => {
    // 实现另存为文件的逻辑
    console.log('另存为文件');
  };

  handleAddImageToFile = () => {
    // 实现添加图片的逻辑
    console.log('添加图片');
  };

  handleRemoveImageFromFile = () => {
    if (this.props.activeImageId) {
      // 实现删除图片的逻辑
      console.log('删除图片', this.props.activeImageId);
    }
  };

  handleExportImageFromFile = () => {
    if (this.props.activeImageId) {
      // 实现导出图片的逻辑
      console.log('导出图片', this.props.activeImageId);
    }
  };

  handleUndo = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(undo(this.props.activeImageId));
    }
  };

  handleRedo = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(redo(this.props.activeImageId));
    }
  };

  handleClearAllAnnotations = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(clearAllAnnotations(this.props.activeImageId));
    }
  };

  handleDeleteSelectedAnnotations = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(deleteSelectedAnnotations(this.props.activeImageId));
    }
  };

  handleSetActiveTool = (toolType: ToolType) => {
    this.props.dispatch(setActiveTool(toolType));
  };

  handleZoomIn = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(zoomIn(this.props.activeImageId));
    }
  };

  handleZoomOut = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(zoomOut(this.props.activeImageId));
    }
  };

  handleFitWindow = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(fitWindow(this.props.activeImageId));
    }
  };

  handleActualSize = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(actualSize(this.props.activeImageId));
    }
  };

  handleRotateClockwise = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(setRotation({ imageId: this.props.activeImageId, angle: 90 }));
    }
  };

  handleRotateCounterClockwise = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(setRotation({ imageId: this.props.activeImageId, angle: -90 }));
    }
  };

  handleResetRotation = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(setRotation({ imageId: this.props.activeImageId, angle: 0 }));
    }
  };

  handleOpenDevTools = () => {
    // 实现打开开发者工具的逻辑
    console.log('打开开发者工具');
  };

  render() {
    const { activeImageId, isFileOpened, isModified, canUndo, canRedo, hasAnnotations, hasSelectedAnnotations, zoom } = this.props;

    const fileMenu = (
      <Menu>
        <Menu.Item key="file-new" onClick={this.handleNewMarkerFile}>
          新建
        </Menu.Item>
        <Menu.Item key="file-open" onClick={this.handleOpenMarkerFile}>
          打开
        </Menu.Item>
        <Menu.Item key="file-save" onClick={this.handleSaveMarkerFile} disabled={!isFileOpened || !isModified}>
          保存 (Ctrl+S)
        </Menu.Item>
        <Menu.Item key="file-save-as" onClick={this.handleSaveMarkerFileAs} disabled={!isFileOpened}>
          另存为 (Ctrl+Shift+S)
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="file-add-image" onClick={this.handleAddImageToFile} disabled={!isFileOpened}>
          添加图片
        </Menu.Item>
        <Menu.Item key="file-remove-image" onClick={this.handleRemoveImageFromFile} disabled={!isFileOpened || !activeImageId}>
          删除图片
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="file-export-png" onClick={this.handleExportImageFromFile} disabled={!isFileOpened || !activeImageId}>
          导出PNG
        </Menu.Item>
      </Menu>
    );

    const editMenu = (
      <Menu>
        <Menu.Item key="edit-undo" onClick={this.handleUndo} disabled={!activeImageId || !canUndo}>
          撤销 (Ctrl+Z)
        </Menu.Item>
        <Menu.Item key="edit-redo" onClick={this.handleRedo} disabled={!activeImageId || !canRedo}>
          重做 (Ctrl+Y)
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="edit-clear-all" onClick={this.handleClearAllAnnotations} disabled={!activeImageId || !hasAnnotations}>
          清除所有标注
        </Menu.Item>
        <Menu.Item key="edit-delete-selected" onClick={this.handleDeleteSelectedAnnotations} disabled={!activeImageId || !hasSelectedAnnotations}>
          删除选中标注 (Delete)
        </Menu.Item>
      </Menu>
    );

    const annotationMenu = (
      <Menu>
        <Menu.Item key="tool-horizontal-line" onClick={() => this.handleSetActiveTool('horizontal-line')} disabled={!isFileOpened || !activeImageId}>
          水平线段
        </Menu.Item>
        <Menu.Item key="tool-vertical-line" onClick={() => this.handleSetActiveTool('vertical-line')} disabled={!isFileOpened || !activeImageId}>
          垂直线段
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="tool-normal-protractor" onClick={() => this.handleSetActiveTool('normal-protractor')} disabled={!isFileOpened || !activeImageId}>
          普通量角器
        </Menu.Item>
        <Menu.Item key="tool-horizontal-protractor" onClick={() => this.handleSetActiveTool('horizontal-protractor')} disabled={!isFileOpened || !activeImageId}>
          水平量角器
        </Menu.Item>
        <Menu.Item key="tool-vertical-protractor" onClick={() => this.handleSetActiveTool('vertical-protractor')} disabled={!isFileOpened || !activeImageId}>
          垂直量角器
        </Menu.Item>
      </Menu>
    );

    const imageMenu = (
      <Menu>
        <Menu.Item key="image-zoom-in" onClick={this.handleZoomIn} disabled={!activeImageId || (zoom && zoom >= 800)}>
          放大 (Ctrl++)
        </Menu.Item>
        <Menu.Item key="image-zoom-out" onClick={this.handleZoomOut} disabled={!activeImageId || (zoom && zoom <= 10)}>
          缩小 (Ctrl+-)
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="image-fit-window" onClick={this.handleFitWindow} disabled={!activeImageId}>
          适应窗口 (Ctrl+0)
        </Menu.Item>
        <Menu.Item key="image-actual-size" onClick={this.handleActualSize} disabled={!activeImageId}>
          实际大小 (Ctrl+1)
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="image-rotate" onClick={this.handleRotateClockwise} disabled={!activeImageId}>
          顺时针旋转 (Ctrl+R)
        </Menu.Item>
        <Menu.Item key="image-rotate-counter" onClick={this.handleRotateCounterClockwise} disabled={!activeImageId}>
          逆时针旋转 (Ctrl+Shift+R)
        </Menu.Item>
        <Menu.Item key="image-reset-rotation" onClick={this.handleResetRotation} disabled={!activeImageId}>
          重置旋转 (Ctrl+Shift+0)
        </Menu.Item>
      </Menu>
    );

    const helpMenu = (
      <Menu>
        <Menu.Item key="help-dev-tools" onClick={this.handleOpenDevTools}>
          开发者工具
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.header}>
        <div className={styles.menuBar}>
          <Dropdown overlay={fileMenu} trigger={['click']}>
            <Button className={styles.menuButton}>文件</Button>
          </Dropdown>
          <Dropdown overlay={editMenu} trigger={['click']}>
            <Button className={styles.menuButton}>编辑</Button>
          </Dropdown>
          <Dropdown overlay={annotationMenu} trigger={['click']}>
            <Button className={styles.menuButton}>标注</Button>
          </Dropdown>
          <Dropdown overlay={imageMenu} trigger={['click']}>
            <Button className={styles.menuButton}>图片</Button>
          </Dropdown>
          <Dropdown overlay={helpMenu} trigger={['click']}>
            <Button className={styles.menuButton}>帮助</Button>
          </Dropdown>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const activeImageId = state.image.activeImageId;
  return {
    activeImageId,
    isFileOpened: state.file.isFileOpened,
    isModified: state.file.isModified,
    canUndo: activeImageId ? state.history.pastByImage[activeImageId]?.length > 0 : false,
    canRedo: activeImageId ? state.history.futureByImage[activeImageId]?.length > 0 : false,
    hasAnnotations: activeImageId ? (state.annotation.annotationsByImage[activeImageId]?.length || 0) > 0 : false,
    hasSelectedAnnotations: activeImageId ? (state.annotation.selectedAnnotationsByImage[activeImageId]?.length || 0) > 0 : false,
    zoom: activeImageId ? state.canvas.zoomByImage[activeImageId] || 100 : null,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
