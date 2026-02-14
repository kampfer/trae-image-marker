import { ConfigProvider, Layout, theme } from 'antd';
import React from 'react';

import styles from './App.module.css';
import { Header, Canvas, Footer } from './components';

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
      activeTab: '1',
      status: '就绪',
      zoom: '100%',
      canvasSize: '1920 x 1080',
    };
  }

  private handleTabChange = (key: string) => {
    this.setState({ activeTab: key });
  };

  render() {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Layout className={styles.appLayout}>
          <Header activeTab={this.state.activeTab} onTabChange={this.handleTabChange} />
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
