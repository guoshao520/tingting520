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
import { importantDates, memories } from '@/data'
import { calculateDaysFromNow } from '@/utils'
import proImage from '@/assets/images/first/Image_53712341142431.jpg'

function ProfilePage () {
  const count = calculateDaysFromNow("2024-06-30")

  function ourStory() {
    alert("暂未开发")
  }

  function wishList() {
    alert("暂未开发")
  }

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={proImage} alt="用户头像" />
        </div>
        <div className="profile-info">
          <h2>郭步 & 李婷婷</h2>
          <p>在一起 {count} 天</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{memories.length}</span>
          <span className="stat-label">回忆</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{importantDates.length}</span>
          <span className="stat-label">重要日子</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">心愿完成</span>
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-item" onClick={wishList}>
          <div className="menu-icon" style={{ background: 'rgba(255, 165, 0, 0.1)' }}>
            <FaList style={{ color: '#FFA500' }} />
          </div>
          <span>心愿清单</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;