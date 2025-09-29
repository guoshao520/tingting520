import React from 'react';
import './EmptyState.css';

// 空状态组件
const EmptyState = ({
  type = 'default', // 类型：default, search, network, data 等
  title = '暂无数据', // 主标题
  description, // 描述文字
  image, // 自定义图片
  imageSize = 80, // 图片大小
  showBox = true, // 是否显示缺省图
  showImage = true, // 是否显示图片
  action, // 操作按钮
  className = '', // 自定义类名
  style = {}, // 自定义样式
  children // 自定义内容
}) => {
  // 默认图片配置
  const getDefaultImage = () => {
    const images = {
      default: (
        <svg width={imageSize} height={imageSize} viewBox="0 0 64 64" fill="none">
          <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.045 0 20 8.955 20 20s-8.955 20-20 20S12 43.045 12 32 20.955 12 32 12zm-6 8a6 6 0 100 12 6 6 0 000-12zm35.64 26.52A19.96 19.96 0 0152 32c0-2.86-.63-5.57-1.75-8.02L44 30l-6-8-8 10-6-6-14 18h38.64z" fill="#ccc"/>
        </svg>
      ),
      search: (
        <svg width={imageSize} height={imageSize} viewBox="0 0 64 64" fill="none">
          <path d="M39.5 36h-2.09l-.73-.73A12.93 12.93 0 0040 26.5 13.5 13.5 0 1026.5 40c3.24 0 6.22-1.18 8.52-3.14l.73.73v2.09l10 10 3-3-10-10zm-13 0a9.5 9.5 0 110-19 9.5 9.5 0 010 19z" fill="#ccc"/>
        </svg>
      ),
      network: (
        <svg width={imageSize} height={imageSize} viewBox="0 0 64 64" fill="none">
          <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm2 34h-4v-8h4v8zm0-12h-4v-4h4v4z" fill="#ccc"/>
        </svg>
      ),
      data: (
        <svg width={imageSize} height={imageSize} viewBox="0 0 64 64" fill="none">
          <path d="M48 16H16c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V20c0-2.21-1.79-4-4-4zm0 28H16V20h32v24zM24 24h16v4H24v-4zm0 8h16v4H24v-4zm0 8h10v4H24v-4z" fill="#ccc"/>
        </svg>
      )
    };
    return images[type] || images.default;
  };

  // 默认描述配置
  const getDefaultDescription = () => {
    const descriptions = {
      default: '当前没有数据，请稍后再试',
      search: '没有找到相关结果，尝试更换搜索词',
      network: '网络连接异常，请检查网络设置',
      data: '暂无相关数据'
    };
    return description || descriptions[type] || descriptions.default;
  };

  return (
    <div className={`empty-state ${className}`} style={{
      ...style,
      display: showBox ? 'block' : 'none'
    }}>
      {showImage && (
        <div className="empty-state-image">
          {image || getDefaultImage()}
        </div>
      )}
      
      <div className="empty-state-content">
        <div className="empty-state-title">{title}</div>
        <div className="empty-state-description">
          {getDefaultDescription()}
        </div>
        
        {action && (
          <div className="empty-state-action">
            {action}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default EmptyState;