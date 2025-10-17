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
import userApi from '@/api/user'; // 引入用户接口
import { getLoginInfo } from '@/utils/storage';

function ProfilePage() {
  const navigate = useNavigate();
  const count = calculateDaysFromNow('2024-06-30');
  const [memories, setMemories] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [wishs, setWishs] = useState([]);
  const [userInfo, setUserInfo] = useState({}); // 存储接口获取的用户信息
  const [loading, setLoading] = useState(true); // 加载状态

  function toProfileForm() {
    navigate('/profile-form');
  }

  function toCoupleGames() {
    navigate('/couple-games/home');
  }

  function wishList() {
    navigate('/wish-list');
  }

  function setCenter() {
    navigate('/set');
  }

  const loginInfo = getLoginInfo();
  const couple_id = loginInfo?.couple?.id;

  // 获取用户详情（从接口）
  async function getUserDetail() {
    try {
      const res = await userApi.detail();
      if (res?.code === 200 && res.data) {
        setUserInfo(res.data); // 从接口更新用户信息
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
    }
  }

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
    async function initData() {
      setLoading(true);
      // 先获取用户详情（接口）
      await getUserDetail();
      // 再获取其他数据
      await Promise.all([
        getMemoriesList(),
        getImportantDatesList(),
        getWishList()
      ]);
      setLoading(false);
    }

    initData();
  }, []);

  return (
    <div className="page">
      <div className="profile-header" onClick={toProfileForm}>
        <div className="profile-avatar">
          {userInfo?.avatar && (
            <ImagePreview image={userInfo.avatar || ''} />
          )}
        </div>
        <div className="profile-info">
          <h2>{userInfo?.nickname || '-'}</h2>
          <p>{userInfo?.sex === 1 ? '男' : '女'}</p>
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
        <div className="menu-item" onClick={toCoupleGames}>
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
