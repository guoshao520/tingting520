import React from 'react';
import './withPreviewWrap.less'; // 单独的样式文件

/**
 * 高阶组件：为图片预览组件添加全屏遮罩容器和底部关闭按钮
 * @param {Component} WrappedComponent - 被包裹的图片预览组件（如ImageViewer.Multi）
 * @returns 增强后的组件
 */
const withPreviewWrap = (WrappedComponent) => {
  const EnhancedComponent = ({ 
    visible, 
    onClose, 
    ...props 
  }) => {
    if (!visible) return null;

    return (
      // 全屏遮罩容器，点击遮罩触发关闭
      <div className="preview-wrap" onClick={onClose}>
        {/* 预览内容区：阻止事件冒泡，避免点击图片时触发遮罩关闭 */}
        <div className="preview-content" onClick={(e) => e.stopPropagation()}>
          {/* 被包裹的预览组件（如ImageViewer.Multi） */}
          <WrappedComponent 
            visible={visible} 
            onClose={onClose} 
            {...props} 
          />
        </div>
      </div>
    );
  };

  return EnhancedComponent;
};

export default withPreviewWrap;