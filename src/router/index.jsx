import { createRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
// 主界面
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import MemoriesPage from '@/pages/MemoriesPage';
import MemoriesDetail from '@/pages/MemoriesDetail';
import ImportantDatesPage from '@/pages/ImportantDatesPage';
import AlbumPage from '@/pages/AlbumPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import UploadPage from '@/pages/UploadPage';
import MemoryForm from '@/pages/MemoryForm';
import DateForm from '@/pages/DateForm';
import WishListPage from '@/pages/WishListPage';
import WishForm from '@/pages/WishForm';
import SetSafetyIssuePage from '@/pages/SetSafetyIssuePage';
import RetrievePasswordPage from '@/pages/RetrievePasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import ThemePage from '@/pages/ThemePage';
import ClassifysPage from '@/pages/ClassifysPage';
import ClassifyForm from '@/pages/ClassifyForm';
import ProfileForm from '@/pages/ProfileForm';
// 情侣小游戏
import CoupleHomePage from '@/couple-games/HomePage';
import PuzzleTogetherPage from '@/couple-games/PuzzleTogetherPage';
import CoupleDicePage from '@/couple-games/CoupleDicePage';
import PuzzleTogetherSuperPage from '@/couple-games/PuzzleTogetherSuperPage';
import CoupleDiceSuperPage from '@/couple-games/CoupleDiceSuperPage';
import BottomNavigation from '@/components/BottomNavigation';

// 1. 全局导航ref（供外部调用）
export const navigateRef = createRef();

// 2. 全局跳转函数（非组件文件可导入使用）
export const navigate = (...args) => {
  if (navigateRef.current) {
    navigateRef.current(...args);
  }
};

// 3. 路由配置数组
export const routeConfig = [
  // 主界面
  { path: "/login", element: <LoginPage />, showLayout: false },
  { path: "/", element: <HomePage />, showLayout: true },
  { path: "/memories", element: <MemoriesPage />, showLayout: true },
  { path: "/memories/:id", element: <MemoriesDetail />, showLayout: true },
  { path: "/dates", element: <ImportantDatesPage />, showLayout: true },
  { path: "/album", element: <AlbumPage />, showLayout: true },
  { path: "/profile", element: <ProfilePage />, showLayout: true },
  { path: "/profile-form", element: <ProfileForm />, showLayout: true },
  { path: "/set", element: <SettingsPage />, showLayout: true },
  { path: "/upload", element: <UploadPage />, showLayout: true },
  { path: "/memory-form", element: <MemoryForm />, showLayout: true },
  { path: "/date-form", element: <DateForm />, showLayout: true },
  { path: "/wish-list", element: <WishListPage />, showLayout: true },
  { path: "/wish-form", element: <WishForm />, showLayout: true },
  { path: "/set-safety-issue", element: <SetSafetyIssuePage />, showLayout: true },
  { path: "/retrieve-password", element: <RetrievePasswordPage />, showLayout: true },
  { path: "/update-password", element: <UpdatePasswordPage />, showLayout: true },
  { path: "/theme", element: <ThemePage />, showLayout: true },
  { path: "/classifys", element: <ClassifysPage />, showLayout: true },
  { path: "/classify-form", element: <ClassifyForm />, showLayout: true },
  // 情侣小游戏
  { path: "/couple-games/home", element: <CoupleHomePage />, showLayout: true },
  { path: "/couple-games/puzzle-together", element: <PuzzleTogetherPage />, showLayout: true },
  { path: "/couple-games/couple-dice", element: <CoupleDicePage />, showLayout: true },
  { path: "/couple-games/puzzle-together-super", element: <PuzzleTogetherSuperPage />, showLayout: true },
  { path: "/couple-games/couple-dice-super", element: <CoupleDiceSuperPage />, showLayout: true },
];

// 4. 布局组件（包含滚动处理）
const Layout = () => {
  const location = useLocation();
  
  // 查找当前路由配置
  const currentRoute = routeConfig.find(route => 
    location.pathname.startsWith(route.path.replace(':id', ''))
  );
  const showLayout = currentRoute?.showLayout !== false;

  // 路由变化时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // 处理局部滚动容器（如有）
    document.querySelectorAll('.scroll-container').forEach(container => {
      container.scrollTop = 0;
    });
  }, [location.pathname]);

  return (
    <div className="App min-h-screen flex flex-col">
      <main className={`flex-1 ${showLayout ? '' : 'fullscreen-main'}`} 
        style={{ marginBottom: showLayout ? '2rem' : 0 }}
      >
        <Routes>
          {routeConfig.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
      {showLayout && <BottomNavigation />}
    </div>
  );
};

// 5. 路由包装器（绑定navigate ref）
const RouterWrapper = () => {
  const navigate = useNavigate();
  navigateRef.current = navigate;
  return <Layout />;
};

// 6. 导出路由根组件
export const AppRouter = () => (
  <Router>
    <RouterWrapper />
  </Router>
);