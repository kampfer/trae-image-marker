import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { selectIsFileOpened, selectImages } from '../../store/selectors';
import EmptyFilePlaceholder from '../EmptyFilePlaceholder';
import EmptyPlaceholder from '../EmptyPlaceholder';
import TabsBar from '../TabsBar';

import styles from './MainContent.module.css';

interface MainContentProps {
  isFileOpened: boolean;
  hasImages: boolean;
}

/**
 * MainContent 组件
 * 根据文件和图片状态切换主内容区：
 * - 未打开文件 → 渲染 EmptyPlaceholder
 * - 已打开文件但没有图片 → 渲染 EmptyFilePlaceholder
 * - 已打开文件且存在图片 → 渲染 TabsBar
 */
class MainContent extends React.Component<MainContentProps> {
  render() {
    const { isFileOpened, hasImages } = this.props;

    return (
      <div className={styles.mainContent}>
        {!isFileOpened ? <EmptyPlaceholder /> : hasImages ? <TabsBar /> : <EmptyFilePlaceholder />}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): MainContentProps => ({
  isFileOpened: selectIsFileOpened(state),
  hasImages: selectImages(state).length > 0,
});

export default connect(mapStateToProps)(MainContent);
