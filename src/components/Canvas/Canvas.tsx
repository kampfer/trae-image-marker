import {
  HomeOutlined,
  ToolOutlined,
  SettingOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Layout, FloatButton } from 'antd';
import React from 'react';

import styles from './Canvas.module.css';

const { Content } = Layout;

class Canvas extends React.Component<Record<string, never>, Record<string, never>> {
  private toolbarButtons = [
    { icon: <HomeOutlined />, title: '主页' },
    { icon: <ToolOutlined />, title: '工具' },
    { icon: <SettingOutlined />, title: '设置' },
    { icon: <SaveOutlined />, title: '保存' },
    { icon: <UndoOutlined />, title: '撤销' },
    { icon: <RedoOutlined />, title: '重做' },
    { icon: <ZoomInOutlined />, title: '放大' },
    { icon: <ZoomOutOutlined />, title: '缩小' },
  ];

  private handleToolbarClick = (title: string) => {
    console.log(`点击了工具栏按钮: ${title}`);
  };

  render() {
    return (
      <Content className={styles.canvasArea}>
        <FloatButton.Group shape="square" className={styles.floatingToolbar}>
          <FloatButton
            icon={<HomeOutlined />}
            tooltip="主页"
            onClick={() => this.handleToolbarClick('主页')}
          />
          <FloatButton
            icon={<ToolOutlined />}
            tooltip="工具"
            onClick={() => this.handleToolbarClick('工具')}
          />
          <FloatButton
            icon={<SettingOutlined />}
            tooltip="设置"
            onClick={() => this.handleToolbarClick('设置')}
          />
          <FloatButton
            icon={<SaveOutlined />}
            tooltip="保存"
            onClick={() => this.handleToolbarClick('保存')}
          />
          <FloatButton
            icon={<UndoOutlined />}
            tooltip="撤销"
            onClick={() => this.handleToolbarClick('撤销')}
          />
          <FloatButton
            icon={<RedoOutlined />}
            tooltip="重做"
            onClick={() => this.handleToolbarClick('重做')}
          />
          <FloatButton
            icon={<ZoomInOutlined />}
            tooltip="放大"
            onClick={() => this.handleToolbarClick('放大')}
          />
          <FloatButton
            icon={<ZoomOutOutlined />}
            tooltip="缩小"
            onClick={() => this.handleToolbarClick('缩小')}
          />
        </FloatButton.Group>
        <div className={styles.canvasContent}>画布区域</div>
      </Content>
    );
  }
}

export default Canvas;
