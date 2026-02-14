import { Layout } from 'antd';
import React from 'react';

import styles from './Footer.module.css';

const { Footer: LayoutFooter } = Layout;

interface FooterProps {
  status: string;
  zoom: string;
  canvasSize: string;
}

class Footer extends React.Component<FooterProps, Record<string, never>> {
  render() {
    return (
      <LayoutFooter className={styles.appFooter}>
        <div className={styles.statusBar}>
          <span className={styles.statusItem}>{this.props.status}</span>
          <span className={styles.statusItem}>{this.props.zoom}</span>
          <span className={styles.statusItem}>{this.props.canvasSize}</span>
        </div>
      </LayoutFooter>
    );
  }
}

export default Footer;
