import React, { useState, useEffect } from 'react';
import './ThemePage.less';
import TopNavBar from '@/components/TopNavBar';
import { loveThemes } from './data'
import { getStoredTheme, saveTheme } from '@/utils/theme'

// 应用主题到全局样式
const applyThemeToDocument = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary--color', theme.secondary);
  root.style.setProperty('--accent-color', theme.accent);
};

const LoveThemeSelector = ({ onThemeChange }) => {
  // 从本地存储初始化主题
  const [activeTheme, setActiveTheme] = useState(getStoredTheme());
  const [hoveredTheme, setHoveredTheme] = useState(null);

  // 初始化时应用主题
  useEffect(() => {
    const initialTheme = loveThemes.find(t => t.id === activeTheme);
    applyThemeToDocument(initialTheme);
    onThemeChange?.(initialTheme);
  }, []);

  // 主题切换时处理
  useEffect(() => {
    const theme = loveThemes.find(t => t.id === activeTheme);
    if (theme) {
      saveTheme(activeTheme);
      applyThemeToDocument(theme);
      onThemeChange?.(theme);
    }
  }, [activeTheme, onThemeChange]);

  // 监听全局主题变更（用于跨组件同步）
  useEffect(() => {
    const handleThemeChange = (e) => {
      setActiveTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // 生成主题渐变背景
  const getThemeGradient = (theme) =>
    `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`;

  return (
    <div className="love-theme-container">
      <div className='love-theme-header'>
        <TopNavBar title={'主题设置'} />
      </div>
      <div className="love-theme-content">
        <div className="theme-header">
          <h2>换种方式，记录我们的故事</h2>
          <p className="subtitle">每个主题都藏着一段回忆的颜色</p>
        </div>

        <div className="themes-gallery">
          {loveThemes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-item ${activeTheme === theme.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              onClick={() => setActiveTheme(theme.id)}
              style={{
                borderColor: activeTheme === theme.id ? theme.primary : 'transparent',
                boxShadow: hoveredTheme === theme.id ? `0 10px 30px -5px ${theme.primary}33` : 'none',
              }}
            >
              <div className="theme-preview">
                <img
                  src={theme.preview}
                  alt={theme.name}
                  className="preview-img"
                />
                <div
                  className="preview-overlay"
                  style={{ background: getThemeGradient(theme) }}
                />
              </div>

              <div className="theme-info">
                <h3 className="theme-name">{theme.name}</h3>
                <p className="theme-desc">{theme.desc}</p>

                {activeTheme === theme.id && (
                  <div
                    className="selected-indicator"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoveThemeSelector;