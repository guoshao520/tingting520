import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
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
} from 'react-icons/fa'
import DateCard from '@/components/DateCard'
import MemoryCard from '@/components/MemoryCard'
import { importantDates, memories } from '@/data'
import { calculateDaysFromNow } from '@/utils'
import proImage from '@/assets/images/first/Image_53712341142431.jpg'

function HomePage() {
  const navigate = useNavigate()
  const count = calculateDaysFromNow('2024-06-30')

  function toMemories() {
    navigate(`/memories`)
  }

  function toAlbum() {
    navigate(`/album`)
  }

  function wishList() {
    alert('暂未开发')
  }

  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`)
  }

  return (
    <div className="page">
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>早上好，亲爱的！</h2>
          <p>今天是我们在一起的第 {count} 天</p>
        </div>
        <div className="avatar">
          <img src={proImage} alt="用户头像" />
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

      {/* 最近回忆 */}
      <div className="section">
        <div className="section-header">
          <h3>最近回忆</h3>
          <Link to="/memories" className="view-all">
            查看全部
          </Link>
        </div>
        <div className="memories-scroll">
          {memories.map((memory) => (
            <div onClick={() => handleMemoryClick(memory.id)}>
              <MemoryCard key={memory.id} memory={memory} />
            </div>
          ))}
        </div>
      </div>

      {/* 重要日子 */}
      <div className="section">
        <div className="section-header">
          <h3>重要日子</h3>
          <Link to="/dates" className="view-all">
            管理
          </Link>
        </div>
        <div className="dates-grid">
          {importantDates.map((date) => (
            <DateCard key={date.id} date={date} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
