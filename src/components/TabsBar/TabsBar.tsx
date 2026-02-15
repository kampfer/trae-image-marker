import { CloseOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React from 'react';

import styles from './TabsBar.module.css';

interface TabsBarProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
}

class TabsBar extends React.Component<TabsBarProps, Record<string, never>> {
  private tabItems = [
    {
      key: 'tab1',
      label: '图像1.jpg',
    },
    {
      key: 'tab2',
      label: '图像2.png',
    },
    {
      key: 'tab3',
      label: '图像3.jpg',
    },
  ];

  private handleTabEdit = (targetKey: string | React.MouseEvent, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      this.props.onTabClose(targetKey);
    }
  };

  render() {
    return (
      <div className={styles.tabsBar}>
        <Tabs
          type="editable-card"
          activeKey={this.props.activeTab}
          items={this.tabItems}
          onChange={this.props.onTabChange}
          onEdit={this.handleTabEdit}
          hideAdd
          className={styles.tabsContainer}
        />
      </div>
    );
  }
}

export default TabsBar;
