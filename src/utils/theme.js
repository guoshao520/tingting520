import { loveThemes } from '@/pages/ThemePage/data'
// 主题存储键名
const THEME_STORAGE_KEY = 'love_theme';

// 获取本地存储的主题
export const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : "sunset-date";
  } catch (error) {
    console.error('获取获取主题失败:', error);
    return "sunset-date";
  }
};

// 保存主题到本地存储
export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    // 触发全局主题变更事件（供其他组件监听）
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
  } catch (error) {
    console.error('保存主题失败:', error);
  }
};

// 初始化主题（应用到全局样式）
export const initTheme = () => {
  const activeTheme = getStoredTheme();
  const theme = loveThemes.find(t => t.id === activeTheme);
  applyThemeToDocument(theme);
  return theme;
};

// 应用主题到文档根元素
export const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--accent-color', theme.accent);
};