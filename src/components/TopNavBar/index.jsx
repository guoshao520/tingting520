import {
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
  FaUser,
  FaBell,
  FaMoon,
  FaAngleRight,
} from 'react-icons/fa';
import './TopNavBar.less'

// 组件定义
const NavBar = ({
  title = '设置中心', // 默认标题
  showBackButton = true, // 是否显示返回按钮
  onBack, // 自定义返回回调
  children, // 右侧自定义内容
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack(); // 使用自定义回调
    } else {
      window.history.back(); // 默认浏览器后退
    }
  };

  return (
    <header className="top-header">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      <h2>{title}</h2>
    </header>
  );
};

export default NavBar;
