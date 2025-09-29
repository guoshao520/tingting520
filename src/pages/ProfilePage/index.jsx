import { useState, useEffect } from 'react'
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
import { Image, ImageViewer } from 'antd-mobile'
import ImagePreview from '@/components/ImagePreview'
import { importantDates, memories } from '@/data'
import { calculateDaysFromNow } from '@/utils'
import proImage from '@/assets/images/first/Image_53712341142431.jpg'
import memory from '@/api/memory'
import importantDate from '@/api/importantDate'
import wish from '@/api/wish' // 引入心愿相关接口

function ProfilePage() {
  const navigate = useNavigate()
  const count = calculateDaysFromNow('2024-06-30')
  const [memories, setMemories] = useState([])
  const [importantDates, setImportantDates] = useState([])
  const [wishs, setWishs] = useState([])
  const imgList = ['https://picsum.photos/800/600?1']

  function wishList() {
    navigate('/wish-list')
  }

  async function getMemoriesList() {
    const { data } = await memory.list({ couple_id: 1 })
    setMemories(data.rows || [])
  }

  async function getImportantDatesList() {
    const { data } = await importantDate.list({ couple_id: 1 })
    setImportantDates(data || [])
  }

  async function getWishList() {
    const { data } = await wish.list({ couple_id: 1, is_completed: true })
    setWishs(data.rows || [])
  }

  useEffect(() => {
    getMemoriesList()
    getImportantDatesList()
    getWishList()
  }, [])

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          <ImagePreview width={74} height={74} imageList={imgList} />
        </div>
        <div className="profile-info">
          <h2>郭步 & 李婷婷</h2>
          <p>在一起 {count} 天</p>
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
        <div className="menu-item" onClick={wishList}>
          <div
            className="menu-icon"
            style={{ background: 'rgba(255, 165, 0, 0.1)' }}
          >
            <FaList style={{ color: '#FFA500' }} />
          </div>
          <span>心愿清单</span>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
