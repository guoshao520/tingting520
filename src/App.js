import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './pages/HomePage';
import MemoriesPage from './pages/MemoriesPage';
import MemoriesDetail from './pages/MemoriesPage/detail';
import ImportantDatesPage from './pages/ImportantDatesPage';
import AlbumPage from './pages/AlbumPage';
import WishesPage from './pages/WishesPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App () {
  return (
    <Router> {/* 用Router包裹整个应用 */}
      <div className="App">
        <Header />
        <main>
          <Routes> {/* 定义路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/memories/:id" element={<MemoriesDetail />} />
            <Route path="/dates" element={<ImportantDatesPage />} />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/wishes" element={<WishesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;