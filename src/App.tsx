import { ConfigProvider, Layout, theme } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';

import styles from './App.module.css';
import MainContent from './components/MainContent';
import MenuBar from './components/MenuBar';
import StatusBar from './components/StatusBar';
import store from './store';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#007acc',
          borderRadius: 4,
        },
      }}
    >
      <Provider store={store}>
        <Layout className={styles.appLayout}>
          <Header className={styles.appHeader}>
            <MenuBar />
          </Header>
          <Content>
            <MainContent />
          </Content>
          <Footer className={styles.appFooter}>
            <StatusBar />
          </Footer>
        </Layout>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
