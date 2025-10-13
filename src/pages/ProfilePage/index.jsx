import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaCheck,
  FaCog,
  FaGamepad
} from 'react-icons/fa';
import ImagePreview from '@/components/ImagePreview';
import { calculateDaysFromNow } from '@/utils';
import memory from '@/api/memory';
import importantDate from '@/api/importantDate';
import wish from '@/api/wish';
import { getLoginInfo } from '@/utils/storage';

function ProfilePage() {
  const navigate = useNavigate();
  const count = calculateDaysFromNow('2024-06-30');
  const [memories, setMemories] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [wishs, setWishs] = useState([]);
  const [info, setInfo] = useState({});
  const imgList = [
    window._config.DOMAIN_URL + 'photos/Image_53712341142431-1759308638455.jpg',
  ];

  function goToCoupleGames() {
    navigate('/couple-games/home');
  }

  function wishList() {
    navigate('/wish-list');
  }

  function setCenter() {
    navigate('/set');
  }

  const loginInfo = getLoginInfo()
  const couple_id = loginInfo?.couple?.id

  async function getMemoriesList() {
    const { data } = await memory.list({ couple_id });
    setMemories(data?.rows || []);
  }

  async function getImportantDatesList() {
    const { data } = await importantDate.list({ couple_id });
    setImportantDates(data || []);
  }

  async function getWishList() {
    const { data } = await wish.list({ couple_id, is_completed: true });
    setWishs(data?.rows || []);
  }

  useEffect(() => {
    const loginInfo = getLoginInfo();
    setInfo(loginInfo);
    getMemoriesList();
    getImportantDatesList();
    getWishList();
  }, []);

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          {info?.user?.avatar && (
            <ImagePreview image={info?.user?.avatar || ''} />
          )}
        </div>
        <div className="profile-info">
          <h2>{info?.user?.nickname || '-'}</h2>
          <p>{info?.user?.sex === 1 ? '男' : '女'}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{memories.length || 0}</span>
          <span className="stat-label">回忆</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{importantDates.length || 0}</span>
          <span className="stat-label">重要日子</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{wishs.length || 0}</span>
          <span className="stat-label">心愿完成</span>
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-item" onClick={goToCoupleGames}>
          <div
            className="menu-icon"
            style={{ background: 'rgba(72, 187, 120, 0.1)' }}
          >
            <FaGamepad style={{ color: '#48BB78' }} />
          </div>
          <span>情侣小游戏</span>
        </div>
        
        <div className="menu-item" onClick={wishList}>
          <div
            className="menu-icon"
            style={{ background: 'rgba(255, 165, 0, 0.1)' }}
          >
            <FaList style={{ color: '#FFA500' }} />
          </div>
          <span>心愿清单</span>
        </div>
        <div className="menu-item" onClick={setCenter}>
          <div
            className="menu-icon"
            style={{ background: 'rgba(255, 165, 0, 0.1)' }}
          >
            <FaCog style={{ color: '#FFA500' }} />
          </div>
          <span>设置中心</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;