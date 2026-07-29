import React from 'react';
import { connect } from 'react-redux';

import { selectIsFileOpened } from '../../store/selectors';
import TabsBar from '../TabsBar';
import EmptyPlaceholder from '../EmptyPlaceholder';

import styles from './MainContent.module.css';

interface MainContentProps {
  isFileOpened: boolean;
}

/**
 * MainContent 组件
 * 主内容区容器组件，根据当前是否存在已打开的标注文件，自动切换显示内容：
 * - 存在已打开文件 → 渲染 TabsBar 标签页栏
 * - 不存在已打开文件 → 渲染 EmptyPlaceholder 空状态占位组件
 */
class MainContent extends React.Component<MainContentProps> {
  render() {
    const { isFileOpened } = this.props;

    return (
      <div className={styles.mainContent}>{isFileOpened ? <TabsBar /> : <EmptyPlaceholder />}</div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  isFileOpened: selectIsFileOpened(state),
});

export default connect(mapStateToProps)(MainContent);
