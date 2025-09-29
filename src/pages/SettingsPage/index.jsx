import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
  FaUser,
  FaBell,
  FaMoon,
  FaAngleRight
} from 'react-icons/fa'
import './SettingsPage.css'
import TopNavBar from '@/components/TopNavBar'

const SettingsPage = ({ onBack, onLogout }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    window.history.back() // 浏览器后退
  }

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      navigate('/login')
    }
  }

  const menuItems = [
    {
      icon: <FaMoon />,
      label: '主题设置',
      onClick: () => console.log('打开主题设置'),
    },
    {
      icon: <FaCog />,
      label: '通用设置',
      onClick: () => console.log('打开通用设置'),
    },
  ]

  return (
    <div className="settings-container">
      <TopNavBar title={'设置中心'} />

      <div className="settings-content">
        <div className="settings-menu">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-item" onClick={item.onClick}>
              <div className="menu-item-left">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </div>
              <div className="menu-arrow">
                <FaAngleRight />
              </div>
            </div>
          ))}
        </div>

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
