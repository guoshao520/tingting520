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
  FaAngleRight,
  FaQuestionCircle,
  FaKey
} from 'react-icons/fa'
import './SettingsPage.less'
import TopNavBar from '@/components/TopNavBar'
import { removeLocal } from '@/utils/storage';
import { Dialog } from 'antd-mobile';
import { toastMsg } from '@/utils/toast'

const SettingsPage = ({ onBack, onLogout }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    window.history.back() // 浏览器后退
  }

  const handleLogout = () => {
    Dialog.confirm({
      content: '确定要退出登录吗？',
      onConfirm: async () => {
        removeLocal()
        navigate('/login')
      },
    });
  }

  const toSafetyIssue = () => {
    navigate('/set-safety-issue')
  }

  const toTheme = () => {
    navigate('/theme')
  }

  const toUpdatePassword = () => {
    navigate('/update-password')
  }

  const leftBack = () => {
    navigate('/profile')
  }

  const menuItems = [
    {
      icon: <FaQuestionCircle />,
      label: '安全问题',
      onClick: () => toSafetyIssue(),
    },
    {
      icon: <FaKey />,
      label: '修改密码',
      onClick: () => toUpdatePassword(),
    },
    {
      icon: <FaMoon />,
      label: '主题设置',
      onClick: () => toTheme(),
    }
  ]

  return (
    <div className="settings-container">
      <TopNavBar title={'设置中心'} onBack={leftBack} />

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
