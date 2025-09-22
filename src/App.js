import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MemoriesPage from './pages/MemoriesPage';
import MemoriesDetail from './pages/MemoriesDetail';
import ImportantDatesPage from './pages/ImportantDatesPage';
import AlbumPage from './pages/AlbumPage';
import WishesPage from './pages/WishesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import './App.css';

// Layout 组件
function Layout ({ children }) {
  const location = useLocation();

  // 需要显示Header和BottomNavigation的页面
  const showLayout = !['/login'].includes(location.pathname);

  return (
    <div className="App">
      {showLayout && <Header />}
      <main className={showLayout ? '' : 'fullscreen-main'}>
        {children}
      </main>
      {showLayout && <BottomNavigation />}
    </div>
  );
}

// App 组件
function App () {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/memories/:id" element={<MemoriesDetail />} />
          <Route path="/dates" element={<ImportantDatesPage />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/wishes" element={<WishesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/set" element={<SettingsPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;