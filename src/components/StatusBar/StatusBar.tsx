import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';

import styles from './StatusBar.module.css';

interface StatusBarProps {
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
  zoom: number | null;
  rotation: number | null;
}

class StatusBar extends React.Component<StatusBarProps> {
  render() {
    const { activeImage, zoom, rotation } = this.props;

    const imageName = activeImage ? activeImage.name : '无图片';
    const imageSize = activeImage ? `${activeImage.width} x ${activeImage.height}` : '无图片';

    return (
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.label}>图片: </span>
          <span className={styles.value}>{imageName}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.label}>缩放: </span>
          <span className={styles.value}>{zoom || '100'}%</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.label}>旋转: </span>
          <span className={styles.value}>{rotation || 0}°</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.label}>尺寸: </span>
          <span className={styles.value}>{imageSize}</span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const activeImageId = state.image.activeImageId;
  const activeImage = activeImageId
    ? state.image.images.find((image) => image.id === activeImageId)
    : undefined;

  return {
    activeImageId,
    activeImage,
    zoom: activeImageId ? state.canvas.zoomByImage[activeImageId] || 100 : null,
    rotation: activeImageId ? state.canvas.rotationByImage[activeImageId] || 0 : null,
  };
};

export default connect(mapStateToProps)(StatusBar);
