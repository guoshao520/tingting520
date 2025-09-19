import { Link, useNavigate } from 'react-router-dom'
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
import { memories } from '@/data'

function MemoriesPage() {
  const navigate = useNavigate()

  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`)
  }

  function addMemories() {
    alert("暂未开发")
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>所有回忆</h3>
          <button className="primary-btn" onClick={addMemories}>
            <FaPlus /> 添加回忆
          </button>
        </div>
        <div className="memories-list">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="memory-list-item"
              onClick={() => handleMemoryClick(memory.id)}
            >
              <img src={memory.image} alt={memory.title} />
              <div className="memory-info">
                <h4>{memory.title}</h4>
                <p>{memory.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MemoriesPage
