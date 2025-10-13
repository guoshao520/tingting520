import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishListPage.less';
import { FaArrowLeft, FaTrashAlt, FaEdit, FaTimes } from 'react-icons/fa';
import wish from '@/api/wish';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';
import EmptyState from '@/components/EmptyState';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishes, setWishes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const loginInfo = getLoginInfo();
  const couple_id = loginInfo?.couple?.id;

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const data = await wish.list({ couple_id });
      const validWishes = Array.isArray(data.data?.rows) ? data.data?.rows : [];
      setWishes(validWishes);
    } catch (err) {
      console.error('获取愿望列表错误:', err);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const toggleComplete = async (id, currentStatus) => {
    try {
      setWishes(prevWishes =>
        prevWishes.map(wish =>
          wish.id === id ? { ...wish, is_completed: !currentStatus } : wish
        )
      );
      const data = await wish.complete(id, { completed: !currentStatus });
      if (data.code !== 200) {
        setWishes(prevWishes =>
          prevWishes.map(wish =>
            wish.id === id ? { ...wish, is_completed: currentStatus } : wish
          )
        );
        toastFail(data.message);
      } else {
        toastSuccess(data.message);
      }
    } catch (error) {
      console.error('更新状态错误:', error);
      setWishes(prevWishes =>
        prevWishes.map(wish =>
          wish.id === id ? { ...wish, is_completed: currentStatus } : wish
        )
      );
      toastFail(error.message || '网络错误，更新失败');
    }
  };

  const handleLongPress = (e, wishId) => {
    e.preventDefault();
    setCurrentDeleteId(wishId);
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`
    });
    setDeleteModalVisible(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setCurrentDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!currentDeleteId) return;
    try {
      await wish.delete(currentDeleteId, { couple_id });
      setWishes(prev => prev.filter(wish => wish.id !== currentDeleteId));
      setDeleteModalVisible(false);
      setCurrentDeleteId(null);
    } catch (error) {
      console.error('删除愿望错误:', error);
      toastFail(error.message || '网络错误，删除失败');
      setDeleteModalVisible(false);
    }
  };

  const editWish = (id) => {
    navigate(`/wish-form?id=${id}`);
  };

  const filteredWishes = Array.isArray(wishes)
    ? wishes.filter(wish => {
        if (filter === 'all') return true;
        if (filter === 'active') return !wish.is_completed;
        if (filter === 'completed') return wish.is_completed;
        return true;
      })
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityText = (level) => {
    const map = { 1: '低', 2: '中', 3: '高' };
    return map[level] || '中';
  };

  const handleBack = () => {
    window.history.back();
  };

  const addWish = () => {
    navigate('/wish-form');
  };

  return (
    <div>
      <div className="wishlist-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h3>我们的愿望清单</h3>
        <button className="add-btn" onClick={addWish}>
          + 新增心愿
        </button>
      </div>
      <div className="wishlist-container">
        <div className="filter-bar">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            未完成
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>

        <div className="wish-list">
          {filteredWishes.length === 0 ? (
            <EmptyState marginTop={0} />
          ) : (
            filteredWishes.map((wishItem) => (
              <div
                key={wishItem.id}
                className={`wish-item ${wishItem.is_completed ? 'completed' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
                onContextMenu={(e) => handleLongPress(e, wishItem.id)}
                onTouchStart={(e) => {
                  wishItem.touchStartTime = Date.now();
                }}
                onTouchEnd={(e) => {
                  const touchDuration = Date.now() - wishItem.touchStartTime;
                  if (touchDuration >= 300) {
                    const touch = e.changedTouches[0];
                    handleLongPress({
                      preventDefault: () => {},
                      clientY: touch.clientY,
                      clientX: touch.clientX
                    }, wishItem.id);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={wishItem.is_completed}
                  onChange={() => toggleComplete(wishItem.id, wishItem.is_completed)}
                  className="complete-checkbox"
                />

                <div className="wish-content" style={{ flex: 1 }}>
                  <h3 className="wish-title">{wishItem.title}</h3>
                  {wishItem.description && (
                    <p className="wish-desc">{wishItem.description}</p>
                  )}
                  <div className="wish-meta">
                    {wishItem.target_date && (
                      <span className="target-date">
                        目标：{formatDate(wishItem.target_date)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    editWish(wishItem.id);
                  }}
                  aria-label="编辑"
                >
                  <FaEdit />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteModalVisible && (
        <div
          className="long-press-modal"
          style={{
            position: 'fixed',
            top: modalPosition.top,
            left: modalPosition.left,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            padding: '12px 16px',
            zIndex: 9999,
            minWidth: '160px'
          }}
        >
          <div
            className="delete-option"
            onClick={handleConfirmDelete}
            style={{
              color: '#ff4d4f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <FaTrashAlt size={16} />
            <span>删除该愿望</span>
          </div>
          <div
            className="cancel-option"
            onClick={handleCancelDelete}
            style={{
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <FaTimes size={16} />
            <span>取消</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;