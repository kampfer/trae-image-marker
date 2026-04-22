import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { RootState, AppDispatch } from '../../store';
import { clearAllAnnotations, deleteSelectedAnnotations } from '../../store/slices/annotationSlice';
import {
  zoomIn,
  zoomOut,
  fitWindow,
  actualSize,
  addRotation,
} from '../../store/slices/canvasSlice';
import { CommandId } from '../../store/slices/commandSlice';
import { createNewFile } from '../../store/slices/fileSlice';
import { undo, redo } from '../../store/slices/historySlice';

import styles from './MenuBar.module.css';

interface MenuBarProps {
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

class MenuBar extends React.Component<MenuBarProps> {
  handleNewMarkerFile = () => {
    this.props.dispatch(createNewFile());
  };

  handleOpenMarkerFile = () => {
    console.log('打开文件');
  };

  handleSaveMarkerFile = () => {
    console.log('保存文件');
  };

  handleSaveMarkerFileAs = () => {
    console.log('另存为文件');
  };

  handleAddImageToFile = () => {
    console.log('添加图片');
  };

  handleRemoveImageFromFile = () => {
    if (this.props.activeImageId) {
      console.log('删除图片', this.props.activeImageId);
    }
  };

  handleExportImageFromFile = () => {
    if (this.props.activeImageId) {
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

  handleSetActiveTool = (toolId: CommandId) => {
    console.log('设置工具', toolId);
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
      this.props.dispatch(addRotation({ imageId: this.props.activeImageId, delta: 90 }));
    }
  };

  handleRotateCounterClockwise = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(addRotation({ imageId: this.props.activeImageId, delta: -90 }));
    }
  };

  handleResetRotation = () => {
    if (this.props.activeImageId) {
      this.props.dispatch(addRotation({ imageId: this.props.activeImageId, delta: 0 }));
    }
  };

  handleOpenDevTools = () => {
    console.log('打开开发者工具');
  };

