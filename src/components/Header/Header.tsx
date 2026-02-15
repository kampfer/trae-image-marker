import { Dropdown, Layout, Menu } from 'antd';
import React from 'react';

import styles from './Header.module.css';

const { Header: LayoutHeader } = Layout;

class Header extends React.Component<Record<string, never>, Record<string, never>> {
  private fileMenuItems = [
    {
      key: 'new-annotation',
      label: '新建标注文件',
    },
    {
      key: 'open-annotation',
      label: '打开标注文件',
    },
    {
      key: 'open-image',
      label: '打开图片',
    },
    {
      key: 'save-annotation',
      label: '保存标注文件',
    },
    {
      key: 'export-annotation',
      label: '导出标注文件',
    },
  ];

  private handleFileMenuClick = (info: any) => {
    console.log(`点击了文件菜单: ${info.key}`);
  };

  render() {
    return (
      <LayoutHeader className={styles.appHeader}>
        <Dropdown
          menu={{ items: this.fileMenuItems, onClick: this.handleFileMenuClick }}
          placement="bottomLeft"
        >
          <div className={styles.menuItem}>文件</div>
        </Dropdown>
      </LayoutHeader>
    );
  }
}

export default Header;
