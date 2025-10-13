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
  FaTrashAlt,
  FaTimes,
  FaEdit // 新增编辑图标
} from 'react-icons/fa'
import { calculateDaysUntilBirthday } from '@/utils'
import importantDate from '@/api/importantDate'
import EmptyState from '@/components/EmptyState'
import { getLoginInfo } from '@/utils/storage'

function ImportantDatesPage() {
  const navigate = useNavigate()
  const [importantDates, setImportantDates] = useState([])
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [currentDeleteId, setCurrentDeleteId] = useState(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  // 1. 新增：编辑重要日子方法（跳转到表单页并携带ID）
  const editDate = (dateId) => {
    navigate(`/date-form?id=${dateId}`); // 与DateForm的编辑路由匹配
  }

  // 添加重要日子（原有逻辑）
  function addDates() {
    navigate('/date-form')
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

  // 长按事件处理（PC端右键 + 移动端触摸）
  const handleLongPress = (e, dateId) => {
    e.preventDefault();
    setCurrentDeleteId(dateId);
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`
    });
    setDeleteModalVisible(true);
  }

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setCurrentDeleteId(null);
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!currentDeleteId) return;
    try {
      await importantDate.delete(currentDeleteId);
      setImportantDates(prev => prev.filter(date => date.id !== currentDeleteId));
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
              style={{ 
                borderLeftColor: date.color,
                display: 'flex', // 新增：让内容与编辑按钮横向排列
                alignItems: 'center', // 新增：垂直居中对齐
                padding: '16px' // 可根据原有样式调整，确保空间足够
              }}
              onContextMenu={(e) => handleLongPress(e, date.id)}
              onTouchStart={(e) => {
                date.touchStartTime = Date.now();
              }}
              onTouchEnd={(e) => {
                const touchDuration = Date.now() - date.touchStartTime;
                if (touchDuration >= 300) {
                  const touch = e.changedTouches[0];
                  handleLongPress({
                    preventDefault: () => {},
                    clientY: touch.clientY,
                    clientX: touch.clientX
                  }, date.id);
                }
              }}
            >
              {/* 日期信息区域（占满剩余空间） */}
              <div className="date-info" style={{ flex: 1 }}>
                <h4>{date.title}</h4>
                <p>{date.day_date}</p>
              </div>
              
              {/* 剩余天数区域 */}
              <div className="days-left" style={{ margin: '0 16px' }}>
                <span>{calculateDaysUntilBirthday(date.day_date)}</span>
                <span>天</span>
              </div>
              
              {/* 2. 新增：编辑按钮（参照MemoriesPage样式） */}
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡到父元素（避免触发长按/点击其他逻辑）
                  editDate(date.id); // 调用编辑方法
                }}
              >
                <FaEdit />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 长按删除确认弹窗 */}
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