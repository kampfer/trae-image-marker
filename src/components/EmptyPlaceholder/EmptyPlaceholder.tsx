import { Button } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { AppDispatch } from '../../store';
import { createNewFile, openFile } from '../../store/slices/fileSlice';

import styles from './EmptyPlaceholder.module.css';

interface EmptyPlaceholderProps {
  dispatch: AppDispatch;
}

/**
 * EmptyPlaceholder 组件
 * 空状态占位组件，在未打开任何标注文件时显示。
 * 提供「新建标注文件」和「打开标注文件」两个快捷操作入口，引导用户开始使用应用。
 */
class EmptyPlaceholder extends React.Component<EmptyPlaceholderProps> {
  /**
   * 处理新建标注文件点击事件
   */
  handleNewFile = () => {
    this.props.dispatch(createNewFile());
  };

  /**
   * 处理打开标注文件点击事件
   */
  handleOpenFile = () => {
    this.props.dispatch(openFile());
  };

  render() {
    return (
      <div className={styles.emptyPlaceholder}>
        <div className={styles.icon}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke="#969696"
              strokeWidth="1.5"
              fill="none"
            />
            <path d="M14 2V8H20" stroke="#969696" strokeWidth="1.5" fill="none" />
            <path d="M12 18V12M9 15H15" stroke="#007acc" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className={styles.title}>欢迎使用 Trae Image Marker</h2>
        <p className={styles.description}>请新建或打开一个标注文件，开始您的标注工作</p>
        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            className={styles.actionButton}
            onClick={this.handleNewFile}
          >
            新建标注文件
          </Button>
          <Button size="large" className={styles.actionButton} onClick={this.handleOpenFile}>
            打开标注文件
          </Button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(null, mapDispatchToProps)(EmptyPlaceholder);
