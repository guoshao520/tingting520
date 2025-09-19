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
import { importantDates } from '@/data'
import { calculateDaysUntilBirthday } from '@/utils'

function ImportantDatesPage() {
  function addDates() {
    alert('暂未开发')
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>重要日子</h3>
          <button className="primary-btn" onClick={addDates}>
            <FaPlus /> 添加日子
          </button>
        </div>
        <div className="dates-list">
          {importantDates.map((date) => (
            <div
              key={date.id}
              className="date-list-item"
              style={{ borderLeftColor: date.color }}
            >
              <div className="date-info">
                <h4>{date.title}</h4>
                <p>{date.date}</p>
              </div>
              <div className="days-left">
                <span>{calculateDaysUntilBirthday(date.date)}</span>
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
