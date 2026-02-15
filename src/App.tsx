import { ConfigProvider, Layout, theme } from 'antd';
import React from 'react';

import styles from './App.module.css';
import { Header, TabsBar, Canvas, Footer } from './components';

const { Content } = Layout;

interface AppState {
  activeTab: string;
  status: string;
  zoom: string;
  canvasSize: string;
}

class App extends React.Component<Record<string, never>, AppState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      activeTab: 'tab1',
      status: '就绪',
      zoom: '100%',
      canvasSize: '1920 x 1080',
    };
  }

  private handleTabChange = (key: string) => {
    this.setState({ activeTab: key });
  };

  private handleTabClose = (key: string) => {
    console.log(`关闭标签页: ${key}`);
  };

  render() {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#007acc',
            colorBgContainer: '#1e1e1e',
            colorBgElevated: '#252526',
            colorBgTextHover: '#2a2d2e',
            colorBorder: '#454545',
            colorText: '#cccccc',
            colorTextSecondary: '#969696',
            colorTextTertiary: '#ffffff',
            colorWarning: '#cca700',
            colorError: '#f14c4c',
            colorSuccess: '#4ec9b0',
          },
        }}
      >
        <Layout className={styles.appLayout}>
          <Header />
          <TabsBar
            activeTab={this.state.activeTab}
            onTabChange={this.handleTabChange}
            onTabClose={this.handleTabClose}
          />
          <Content className={styles.appMiddle}>
            <Canvas />
          </Content>
          <Footer
            status={this.state.status}
            zoom={this.state.zoom}
            canvasSize={this.state.canvasSize}
          />
        </Layout>
      </ConfigProvider>
    );
  }
}

export default App;
