import { Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { AppDispatch, RootState } from '../../store';
import { selectActiveImageId, selectImages } from '../../store/selectors';
import { addImage, removeImage, setActiveImage } from '../../store/slices/imageSlice';
import type { ImageInfo } from '../../types/fileTypes';
import WorkSpace from '../WorkSpace';

import styles from './TabsBar.module.css';

interface TabsBarProps {
  images: ImageInfo[];
  activeImageId: string | null;
  dispatch: AppDispatch;
}

type TabEditAction = 'add' | 'remove';
type TabEditTarget = string | React.MouseEvent | React.KeyboardEvent;

class TabsBar extends React.Component<TabsBarProps> {
  handleTabChange = (key: string) => {
    this.props.dispatch(setActiveImage(key));
  };

  handleTabEdit = (targetKey: TabEditTarget, action: TabEditAction) => {
    if (action === 'add') {
      this.props.dispatch(addImage());
      return;
    }

    if (typeof targetKey === 'string') {
      this.props.dispatch(removeImage(targetKey));
    }
  };

  render() {
    const { images, activeImageId } = this.props;

    const items = images.map((image) => ({
      key: image.id,
      label: image.name,
      closable: true,
      children: <WorkSpace imageId={image.id} />,
    }));

    return (
      <div className={styles.tabsBar}>
        <Tabs
          activeKey={activeImageId ?? undefined}
          items={items}
          onChange={this.handleTabChange}
          onEdit={this.handleTabEdit}
          type="editable-card"
          size="small"
          className={styles.tabs}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  images: selectImages(state),
  activeImageId: selectActiveImageId(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(TabsBar);