  render() {
    const {
      activeImageId,
      isFileOpened,
      isModified,
      canUndo,
      canRedo,
      hasAnnotations,
      hasSelectedAnnotations,
      zoom,
    } = this.props;

    const fileMenuItems: MenuProps['items'] = [
      { key: 'file-new', label: '新建', onClick: this.handleNewMarkerFile },
      { key: 'file-open', label: '打开', onClick: this.handleOpenMarkerFile },
      {
        key: 'file-save',
        label: '保存 (Ctrl+S)',
        onClick: this.handleSaveMarkerFile,
        disabled: !isFileOpened || !isModified,
      },
      {
        key: 'file-save-as',
        label: '另存为 (Ctrl+Shift+S)',
        onClick: this.handleSaveMarkerFileAs,
        disabled: !isFileOpened,
      },
      { type: 'divider' },
      {
        key: 'file-add-image',
        label: '添加图片',
        onClick: this.handleAddImageToFile,
        disabled: !isFileOpened,
      },
      {
        key: 'file-remove-image',
        label: '删除图片',
        onClick: this.handleRemoveImageFromFile,
        disabled: !isFileOpened || !activeImageId,
      },
      { type: 'divider' },
      {
        key: 'file-export-png',
        label: '导出PNG',
        onClick: this.handleExportImageFromFile,
        disabled: !isFileOpened || !activeImageId,
      },
    ];

    const editMenuItems: MenuProps['items'] = [
      {
        key: 'edit-undo',
        label: '撤销 (Ctrl+Z)',
        onClick: this.handleUndo,
        disabled: !activeImageId || !canUndo,
      },
      {
        key: 'edit-redo',
        label: '重做 (Ctrl+Y)',
        onClick: this.handleRedo,
        disabled: !activeImageId || !canRedo,
      },
      { type: 'divider' },
      {
        key: 'edit-clear-all',
        label: '清除所有标注',
        onClick: this.handleClearAllAnnotations,
        disabled: !activeImageId || !hasAnnotations,
      },
      {
        key: 'edit-delete-selected',
        label: '删除选中标注 (Delete)',
        onClick: this.handleDeleteSelectedAnnotations,
        disabled: !activeImageId || !hasSelectedAnnotations,
      },
    ];

    const annotationMenuItems: MenuProps['items'] = [
      {
        key: 'tool-horizontal-line',
        label: '水平线段',
        onClick: () => this.handleSetActiveTool('tool-horizontal-line'),
        disabled: !isFileOpened || !activeImageId,
      },
      {
        key: 'tool-vertical-line',
        label: '垂直线段',
        onClick: () => this.handleSetActiveTool('tool-vertical-line'),
        disabled: !isFileOpened || !activeImageId,
      },
      { type: 'divider' },
      {
        key: 'tool-normal-protractor',
        label: '普通量角器',
        onClick: () => this.handleSetActiveTool('tool-normal-protractor'),
        disabled: !isFileOpened || !activeImageId,
      },
      {
        key: 'tool-horizontal-protractor',
        label: '水平量角器',
        onClick: () => this.handleSetActiveTool('tool-horizontal-protractor'),
        disabled: !isFileOpened || !activeImageId,
      },
      {
        key: 'tool-vertical-protractor',
        label: '垂直量角器',
        onClick: () => this.handleSetActiveTool('tool-vertical-protractor'),
        disabled: !isFileOpened || !activeImageId,
      },
    ];

    const imageMenuItems: MenuProps['items'] = [
      {
        key: 'image-zoom-in',
        label: '放大 (Ctrl++)',
        onClick: this.handleZoomIn,
        disabled: !activeImageId || (zoom && zoom >= 800),
      },
      {
        key: 'image-zoom-out',
        label: '缩小 (Ctrl+-)',
        onClick: this.handleZoomOut,
        disabled: !activeImageId || (zoom && zoom <= 10),
      },
      { type: 'divider' },
      {
        key: 'image-fit-window',
        label: '适应窗口 (Ctrl+0)',
        onClick: this.handleFitWindow,
        disabled: !activeImageId,
      },
      {
        key: 'image-actual-size',
        label: '实际大小 (Ctrl+1)',
        onClick: this.handleActualSize,
        disabled: !activeImageId,
      },
      { type: 'divider' },
      {
        key: 'image-rotate',
        label: '顺时针旋转 (Ctrl+R)',
        onClick: this.handleRotateClockwise,
        disabled: !activeImageId,
      },
      {
        key: 'image-rotate-counter',
        label: '逆时针旋转 (Ctrl+Shift+R)',
        onClick: this.handleRotateCounterClockwise,
        disabled: !activeImageId,
      },
      {
        key: 'image-reset-rotation',
        label: '重置旋转 (Ctrl+Shift+0)',
        onClick: this.handleResetRotation,
        disabled: !activeImageId,
      },
    ];

    const helpMenuItems: MenuProps['items'] = [
      { key: 'help-dev-tools', label: '开发者工具', onClick: this.handleOpenDevTools },
    ];

    return (
      <div className={styles.menuBar}>
        <Dropdown menu={{ items: fileMenuItems }}>
          <Button className={styles.menuButton}>文件</Button>
        </Dropdown>
        <Dropdown menu={{ items: editMenuItems }}>
          <Button className={styles.menuButton}>编辑</Button>
        </Dropdown>
        <Dropdown menu={{ items: annotationMenuItems }}>
          <Button className={styles.menuButton}>标注</Button>
        </Dropdown>
        <Dropdown menu={{ items: imageMenuItems }}>
          <Button className={styles.menuButton}>图片</Button>
        </Dropdown>
        <Dropdown menu={{ items: helpMenuItems }}>
          <Button className={styles.menuButton}>帮助</Button>
        </Dropdown>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const activeImageId = state.image.activeImageId;
  return {
    activeImageId,
    isFileOpened: state.file.filePath !== null,
    isModified: state.file.hasUnsavedChanges,
    canUndo: activeImageId ? state.history.pastByImage[activeImageId]?.length > 0 : false,
    canRedo: activeImageId ? state.history.futureByImage[activeImageId]?.length > 0 : false,
    hasAnnotations: activeImageId
      ? (state.annotation.annotationsByImage[activeImageId]?.length || 0) > 0
      : false,
    hasSelectedAnnotations: activeImageId
      ? (state.annotation.selectedAnnotationsByImage[activeImageId]?.length || 0) > 0
      : false,
    zoom: activeImageId ? state.canvas.zoomByImage[activeImageId] || 100 : null,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuBar);
