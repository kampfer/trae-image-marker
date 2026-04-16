import React from 'react';

import PixiCanvas from '../PixiCanvas';
import Toolbar from '../Toolbar';

import styles from './WorkSpace.module.css';

interface WorkSpaceProps {
  imageId: string;
}

const WorkSpace: React.FC<WorkSpaceProps> = ({ imageId }) => {
  return (
    <div className={styles.workSpace}>
      <Toolbar imageId={imageId} />
      <PixiCanvas imageId={imageId} />
    </div>
  );
};

export default WorkSpace;