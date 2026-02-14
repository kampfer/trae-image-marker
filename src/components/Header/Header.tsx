import { Layout, Menu } from 'antd';
import React from 'react';

import styles from './Header.module.css';

const { Header: LayoutHeader } = Layout;

interface HeaderProps {
  activeTab: string;
  onTabChange: (key: string) => void;
}

class Header extends React.Component<HeaderProps, Record<string, never>> {
  private menuItems = [
    {
      key: '1',
      label: '项目1',
    },
    {
      key: '2',
      label: '项目2',
    },
    {
      key: '3',
      label: '项目3',
    },
  ];

  private handleMenuSelect = (info: any) => {
    this.props.onTabChange(info.key);
  };

  render() {
    return (
      <LayoutHeader className={styles.appHeader}>
        <Menu
          mode="horizontal"
          selectedKeys={[this.props.activeTab]}
          items={this.menuItems}
          onSelect={this.handleMenuSelect}
          className={styles.menuContainer}
        />
      </LayoutHeader>
    );
  }
}

export default Header;
