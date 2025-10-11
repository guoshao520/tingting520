import { useEffect } from 'react'; // 新增导入useEffect
import { AppRouter } from './router';
import './App.less';
import '@/utils/baseUrl';
import { initTheme } from '@/utils/theme'

// 主应用入口
function App() {
  // 🔴 应用初始化时执行initTheme
  useEffect(() => {
    initTheme(); // 调用主题初始化函数
  }, []); // 空依赖项：仅在组件首次挂载（应用启动）时执行一次

  return <AppRouter />;
}

export default App;