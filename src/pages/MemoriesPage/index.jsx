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
  FaTrashAlt, // 新增删除图标
  FaTimes, // 新增关闭图标
} from 'react-icons/fa';
import memory from '@/api/memory';
import EmptyState from '@/components/EmptyState';
import { getLoginInfo } from '@/utils/storage';

function MemoriesPage() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  // 1. 状态管理：删除弹窗的显示/隐藏、当前要删除的回忆ID
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  // 2. 状态管理：长按的坐标（用于弹窗定位）
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const loginInfo = getLoginInfo();
  const couple_id = loginInfo?.couple?.id;

  // 获取回忆列表（原有逻辑不变）
  async function getMemoriesList() {
    try {
      const { data } = await memory.list({ couple_id });
      setMemories(data?.rows || []);
    } catch (error) {
      console.error('获取回忆列表失败:', error);
    }
  }

  // 3. 长按事件处理（右键触发，阻止默认菜单）
  const handleLongPress = (e, memoryId) => {
    // 阻止浏览器默认右键菜单
    e.preventDefault();
    // 记录当前要删除的回忆ID
    setCurrentDeleteId(memoryId);
    // 设置弹窗位置（跟随鼠标/触摸点）
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
    });
    // 显示删除确认弹窗
    setDeleteModalVisible(true);
  };

  // 4. 取消删除（关闭弹窗）
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setCurrentDeleteId(null); // 清空要删除的ID
  };

  // 5. 确认删除（调用接口删除，更新列表）
  const handleConfirmDelete = async () => {
    if (!currentDeleteId) return;
    try {
      // 调用删除回忆的接口（假设接口为 memory.delete，需根据实际API调整）
      await memory.delete(currentDeleteId);
      // 删除成功后，更新本地列表（过滤掉已删除的回忆）
      setMemories((prev) => prev.filter((item) => item.id !== currentDeleteId));
      // 关闭弹窗
      setDeleteModalVisible(false);
      setCurrentDeleteId(null);
    } catch (error) {
      console.error('删除回忆失败:', error);
      alert('删除失败，请稍后重试'); // 可替换为项目中的提示组件
    }
  };

  // 原有跳转逻辑不变
  const handleMemoryClick = (memoryId) => {
    navigate(`/memories/${memoryId}`);
  };
  const addMemories = () => {
    navigate('/add-memory');
  };

  // 初始化获取列表
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
          {/* 遍历回忆列表，新增 onContextMenu 监听长按 */}
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="memory-list-item"
              onClick={() => handleMemoryClick(memory.id)}
              // 关键：右键长按触发删除弹窗（PC端）
              onContextMenu={(e) => handleLongPress(e, memory.id)}
              // 可选：移动端长按支持（触摸长按300ms触发）
              onTouchStart={(e) => {
                // 记录触摸开始时间
                memory.touchStartTime = Date.now();
              }}
              onTouchEnd={(e) => {
                // 计算触摸时长，超过300ms视为长按
                const touchDuration = Date.now() - memory.touchStartTime;
                if (touchDuration >= 300) {
                  // 获取触摸点坐标（适配移动端）
                  const touch = e.changedTouches[0];
                  handleLongPress(
                    {
                      preventDefault: () => {}, // 模拟PC端的preventDefault
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
                  src={window._config.DOMAIN_URL + memory.image}
                  alt={memory.title}
                  className="memory-item-img"
                />
              )}
              <div className="memory-info">
                <h4>{memory.title}</h4>
                <p>{memory.memory_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 长按删除确认弹窗（绝对定位，跟随长按位置） */}
      {deleteModalVisible && (
        <div
          className="long-press-modal"
          style={{
            position: 'fixed',
            top: modalPosition.top,
            left: modalPosition.left,
            transform: 'translate(-50%, -100%)', // 弹窗向上对齐长按点
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            padding: '12px 16px',
            zIndex: 9999, // 确保弹窗在最上层
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
