import React, { useState } from 'react';
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

function MemoryCard({ memory }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(memory.likes);

  return (
    <div className="memory-card">
      <div className="memory-image">
        <img src={memory.image} alt={memory.title} />
        <div className="memory-date">{memory.date}</div>
      </div>
      <div className="memory-content">
        <h4>{memory.title}</h4>
        <p className="ellipsis-2">{memory.boy_content}</p>
      </div>
    </div>
  );
}

export default MemoryCard