import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaList, FaPlus, FaTrashAlt, FaTimes, FaEdit } from 'react-icons/fa'
import classifyApi from '@/api/classify'
import EmptyState from '@/components/EmptyState'
import { getLoginInfo } from '@/utils/storage'
import './ClassifysPage.less' // 引入样式文件

function ClassifyListPage() {
  const navigate = useNavigate()
  const [classifies, setClassifies] = useState([])
  // 管理删除弹窗状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  // 管理编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentOperateId, setCurrentOperateId] = useState(null)
  const [currentOperateType, setCurrentOperateType] = useState('delete') // 'delete' 或 'edit'
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  // 编辑表单状态
  const [editClassifyName, setEditClassifyName] = useState('')
  const [editSortValue, setEditSortValue] = useState('')

  // 添加分类
  function addClassify() {
    navigate('/add-classify')
  }

  // 获取分类列表
  async function getClassifiesList() {
    try {
      const loginInfo = getLoginInfo()
      const couple_id = loginInfo?.couple?.id
      const { data } = await classifyApi.list({ couple_id })
      setClassifies(data || [])
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }

  // 长按事件处理（PC端右键 + 移动端触摸）
  const handleLongPress = (e, classifyId, operateType) => {
    e.preventDefault()
    setCurrentOperateId(classifyId)
    setCurrentOperateType(operateType)
    setModalPosition({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
    })
    if (operateType === 'edit') {
      // 编辑时，先获取分类信息
      const classify = classifies.find((item) => item.id === classifyId)
      if (classify) {
        setEditClassifyName(classify.classify_name)
        setEditSortValue(classify.sort_value.toString())
      }
      setEditModalVisible(true)
    } else {
      setDeleteModalVisible(true)
    }
  }

  // 取消操作
  const handleCancelOperate = () => {
    if (currentOperateType === 'edit') {
      setEditModalVisible(false)
    } else {
      setDeleteModalVisible(false)
    }
    setCurrentOperateId(null)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!currentOperateId) return
    try {
      await classifyApi.delete(currentOperateId)
      setClassifies((prev) =>
        prev.filter((classify) => classify.id !== currentOperateId)
      )
      setDeleteModalVisible(false)
      setCurrentOperateId(null)
    } catch (error) {
      console.error('删除分类失败:', error)
      alert('删除失败，请稍后重试')
    }
  }

  // 确认编辑
  const handleConfirmEdit = async () => {
    if (!currentOperateId) return
    if (!editClassifyName.trim()) {
      alert('分类名称不能为空')
      return
    }
    if (!editSortValue.trim() || isNaN(Number(editSortValue))) {
      alert('排序值请输入数字')
      return
    }
    try {
      const params = {
        classify_name: editClassifyName.trim(),
        sort_value: parseInt(editSortValue),
      }
      await classifyApi.update(currentOperateId, params)
      // 更新本地列表
      setClassifies((prev) =>
        prev.map((classify) =>
          classify.id === currentOperateId
            ? { ...classify, ...params }
            : classify
        )
      )
      setEditModalVisible(false)
      setCurrentOperateId(null)
    } catch (error) {
      console.error('编辑分类失败:', error)
      alert('编辑失败，请稍后重试')
    }
  }

  useEffect(() => {
    getClassifiesList()
  }, [])

  return (
    <div className="classify-list-page">
      <div className="section">
        <div className="section-header">
          <h3>分类管理</h3>
          <button className="primary-btn" onClick={addClassify}>
            <FaPlus /> 添加分类
          </button>
        </div>
        <EmptyState showBox={classifies?.length === 0} />

        <div className="classifies-list">
          {classifies.map((classify) => (
            <div
              key={classify.id}
              className="classify-list-item"
              // PC端右键
              onContextMenu={(e) => handleLongPress(e, classify.id, 'delete')}
              // 移动端触摸长按
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
                    classify.id,
                    'delete'
                  )
                }
              }}
            >
              <div className="classify-info">
                <h4>{classify.classify_name}</h4>
                <p>排序值：{classify.sort_value}</p>
              </div>
              {/* 编辑按钮，点击触发编辑操作 */}
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLongPress(e, classify.id, 'edit')
                }}
              >
                <FaEdit />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 删除确认弹窗 */}
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
            onClick={handleCancelOperate}
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

      {/* 编辑弹窗 */}
      {editModalVisible && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>编辑分类</h3>
            <div className="form-group">
              <label>分类名称</label>
              <input
                type="text"
                value={editClassifyName}
                onChange={(e) => setEditClassifyName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>排序值</label>
              <input
                type="text"
                value={editSortValue}
                onChange={(e) => setEditSortValue(e.target.value)}
              />
            </div>
            <div className="modal-btns">
              <button onClick={handleConfirmEdit} className="primary-btn">
                确认
              </button>
              <button onClick={handleCancelOperate} className="cancel-btn">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassifyListPage
