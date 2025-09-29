import { useState, useEffect } from 'react'
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
import memory from '@/api/memory'
import EmptyState from '@/components/EmptyState'

function MemoriesPage() {
  const navigate = useNavigate()
  const [memories, setMemories] = useState([])

  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`)
  }

  function addMemories() {
    navigate('/add-memory')
  }

  async function getMemoriesList() {
    const { data } = await memory.list({ couple_id: 1 });
    setMemories(data.rows || []);
  }

  useEffect(() => {
    getMemoriesList();
  }, []);

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>所有回忆</h3>
          <button className="primary-btn" onClick={addMemories}>
            <FaPlus /> 添加回忆
          </button>
        </div>

        <EmptyState showBox={memories?.length === 0} />
        <div className="memories-list">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="memory-list-item"
              onClick={() => handleMemoryClick(memory.id)}
            >
              <img src={window._config.DOMAIN_URL + memory.image} alt={memory.title} />
              <div className="memory-info">
                <h4>{memory.title}</h4>
                <p>{memory.memory_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MemoriesPage
