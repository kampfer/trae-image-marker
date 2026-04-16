import { Layout } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';

import styles from './App.module.css';
import MenuBar from './components/MenuBar';
import StatusBar from './components/StatusBar';
import TabsBar from './components/TabsBar';
import store from './store';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Layout className={styles.appLayout}>
        <Header className={styles.appHeader}>
          <MenuBar />
        </Header>
        <Content>
          <TabsBar />
        </Content>
        <Footer className={styles.appFooter}>
          <StatusBar />
        </Footer>
      </Layout>
    </Provider>
  );
};

export default App;
