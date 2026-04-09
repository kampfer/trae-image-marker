import { Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { RootState, AppDispatch } from '../../store';
import { setActiveImage, removeImage } from '../../store/slices/imageSlice';

import styles from './TabsBar.module.css';

interface TabsBarProps {
  images: Array<{
    id: string;
    name: string;
    path: string;
    width: number;
    height: number;
    createdAt: string;
  }>;
  activeImageId: string | null;
  dispatch: AppDispatch;
}

class TabsBar extends React.Component<TabsBarProps> {
  handleTabChange = (key: string) => {
    this.props.dispatch(setActiveImage(key));
  };

  handleTabClose = (key: string) => {
    this.props.dispatch(removeImage(key));
  };

  render() {
    const { images, activeImageId } = this.props;

    const items = images.map(image => ({
      key: image.id,
      label: image.name,
      closable: true,
    }));

    return (
      <div className={styles.tabsBar}>
        <Tabs
          activeKey={activeImageId || ''}
          items={items}
          onChange={this.handleTabChange}
          onEdit={this.handleTabClose}
          type="editable-card"
          size="small"
          className={styles.tabs}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  images: state.image.images,
  activeImageId: state.image.activeImageId,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(TabsBar);
