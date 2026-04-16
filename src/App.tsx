import { ConfigProvider, Layout, theme } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';

import styles from './App.module.css';
import Footer from './components/Footer';
import MenuBar from './components/MenuBar';
import TabsBar from './components/TabsBar';
import store from './store';

const { Content } = Layout;

const App: React.FC = () => {
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
      <Provider store={store}>
        <Layout className={styles.appLayout}>
          <MenuBar />
          <TabsBar />
          <Content className={styles.appMiddle} />
          <Footer />
        </Layout>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
