import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaTrash,
  FaEdit,
  FaTag,
  FaCheck,
} from 'react-icons/fa'
import './AlbumPage.less'
import photos from '@/api/photos'
import photo_category from '@/api/photo_category'
import EmptyState from '@/components/EmptyState'
import ImagePreview from '@/components/ImagePreview'
import SemiCircleFloatCategory from '@/components/SemiCircleFloatCategory'
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'
import { getLoginInfo } from '@/utils/storage'

function AlbumPage() {
  const navigate = useNavigate()
  const [images, setImages] = useState([]) // 用于展示的图片URL列表
  const [originalImages, setOriginalImages] = useState([]) // 当前筛选的原始数据
  const [fullOriginalImages, setFullOriginalImages] = useState([]) // 完整原始数据
  const [editMode, seteditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const { couple } = getLoginInfo() || {}

  // 分类设置相关状态
  const [setCategoryVisible, setSetCategoryVisible] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [setCategoryLoading, setSetCategoryLoading] = useState(false)

  // 修复：获取照片列表（先更新完整列表，再筛选）
  async function getPhotoList(categoryId = '') {
    if (!couple?.id) {
      toastFail('用户信息异常，请重新登录')
      return
    }

    setListLoading(true)
    try {
      const params = {
        ...(categoryId && { category_id: categoryId }),
      }

      // 1. 先请求接口获取数据
      const { data } = await photos.list(params)
      const responseData = data?.rows || data || [] // 兼容可能的分页结构

      // 2. 更新完整列表（关键修复：先确保完整列表已更新）
      setFullOriginalImages(responseData)

      // 3. 根据分类筛选当前需要显示的列表
      const filteredImages = categoryId
        ? responseData.filter((img) => img.category_id === categoryId)
        : responseData

      // 4. 更新当前视图数据
      setOriginalImages(filteredImages)
      const formattedImages = filteredImages.map(
        (v) => window._config.DOMAIN_URL + v.image_url
      )
      setImages(formattedImages)
      seteditMode(false)
    } catch (error) {
      console.error('获取相册列表失败:', error)
      toastFail('获取相册失败，请重试')
      setOriginalImages([])
      setFullOriginalImages([])
      setImages([])
    } finally {
      setListLoading(false)
    }
  }

  // 初始化：获取分类列表 + 加载默认照片列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { code, data } = await photo_category.list()
        if (code === 200 && Array.isArray(data)) {
          const fullCategoryList = [{ id: '', name: '全部' }, ...data]
          setCategoryList(fullCategoryList)
        } else {
          toastFail('获取分类列表失败')
          setCategoryList([{ id: '', name: '全部' }])
        }
      } catch (error) {
        console.error('获取分类列表异常:', error)
        toastFail('分类加载失败，请重试')
        setCategoryList([{ id: '', name: '全部' }])
      }
    }

    fetchCategories()
    getPhotoList() // 初始加载完整列表
  }, [couple?.id])

  // 跳转添加照片
  function addAlbum() {
    navigate('/upload')
  }

  // 切换批量操作模式
  const toggleeditMode = () => {
    if (editMode) {
      setSelectedIds([])
    }
    seteditMode(!editMode)
  }

  // 勾选/取消勾选单张照片
  const handleImageSelect = (e, photoId) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId)
      } else {
        return [...prev, photoId]
      }
    })
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要删除的照片')
      return
    }

    if (window.confirm(`确定要删除选中的 ${selectedIds.length} 张照片吗？`)) {
      setBatchDeleteLoading(true)
      try {
        await photos.batchDelete({ ids: selectedIds })

        // 更新完整列表
        const updatedFullImages = fullOriginalImages.filter(
          (img) => !selectedIds.includes(img.id)
        )
        setFullOriginalImages(updatedFullImages)

        // 刷新当前筛选列表
        const filteredImages = currentCategoryId
          ? updatedFullImages.filter(
              (img) => img.category_id === currentCategoryId
            )
          : updatedFullImages
        setOriginalImages(filteredImages)

        const newImages = filteredImages.map(
          (v) => window._config.DOMAIN_URL + v.image_url
        )
        setImages(newImages)

        setSelectedIds([])
        toastSuccess(`成功删除 ${selectedIds.length} 张照片`)
      } catch (error) {
        console.error('批量删除照片失败:', error)
        toastFail('删除失败，请稍后重试')
      } finally {
        setBatchDeleteLoading(false)
      }
    }
  }

  // 批量设置分类
  const handleBatchSetCategory = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要设置分类的照片')
      setSetCategoryVisible(false)
      return
    }
    if (!selectedCategoryId) {
      toastMsg('请选择目标分类')
      return
    }

    setSetCategoryLoading(true)
    try {
      await photos.batchSetCategory({
        photo_ids: selectedIds,
        category_id: selectedCategoryId,
      })

      // 更新完整列表的分类信息
      const updatedFullImages = fullOriginalImages.map((img) =>
        selectedIds.includes(img.id)
          ? { ...img, category_id: selectedCategoryId }
          : img
      )
      setFullOriginalImages(updatedFullImages)

      // 刷新当前筛选列表
      const filteredImages = currentCategoryId
        ? updatedFullImages.filter(
            (img) => img.category_id === currentCategoryId
          )
        : updatedFullImages
      setOriginalImages(filteredImages)

      const formattedImages = filteredImages.map(
        (v) => window._config.DOMAIN_URL + v.image_url
      )
      setImages(formattedImages)

      toastSuccess(`成功为 ${selectedIds.length} 张照片设置分类`)
      setSelectedIds([])
      setSetCategoryVisible(false)
      setSelectedCategoryId('')
    } catch (error) {
      console.error('批量设置分类失败:', error)
      toastFail('设置分类失败，请稍后重试')
    } finally {
      setSetCategoryLoading(false)
    }
  }

  // 取消设置分类
  const handleCancelSetCategory = () => {
    setSetCategoryVisible(false)
  }

  // 根据分类筛选照片
  const filterList = (categoryId) => {
    setCurrentCategoryId(categoryId)
    getPhotoList(categoryId) // 筛选时重新请求对应分类的数据
  }

  return (
    <div className="page">
      {listLoading && (
        <div
          className="list-loading"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            padding: '12px 24px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          加载中...
        </div>
      )}

      {/* 设置分类弹窗 */}
      {setCategoryVisible && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>选择分类</h3>
            <div className="category-list">
              {categoryList
                .filter((category) => category.id !== '') // 排除“全部”选项
                .map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`category-item ${
                      selectedCategoryId === category.id ? 'selected' : ''
                    }`}
                  >
                    <span>{category.name}</span>
                    {selectedCategoryId === category.id && (
                      <FaCheck style={{ marginLeft: 8 }} />
                    )}
                  </div>
                ))}
            </div>
            <div className="modal-btns">
              <button
                onClick={handleBatchSetCategory}
                className="primary-btn"
                disabled={setCategoryLoading}
              >
                {setCategoryLoading ? '设置中...' : '确认设置'}
              </button>
              <button onClick={handleCancelSetCategory} className="cancel-btn">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div
          className="section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            marginBottom: '1.3rem',
          }}
        >
          <h3>我们的相册</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="primary-btn"
              onClick={addAlbum}
              disabled={editMode || listLoading}
              style={{ opacity: editMode || listLoading ? 0.6 : 1 }}
            >
              <FaPlus /> 添加照片
            </button>
            <button
              className={`${editMode ? 'danger-btn' : 'default-btn'}`}
              onClick={toggleeditMode}
              disabled={images.length === 0 || listLoading}
            >
              {editMode ? (
                <>
                  <FaTimes size={14} /> 取消
                </>
              ) : (
                <>
                  <FaEdit size={14} /> 批量操作
                </>
              )}
            </button>
          </div>
        </div>
        {editMode && selectedIds.length > 0 && (
          <div
            className="batch-delete-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'var(--accent-color)',
              marginTop: '1.22rem',
            }}
          >
            <span style={{ color: '#ff4d4f', fontSize: 14 }}>
              已选中 {selectedIds.length} 张照片
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="default-btn"
                onClick={() => setSetCategoryVisible(true)}
                disabled={setCategoryLoading || listLoading}
              >
                <FaTag size={14} /> 设置分类
              </button>
              <button
                className="danger-btn"
                onClick={handleBatchDelete}
                disabled={batchDeleteLoading || listLoading}
              >
                {batchDeleteLoading ? (
                  '删除中...'
                ) : (
                  <>
                    <FaTrashAlt size={14} /> 删除
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!listLoading && (
          <EmptyState
            showBox={images?.length === 0}
            tip={
              currentCategoryId
                ? '该分类下暂无照片'
                : '暂无照片，点击添加按钮上传'
            }
          />
        )}

        {!listLoading && images.length > 0 && (
          <div
            className={`album-grid ${
              editMode && selectedIds.length > 0 ? 'top-spacing' : ''
            }`}
            style={{
              gap: '0.21333rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {images.map((item, index) => {
              const currentPhoto = originalImages[index] || {}
              const isSelected = selectedIds.includes(currentPhoto.id)

              return (
                <div
                  key={currentPhoto.id || index}
                  className={`album-item ${editMode ? 'edit-mode' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: editMode ? 'pointer' : 'default',
                    aspectRatio: '1/1', // 确保图片容器是正方形
                  }}
                  onClick={(e) =>
                    editMode && handleImageSelect(e, currentPhoto.id)
                  }
                >
                  {editMode ? (
                    <img
                      src={item}
                      alt={`相册图片 ${index}`}
                      className="album-image"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: editMode ? 'none' : 'auto',
                      }}
                      onClick={(e) => !editMode && e.stopPropagation()}
                    />
                  ) : (
                    <ImagePreview currIndex={index} imageList={images} />
                  )}
                  {editMode && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border: isSelected
                          ? '2px solid #ff4d4f'
                          : '2px solid #fff',
                        backgroundColor: isSelected ? '#ff4d4f' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <FaTimes size={12} color="#fff" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SemiCircleFloatCategory
        categoryList={categoryList}
        onSearch={filterList}
        defaultSelectedId={currentCategoryId}
        disabled={listLoading || editMode}
      />
    </div>
  )
}

export default AlbumPage
