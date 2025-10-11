import React, { useState } from 'react'
import './SemiCircleFloatCategory.less'
import {
  FaHeart,
  FaCalendar,
  FaImages,
  FaBook,
  FaList,
  FaSearch,
  FaPlus,
  FaRegHeart,
  FaHome,
  FaUser,
  FaEllipsisH,
  FaComment,
  FaClock,
  FaCheck,
  FaCog,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * 半圆悬浮分类组件（左侧中间位置）
 * @param {Array} categoryList - 分类数据，格式：[{id: string, name: string}]
 */
const SemiCircleFloatCategory = ({ categoryList = [], onSearch }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeId, setActiveId] = useState(null)

  // 切换展开/收起
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // 分类点击
  const handleCategoryClick = (id) => {
    setActiveId(id)
    setIsExpanded(!isExpanded)
    // 可添加分类点击后的回调逻辑（如筛选数据）
    onSearch(id)
  }

  const toClassifysPage = () => {
    navigate('/classifys')
  }

  return (
    <div className="semi-circle-container">
      {/* 分类列表（展开时显示） */}
      {isExpanded && (
        <div className="category-panel">
          <ul className="category-list">
            {categoryList.length === 0 ? (
              <li className="empty-tip">暂无分类</li>
            ) : (
              categoryList.map((item) => (
                <li
                  key={item.id}
                  className={`category-item ${
                    activeId === item.id ? 'active' : ''
                  }`}
                  onClick={() => handleCategoryClick(item.id)}
                >
                  {item.name}
                </li>
              ))
            )}
            <li className='category-button' onClick={toClassifysPage}>分类管理 <FaCog /></li>
          </ul>
        </div>
      )}

      {/* 半圆按钮（核心交互元素） */}
      <button
        className={`semi-circle-btn ${isExpanded ? 'expanded' : ''}`}
        onClick={toggleExpand}
        aria-label={isExpanded ? '收起分类' : '展开分类'}
      >
        <span className="arrow-icon" />
      </button>
    </div>
  )
}

export default SemiCircleFloatCategory
