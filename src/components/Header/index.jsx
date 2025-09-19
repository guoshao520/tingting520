import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  FaCheck
} from 'react-icons/fa';

function Header () {
  const navigate = useNavigate()
  const [searchVisible, setSearchVisible] = useState(false);
  const location = useLocation();

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/': return '甜蜜时光';
      case '/memories': return '我们的回忆';
      case '/dates': return '重要日子';
      case '/album': return '我们的相册';
      case '/wishes': return '心愿清单';
      case '/profile': return '个人中心';
      default: return '甜蜜时光';
    }
  };

  const toSettingsPage = () => {
    navigate('/set')
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{getHeaderTitle()}</h1>
        <div className="header-actions">
          {searchVisible ? (
            <div className="search-bar">
              <input type="text" placeholder="搜索..." />
              <button onClick={() => setSearchVisible(false)}>取消</button>
            </div>
          ) : (
            <>
              <button className="icon-btn" onClick={() => setSearchVisible(true)}>
                <FaSearch />
              </button>
              <button className="icon-btn" onClick={() => toSettingsPage()}>
                <FaEllipsisH />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;