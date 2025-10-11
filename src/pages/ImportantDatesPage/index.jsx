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
  FaTrashAlt,  // 新增删除图标
  FaTimes       // 新增关闭图标
} from 'react-icons/fa'
import { calculateDaysUntilBirthday } from '@/utils'
import importantDate from '@/api/importantDate'
import EmptyState from '@/components/EmptyState'
import { getLoginInfo } from '@/utils/storage'

function ImportantDatesPage() {
  const navigate = useNavigate()
  const [importantDates, setImportantDates] = useState([])
  // 1. 管理删除弹窗状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [currentDeleteId, setCurrentDeleteId] = useState(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  // 添加重要日子（原有逻辑）
  function addDates() {
    navigate('/add-date')
  }

  // 获取重要日子列表（原有逻辑）
  async function getImportantDatesList() {
    try {
      const loginInfo = getLoginInfo()
      const couple_id = loginInfo?.couple?.id
      const { data } = await importantDate.list({ couple_id });
      setImportantDates(data || []);
    } catch (error) {
      console.error('获取重要日子失败:', error);
    }
  }

  // 2. 长按事件处理（PC端右键 + 移动端触摸）
  const handleLongPress = (e, dateId) => {
    // 阻止浏览器默认右键菜单
    e.preventDefault();
    // 记录要删除的ID和弹窗位置
    setCurrentDeleteId(dateId);
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`
    });
    setDeleteModalVisible(true);
  }

  // 3. 取消删除
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setCurrentDeleteId(null);
  }

  // 4. 确认删除
  const handleConfirmDelete = async () => {
    if (!currentDeleteId) return;
    try {
      // 调用删除接口（根据实际API调整）
      await importantDate.delete(currentDeleteId);
      // 更新本地列表
      setImportantDates(prev => prev.filter(date => date.id !== currentDeleteId));
      // 关闭弹窗
      setDeleteModalVisible(false);
      setCurrentDeleteId(null);
    } catch (error) {
      console.error('删除重要日子失败:', error);
      alert('删除失败，请稍后重试');
    }
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
              // 5. 绑定长按事件（PC端右键）
              onContextMenu={(e) => handleLongPress(e, date.id)}
              // 6. 移动端触摸长按支持（300ms以上视为长按）
              onTouchStart={(e) => {
                date.touchStartTime = Date.now(); // 记录触摸开始时间
              }}
              onTouchEnd={(e) => {
                const touchDuration = Date.now() - date.touchStartTime;
                if (touchDuration >= 300) {
                  // 模拟长按事件
                  const touch = e.changedTouches[0];
                  handleLongPress({
                    preventDefault: () => {},
                    clientY: touch.clientY,
                    clientX: touch.clientX
                  }, date.id);
                }
              }}
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

      {/* 7. 长按删除确认弹窗 */}
      {deleteModalVisible && (
        <div
          className="long-press-modal"
          style={{
            position: 'fixed',
            top: modalPosition.top,
            left: modalPosition.left,
            transform: 'translate(-50%, -100%)', // 向上对齐长按位置
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
            <span>删除该日子</span>
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
  )
}

export default ImportantDatesPage