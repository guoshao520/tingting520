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
import { calculateDaysUntilBirthday } from '@/utils'
import importantDate from '@/api/importantDate'
import EmptyState from '@/components/EmptyState'

function ImportantDatesPage() {
  const navigate = useNavigate()
  const [importantDates, setImportantDates] = useState([])
  
  function addDates() {
    navigate('/add-date')
  }

  async function getImportantDatesList() {
    const { data } = await importantDate.list({ couple_id: 1 });
    setImportantDates(data || []);
  }

  useEffect(() => {
    getImportantDatesList();
  }, []);

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>重要日子</h3>
          <button className="primary-btn" onClick={addDates}>
            <FaPlus /> 添加日子
          </button>
        </div>
        <EmptyState showBox={importantDates?.length === 0} />

        <div className="dates-list">
          {importantDates.map((date) => (
            <div
              key={date.id}
              className="date-list-item"
              style={{ borderLeftColor: date.color }}
            >
              <div className="date-info">
                <h4>{date.title}</h4>
                <p>{date.day_date}</p>
              </div>
              <div className="days-left">
                <span>{calculateDaysUntilBirthday(date.day_date)}</span>
                <span>天</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImportantDatesPage
