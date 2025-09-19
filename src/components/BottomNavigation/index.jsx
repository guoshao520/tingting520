import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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

function BottomNavigation () {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <FaHome />
        <span>首页</span>
      </Link>
      <Link to="/memories" className={`nav-item ${location.pathname === '/memories' ? 'active' : ''}`}>
        <FaBook />
        <span>回忆</span>
      </Link>
      <Link to="/dates" className={`nav-item ${location.pathname === '/dates' ? 'active' : ''}`}>
        <FaCalendar />
        <span>日子</span>
      </Link>
      <Link to="/album" className={`nav-item ${location.pathname === '/album' ? 'active' : ''}`}>
        <FaImages />
        <span>相册</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <FaUser />
        <span>我的</span>
      </Link>
    </nav>
  );
}

export default BottomNavigation;