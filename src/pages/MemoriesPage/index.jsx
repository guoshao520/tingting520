import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaTrashAlt,
  FaTimes,
  FaEdit // 新增编辑图标
} from 'react-icons/fa';
import memory from '@/api/memory';
import EmptyState from '@/components/EmptyState';
import { getLoginInfo } from '@/utils/storage';
import { getImgUrl } from '@/utils';

function MemoriesPage() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const loginInfo = getLoginInfo();
  const couple_id = loginInfo?.couple?.id;

  // 编辑回忆：跳转到编辑页面（携带回忆ID）
  const editMemory = (memoryId) => {
    navigate(`/memory-form?id=${memoryId}`);
  };

  async function getMemoriesList() {
    try {
      const { data } = await memory.list({ couple_id });
      setMemories(data?.rows || []);
    } catch (error) {
      console.error('获取回忆列表失败:', error);
    }
  }

  const handleLongPress = (e, memoryId) => {
    e.preventDefault();
    setCurrentDeleteId(memoryId);
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
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
      await memory.delete(currentDeleteId);
      setMemories((prev) => prev.filter((item) => item.id !== currentDeleteId));
      setDeleteModalVisible(false);
      setCurrentDeleteId(null);
    } catch (error) {
      console.error('删除回忆失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`);
  };

  const addMemories = () => {
    navigate('/memory-form');
  };

  useEffect(() => {
    getMemoriesList();
  }, []);

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>我的回忆</h3>
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
              onContextMenu={(e) => handleLongPress(e, memory.id)}
              onTouchStart={(e) => {
                memory.touchStartTime = Date.now();
              }}
              onTouchEnd={(e) => {
                const touchDuration = Date.now() - memory.touchStartTime;
                if (touchDuration >= 300) {
                  const touch = e.changedTouches[0];
                  handleLongPress(
                    {
                      preventDefault: () => {},
                      clientY: touch.clientY,
                      clientX: touch.clientX,
                    },
                    memory.id
                  );
                }
              }}
            >
              {memory.image && (
                <img
                  src={getImgUrl(memory.image)}
                  alt={memory.title}
                  className="memory-item-img"
                />
              )}
              <div className="memory-info">
                <h4>{memory.title}</h4>
                <p>{memory.memory_date}</p>
              </div>
              {/* 新增编辑按钮 */}
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  editMemory(memory.id);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <FaEdit />
              </button>
            </div>
          ))}
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
            minWidth: '160px',
          }}
        >
          <div
            className="modal-option"
            onClick={handleConfirmDelete}
            style={{
              color: '#ff4d4f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              cursor: 'pointer',
            }}
          >
            <FaTrashAlt size={16} />
            <span>删除回忆</span>
          </div>
          <div
            className="modal-option"
            onClick={handleCancelDelete}
            style={{
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              cursor: 'pointer',
            }}
          >
            <FaTimes size={16} />
            <span>取消</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoriesPage;