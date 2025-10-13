import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaTrashAlt, FaTimes, FaEdit, FaArrowLeft } from 'react-icons/fa'
import photo_category from '@/api/photo_category'
import EmptyState from '@/components/EmptyState'
import { getLoginInfo } from '@/utils/storage'
import './ClassifysPage.less'

function ClassifyListPage() {
  const navigate = useNavigate()
  const [classifies, setClassifies] = useState([])
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [currentDeleteId, setCurrentDeleteId] = useState(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  const handleBack = () => {
    window.history.back();
  };

  function addClassify() {
    navigate('/classify-form')
  }

  function editClassify(classifyId) {
    navigate(`/classify-form?id=${classifyId}`)
  }

  async function getClassifiesList() {
    try {
      const loginInfo = getLoginInfo()
      const couple_id = loginInfo?.couple?.id
      const { data } = await photo_category.list({ couple_id })
      setClassifies(data || [])
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }

  const handleLongPress = (e, classifyId) => {
    e.preventDefault()
    setCurrentDeleteId(classifyId)
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
    })
    setDeleteModalVisible(true)
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setCurrentDeleteId(null)
  }

  const handleConfirmDelete = async () => {
    if (!currentDeleteId) return
    try {
      await photo_category.delete(currentDeleteId)
      setClassifies((prev) =>
        prev.filter((classify) => classify.id !== currentDeleteId)
      )
      setDeleteModalVisible(false)
      setCurrentDeleteId(null)
      alert('删除分类成功')
    } catch (error) {
      console.error('删除分类失败:', error)
      alert('删除失败，请稍后重试')
    }
  }

  useEffect(() => {
    getClassifiesList()
  }, [])

  return (
    <div className="classify-list-page">
      <div className="section">
        <div className="section-header">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h3>分类管理</h3>
          <button className="primary-btn" onClick={addClassify}>
            <FaPlus /> 添加分类
          </button>
        </div>
        <EmptyState showBox={classifies?.length === 0} tip="暂无分类，点击添加按钮创建" />

        <div className="classifies-list">
          {classifies.map((classify) => (
            <div
              key={classify.id}
              className="classify-list-item"
              onContextMenu={(e) => handleLongPress(e, classify.id)}
              onTouchStart={(e) => {
                classify.touchStartTime = Date.now()
              }}
              onTouchEnd={(e) => {
                const touchDuration = Date.now() - classify.touchStartTime
                if (touchDuration >= 300) {
                  const touch = e.changedTouches[0]
                  handleLongPress(
                    {
                      preventDefault: () => {},
                      clientY: touch.clientY,
                      clientX: touch.clientX,
                    },
                    classify.id
                  )
                }
              }}
            >
              <div className="classify-info">
                <h4>{classify.name}</h4>
                <p>排序值：{classify.sort_order}</p>
              </div>
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  editClassify(classify.id)
                }}
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
            className="delete-option"
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
            <span>删除该分类</span>
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
              cursor: 'pointer',
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

export default ClassifyListPage