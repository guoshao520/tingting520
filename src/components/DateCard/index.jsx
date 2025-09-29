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
import { calculateDaysUntilBirthday } from '@/utils'

function DateCard ({ date }) {
  return (
    <div className="date-card" style={{ borderLeftColor: date.color }}>
      <h4>{date.title}</h4>
      <p className="date">{date.day_date}</p>
      <div className="countdown">
        <FaClock />
        <span>还有 {calculateDaysUntilBirthday(date.day_date)} 天</span>
      </div>
    </div>
  );
}

export default DateCard;