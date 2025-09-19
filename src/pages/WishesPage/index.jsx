import React, { useState, useEffect } from 'react';
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

function WishesPage () {
  const [wishes, setWishes] = useState([
    { id: 1, text: '一起看极光', completed: false },
    { id: 2, text: '学习跳舞', completed: true },
    { id: 3, text: '共同养一只宠物', completed: false },
    { id: 4, text: '一起看日出', completed: false },
    { id: 5, text: '去迪士尼乐园', completed: true },
  ]);

  const toggleWish = (id) => {
    setWishes(wishes.map(wish =>
      wish.id === id ? { ...wish, completed: !wish.completed } : wish
    ));
  };

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>心愿清单</h3>
          <button className="primary-btn">
            <FaPlus /> 添加心愿
          </button>
        </div>
        <div className="wishes-list">
          {wishes.map(wish => (
            <div key={wish.id} className={`wish-item ${wish.completed ? 'completed' : ''}`}>
              <div className="wish-checkbox" onClick={() => toggleWish(wish.id)}>
                {wish.completed && <FaCheck />}
              </div>
              <span className="wish-text">{wish.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WishesPage;