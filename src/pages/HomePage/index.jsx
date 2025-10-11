import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
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
} from 'react-icons/fa';
import DateCard from '@/components/DateCard';
import MemoryCard from '@/components/MemoryCard';
import { importantDates } from '@/data';
import { calculateDaysFromNow } from '@/utils';
import proImage from '@/assets/images/first/Image_53712341142431.jpg';
import memory from '@/api/memory';
import importantDate from '@/api/importantDate';
import ImagePreview from '@/components/ImagePreview';
import EmptyState from '@/components/EmptyState';
import { getLoginInfo } from '@/utils/storage'

function HomePage() {
  const navigate = useNavigate();
  const count = calculateDaysFromNow('2024-06-30');
  const [memories, setMemories] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const imgList = [
    'http://guoshao-service.test.upcdn.net/profile/combination_profile.jpg',
  ];

  function toMemories() {
    navigate(`/memories`);
  }

  function toAlbum() {
    navigate(`/album`);
  }

  function wishList() {
    navigate(`/wish-list`);
  }

  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`);
  };

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

  function getTimeOfDay() {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 11) {
      return '早上';
    } else if (currentHour >= 11 && currentHour < 13) {
      return '中午';
    } else if (currentHour >= 13 && currentHour < 18) {
      return '下午';
    } else {
      return '晚上';
    }
  }

  useEffect(() => {
    getMemoriesList();
    getImportantDatesList();
  }, []);

  const customStyle = {
    'margin-top': '0 !important'
  }

  return (
    <div className="page">
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>{getTimeOfDay()}好，亲爱的！</h2>
          <p>今天是我们在一起的第 {count} 天</p>
        </div>
        <div className="avatar">
          <ImagePreview image={imgList[0]} />
        </div>
      </div>

      {/* 快速功能入口 */}
      <div className="quick-actions">
        <div className="action-card" onClick={toMemories}>
          <div
            className="action-icon"
            style={{ background: 'rgba(255, 107, 139, 0.1)' }}
          >
            <FaPlus style={{ color: '#FF6B8B' }} />
          </div>
          <span>记录瞬间</span>
        </div>
        <div className="action-card" onClick={toAlbum}>
          <div
            className="action-icon"
            style={{ background: 'rgba(123, 104, 238, 0.1)' }}
          >
            <FaCalendar style={{ color: '#7B68EE' }} />
          </div>
          <span>添加照片</span>
        </div>
        <div className="action-card" onClick={wishList}>
          <div
            className="action-icon"
            style={{ background: 'rgba(255, 165, 0, 0.1)' }}
          >
            <FaList style={{ color: '#FFA500' }} />
          </div>
          <span>心愿清单</span>
        </div>
      </div>

      {/* 最近回忆 - 修复：给外层div加key */}
      <div className="section">
        <div className="home-section-header">
          <h3>最近回忆</h3>
          <Link to="/memories" className="view-all">
            查看全部
          </Link>
        </div>
        <EmptyState showBox={memories?.length === 0} marginTop={0} />
        <div className="memories-scroll">
          {memories.map((memory) => (
            // 🔴 关键修复：给循环的外层div添加唯一key（用memory.id）
            <div 
              key={memory.id}  // 每个回忆的id唯一，适合做key
              onClick={() => handleMemoryClick(memory.id)}
            >
              <MemoryCard memory={memory} />
            </div>
          ))}
        </div>
      </div>

      {/* 重要日子 - 修复：给外层div加key */}
      <div className="section">
        <div className="home-section-header">
          <h3>重要日子</h3>
          <Link to="/dates" className="view-all">
            管理
          </Link>
        </div>
        <EmptyState showBox={importantDates?.length === 0} marginTop={0} />
        <div className="dates-grid">
          {importantDates.map((date) => (
            // 🔴 关键修复：给循环的外层div添加唯一key（用date.id）
            <div 
              key={date.id}  // 每个日子的id唯一，适合做key
            >
              <DateCard date={date} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;