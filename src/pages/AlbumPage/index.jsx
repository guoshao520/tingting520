import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaTrash,
  FaEdit,
  FaTag,
  FaCheck,
  FaSpinner,
  FaLeaf
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
  const { couple } = getLoginInfo() || {}

  // ========== 基础图片状态（保持原有，新增分页逻辑） ==========
  const [images, setImages] = useState([]) // 用于展示的图片URL列表（合并后）
  const [originalImages, setOriginalImages] = useState([]) // 当前筛选的原始数据（合并后）
  const [fullOriginalImages, setFullOriginalImages] = useState([]) // 完整原始数据（合并后）
  const [editMode, seteditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [currentCategoryId, setCurrentCategoryId] = useState('')
  const [listLoading, setListLoading] = useState(false) // 初始加载/筛选加载状态

  // ========== 新增：分页加载核心状态 ==========
  const [page, setPage] = useState(1) // 当前页码（从1开始）
  const [pageSize] = useState(18) // 每页固定加载18条
  const [hasMore, setHasMore] = useState(true) // 是否还有更多数据
  const [loadingMore, setLoadingMore] = useState(false) // 加载更多中状态
  const scrollRef = useRef(null) // 滚动容器的ref（用于监听滚动）

  // 分类设置相关状态（保持原有）
  const [setCategoryVisible, setSetCategoryVisible] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [setCategoryLoading, setSetCategoryLoading] = useState(false)

  // ========== 改造：分页获取照片列表 ==========
  /**
   * 获取照片列表（支持分页+分类筛选）
   * @param {string} categoryId - 分类ID（可选，筛选用）
   * @param {boolean} isLoadMore - 是否是“加载更多”（true=追加数据，false=重置数据）
   */
  async function getPhotoList(categoryId = '', isLoadMore = false) {
    // 1. 前置校验：用户信息异常/无更多数据/加载中，直接返回
    if (!couple?.id) {
      toastFail('用户信息异常，请重新登录')
      return
    }
    if (!isLoadMore && listLoading) return // 初始加载/筛选时，避免重复请求
    if (isLoadMore && (loadingMore || !hasMore)) return // 加载更多时，避免重复请求/无效请求

    // 2. 设置加载状态
    if (isLoadMore) {
      setLoadingMore(true) // 加载更多的loading
    } else {
      setListLoading(true) // 初始加载/筛选的loading
      setPage(1) // 筛选新分类时，重置页码为1
      setHasMore(true) // 筛选新分类时，重置“有更多数据”状态
    }

    try {
      // 3. 构造请求参数（分页+分类）
      const params = {
        page: isLoadMore ? page + 1 : 1, // 加载更多=当前页+1，否则=1
        pageSize: pageSize,
        ...(categoryId && { category_id: categoryId }),
      }

      // 4. 调用接口（假设接口返回 { data: { list: [], total: 0 } } 格式）
      const { data } = await photos.list(params)
      const newData = data?.rows || data || [] // 新请求到的当前页数据
      const total = data?.total || data.length || 0 // 总数据条数（用于判断是否有更多）

      // 5. 处理数据合并（加载更多=追加，否则=覆盖）
      if (isLoadMore) {
        // 加载更多：追加数据
        const updatedFullImages = [...fullOriginalImages, ...newData]
        const updatedOriginalImages = [...originalImages, ...newData]
        const updatedImages = updatedOriginalImages.map(
          (v) => window._config.DOMAIN_URL + v.image_url
        )

        // 更新状态
        setFullOriginalImages(updatedFullImages)
        setOriginalImages(updatedOriginalImages)
        setImages(updatedImages)
        setPage(page + 1) // 页码+1

        // 判断是否还有更多数据（当前页数据长度 >= 总条数 → 无更多）
        setHasMore(updatedOriginalImages.length < total)
      } else {
        // 初始加载/筛选：覆盖数据
        const formattedImages = newData.map(
          (v) => window._config.DOMAIN_URL + v.image_url
        )

        // 更新状态
        setFullOriginalImages(newData)
        setOriginalImages(newData)
        setImages(formattedImages)

        // 判断是否还有更多数据（当前页数据长度 >= 总条数 → 无更多）
        setHasMore(newData.length < total)
      }

      seteditMode(false) // 加载数据后，重置编辑模式
    } catch (error) {
      console.error('获取相册列表失败:', error)
      toastFail(isLoadMore ? '加载更多失败，请重试' : '获取相册失败，请重试')
    } finally {
      // 6. 关闭加载状态
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setListLoading(false)
      }
    }
  }

  // ========== 改造：初始化+分类筛选（重置分页） ==========
  useEffect(() => {
    // 1. 获取分类列表（保持原有逻辑）
    const fetchCategories = async () => {
      try {
        const { code, data } = await photo_category.list()
        const fullCategoryList = [{ id: '', name: '全部' }, ...(data || [])]
        setCategoryList(fullCategoryList)
      } catch (error) {
        console.error('获取分类列表异常:', error)
        toastFail('分类加载失败，请重试')
        setCategoryList([{ id: '', name: '全部' }])
      }
    }

    fetchCategories()
    // 2. 初始加载：分类ID为空（全部照片），非加载更多（覆盖数据）
    getPhotoList('', false)
  }, [couple?.id])

  // ========== 新增：滚动监听（触发加载更多） ==========
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    // 计算滚动距离：容器高度 + 滚动Top >= 内容高度 - 100（提前100px触发加载，优化体验）
    const { scrollHeight, clientHeight, scrollTop } = container
    const isBottom = scrollHeight - clientHeight - scrollTop <= 100

    // 滚动到底部 → 触发加载更多
    if (isBottom) {
      getPhotoList(currentCategoryId, true)
    }
  }, [currentCategoryId, page, hasMore, loadingMore])

  // 监听滚动事件（组件挂载时绑定，卸载时解绑）
  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }

    // 组件卸载时解绑事件，避免内存泄漏
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  // ========== 改造：分类筛选（重置分页） ==========
  const filterList = (categoryId) => {
    setCurrentCategoryId(categoryId)
    // 筛选新分类时，重置数据（非加载更多）
    getPhotoList(categoryId, false)
  }

  // ========== 改造：批量删除（保持逻辑，适配合并后的数据） ==========
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要删除的照片')
      return
    }

    if (window.confirm(`确定要删除选中的 ${selectedIds.length} 张照片吗？`)) {
      setBatchDeleteLoading(true)
      try {
        await photos.batchDelete({ ids: selectedIds })

        // 更新完整列表（合并后的数据）
        const updatedFullImages = fullOriginalImages.filter(
          (img) => !selectedIds.includes(img.id)
        )
        setFullOriginalImages(updatedFullImages)

        // 刷新当前筛选列表（合并后的数据）
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
        // 删除后，重置页码（避免剩余数据不足一页时，加载更多异常）
        setPage(1)
        // 重新判断是否有更多数据（基于删除后的总条数）
        setHasMore(
          filteredImages.length <
            (await photos.list({ category_id: currentCategoryId })).data.total
        )
      } catch (error) {
        console.error('批量删除照片失败:', error)
        toastFail('删除失败，请稍后重试')
      } finally {
        setBatchDeleteLoading(false)
      }
    }
  }

  // ========== 改造：批量设置分类（保持逻辑，适配合并后的数据） ==========
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

      // 更新完整列表（合并后的数据）
      const updatedFullImages = fullOriginalImages.map((img) =>
        selectedIds.includes(img.id)
          ? { ...img, category_id: selectedCategoryId }
          : img
      )
      setFullOriginalImages(updatedFullImages)

      // 刷新当前筛选列表（合并后的数据）
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
      // 设置分类后，重置页码（避免筛选当前分类时数据变化导致加载异常）
      setPage(1)
    } catch (error) {
      console.error('批量设置分类失败:', error)
      toastFail('设置分类失败，请稍后重试')
    } finally {
      setSetCategoryLoading(false)
    }
  }

  // ========== 保持原有逻辑：跳转添加/切换编辑模式/取消设置分类 ==========
  function addAlbum() {
    navigate('/upload')
  }

  const toggleeditMode = () => {
    if (editMode) {
      setSelectedIds([])
    }
    seteditMode(!editMode)
  }

  const handleImageSelect = (e, photoId) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    )
  }

  const handleCancelSetCategory = () => {
    setSetCategoryVisible(false)
  }

  // ========== 改造：渲染（添加滚动容器+加载更多提示） ==========
  return (
    <div
      className="page"
      ref={scrollRef}
      style={{ height: '100vh', overflowY: 'auto', paddingBottom: 0 }}
    >
      {/* 初始加载/筛选加载提示（保持原有） */}
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

      {/* 设置分类弹窗（保持原有） */}
      {setCategoryVisible && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>选择分类</h3>
            <div className="category-list">
              {categoryList
                .filter((category) => category.id !== '')
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

      {/* 页面头部（保持原有） */}
      <div className="section" style={{ marginBottom: 0 }}>
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
                  className={`album-item ${editMode ? 'edit-mode' : ''} ${
                    isSelected ? 'selected' : ''
                  }`}
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
        {/* 优化后的 加载更多/暂无更多 提示（核心修改） */}
        <div className="album-loading-more">
          {loadingMore ? (
            // 加载中状态：带图标+旋转动画
            <div className="album-loading-more__card album-loading-more--loading">
              <span className="album-loading-more__icon">
                <FaSpinner size={16} /> {/* 需导入 FaSpinner 图标 */}
              </span>
              <span className="album-loading-more__text">
                正在加载更多照片
                <span className="album-loading-more__spin"></span>
              </span>
            </div>
          ) : !hasMore && images.length > 0 ? (
            // 暂无更多状态：带图标+柔和文案
            <div className="album-loading-more__card album-loading-more--no-more">
              <span className="album-loading-more__icon">
                <FaLeaf size={16} /> {/* 需导入 FaLeaf 图标（清新感） */}
              </span>
              <span className="album-loading-more__text">
                已展示全部照片啦～
              </span>
            </div>
          ) : null}
        </div>
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
