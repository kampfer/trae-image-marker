import React from 'react';

import styles from './EmptyFilePlaceholder.module.css';

/**
 * 已打开标记文件但尚未添加图片时显示的空状态。
 */
const EmptyFilePlaceholder: React.FC = () => {
  return (
    <div className={styles.emptyFilePlaceholder}>
      <h2 className={styles.title}>标记文件已打开</h2>
      <p className={styles.description}>
        当前文件还没有图片，请通过顶部菜单“文件 &gt; 添加图片”开始标注。
      </p>
    </div>
  );
};

export default EmptyFilePlaceholder;
