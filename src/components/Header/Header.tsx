import { Dropdown, Layout } from 'antd';
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
      type: 'divider',
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

  private editMenuItems = [
    {
      key: 'undo',
      label: '撤销',
    },
    {
      key: 'redo',
      label: '重做',
    },
    {
      type: 'divider',
    },
    {
      key: 'select-all',
      label: '全选',
    },
    {
      key: 'clear-all',
      label: '清除所有标注',
    },
    {
      key: 'delete-selected',
      label: '删除选中标注',
    },
  ];

  private annotationMenuItems = [
    {
      key: 'horizontal-line',
      label: '水平线段',
    },
    {
      key: 'vertical-line',
      label: '垂直线段',
    },
    {
      key: 'normal-protractor',
      label: '普通量角器',
    },
    {
      key: 'horizontal-protractor',
      label: '水平量角器',
    },
    {
      key: 'vertical-protractor',
      label: '垂直量角器',
    },
  ];

  private viewMenuItems = [
    {
      key: 'zoom-in',
      label: '放大',
    },
    {
      key: 'zoom-out',
      label: '缩小',
    },
    {
      key: 'fit-window',
      label: '适应窗口',
    },
    {
      key: 'actual-size',
      label: '实际大小',
    },
  ];

  private handleMenuClick = (menuType: string, info: any) => {
    console.log(`点击了${menuType}菜单: ${info.key}`);
  };

  render() {
    return (
      <LayoutHeader className={styles.appHeader}>
        <Dropdown
          menu={{
            items: this.fileMenuItems,
            onClick: (info) => this.handleMenuClick('文件', info),
          }}
          placement="bottomLeft"
        >
          <div className={styles.menuItem}>文件</div>
        </Dropdown>
        <Dropdown
          menu={{
            items: this.editMenuItems,
            onClick: (info) => this.handleMenuClick('编辑', info),
          }}
          placement="bottomLeft"
        >
          <div className={styles.menuItem}>编辑</div>
        </Dropdown>
        <Dropdown
          menu={{
            items: this.annotationMenuItems,
            onClick: (info) => this.handleMenuClick('标注', info),
          }}
          placement="bottomLeft"
        >
          <div className={styles.menuItem}>标注</div>
        </Dropdown>
        <Dropdown
          menu={{
            items: this.viewMenuItems,
            onClick: (info) => this.handleMenuClick('视图', info),
          }}
          placement="bottomLeft"
        >
          <div className={styles.menuItem}>视图</div>
        </Dropdown>
      </LayoutHeader>
    );
  }
}

export default Header;
