import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';

import styles from './Footer.module.css';

interface FooterProps {
  currentFile: string | null;
  activeImageId: string | null;
  activeImage: {
    id: string;
    name: string;
    path: string;
    width: number;
    height: number;
    createdAt: string;
  } | undefined;
  zoom: number | null;
  rotation: number | null;
}

class Footer extends React.Component<FooterProps> {
  render() {
    const { currentFile, activeImage, zoom, rotation } = this.props;

    const fileName = currentFile ? currentFile.split('\\').pop() : '未打开文件';
    const imageSize = activeImage ? `${activeImage.width} x ${activeImage.height}` : '无图片';

    return (
      <div className={styles.footer}>
        <div className={styles.footerItem}>
          <span className={styles.label}>文件: </span>
          <span className={styles.value}>{fileName}</span>
        </div>
        <div className={styles.footerItem}>
          <span className={styles.label}>缩放: </span>
          <span className={styles.value}>{zoom || '100'}%</span>
        </div>
        <div className={styles.footerItem}>
          <span className={styles.label}>旋转: </span>
          <span className={styles.value}>{rotation || 0}°</span>
        </div>
        <div className={styles.footerItem}>
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
    ? state.image.images.find(image => image.id === activeImageId)
    : undefined;

  return {
    currentFile: state.file.currentFile,
    activeImageId,
    activeImage,
    zoom: activeImageId ? state.canvas.zoomByImage[activeImageId] || 100 : null,
    rotation: activeImageId ? state.canvas.rotationByImage[activeImageId] || 0 : null,
  };
};

export default connect(mapStateToProps)(Footer);
