import React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { selectIsFileOpened } from '../../store/selectors';
import EmptyPlaceholder from '../EmptyPlaceholder';
import TabsBar from '../TabsBar';

import styles from './MainContent.module.css';

interface MainContentProps {
  isFileOpened: boolean;
}

/**
 * MainContent 组件
 * 根据文件状态切换主内容区：
 * - 未打开文件 → 渲染 EmptyPlaceholder
 * - 已打开文件 → 渲染 TabsBar（包括无图片时的添加按钮）
 */
class MainContent extends React.Component<MainContentProps> {
  render() {
    const { isFileOpened } = this.props;

    return (
      <div className={styles.mainContent}>{isFileOpened ? <TabsBar /> : <EmptyPlaceholder />}</div>
    );
  }
}

const mapStateToProps = (state: RootState): MainContentProps => ({
  isFileOpened: selectIsFileOpened(state),
});

export default connect(mapStateToProps)(MainContent);
