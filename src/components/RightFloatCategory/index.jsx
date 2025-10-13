import React, { useState, useEffect } from 'react';
import './RightFloatCategory.less'; // 引入样式文件

/**
 * 右侧悬浮窗组件（分类展示 + 管理按钮）
 * @param {Object} props - 组件参数
 * @param {Array} props.categoryList - 分类数据列表，格式：[{id: number, name: string, count?: number}]
 * @param {Function} props.onManageClick - 管理按钮点击回调函数
 * @param {string} [props.title="照片分类"] - 悬浮窗标题
 * @param {boolean} [props.visible=true] - 是否显示悬浮窗
 */
const RightFloatCategory = ({
  categoryList = [],
  onManageClick,
  title = "照片分类",
  visible = true
}) => {
  // 状态：当前选中的分类ID
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  // 状态：是否处于移动端（控制悬浮窗展开/收起）
  const [isMobile, setIsMobile] = useState(false);
  // 状态：移动端悬浮窗展开状态
  const [isExpanded, setIsExpanded] = useState(false);

  // 监听窗口尺寸，判断是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px 以下视为移动端
    };
    // 初始化判断
    checkMobile();
    // 监听窗口 resize 事件
    window.addEventListener('resize', checkMobile);
    // 清除监听
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 分类项点击事件
  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    // 可扩展：触发分类筛选回调（如需外部响应分类切换，可增加 props.onCategoryChange）
    // props.onCategoryChange?.(categoryId);
  };

  // 移动端展开/收起按钮点击事件
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 若不显示悬浮窗，直接返回空
  if (!visible) return null;

  return (
    <div className={`right-float-container ${isMobile ? 'mobile' : ''} ${!isExpanded && isMobile ? 'collapsed' : ''}`}>
      {/* 1. 头部（标题 + 移动端展开/收起按钮） */}
      <div className="float-header">
        <h3 className="float-title">{title}</h3>
        {isMobile && (
          <button 
            className="toggle-btn" 
            onClick={toggleExpand}
            aria-label={isExpanded ? "收起分类" : "展开分类"}
          >
            {isExpanded ? "∧" : "∨"}
          </button>
        )}
      </div>

      {/* 2. 分类列表区域 */}
      <div className="category-list">
        {/* 无分类时显示提示 */}
        {categoryList.length === 0 ? (
          <div className="empty-tip">暂无分类数据</div>
        ) : (
          categoryList.map((category) => (
            <div
              key={category.id}
              className={`category-item ${activeCategoryId === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="category-name">{category.name}</span>
              {/* 分类下照片数量（可选，有数据则显示） */}
              {category.count !== undefined && category.count >= 0 && (
                <span className="photo-count">({category.count})</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* 3. 底部管理按钮 */}
      <div className="float-footer">
        <button
          className="manage-btn"
          onClick={onManageClick}
          disabled={!onManageClick} // 无回调时禁用按钮
        >
          分类管理
        </button>
      </div>
    </div>
  );
};

// 导出默认组件
export default RightFloatCategory;