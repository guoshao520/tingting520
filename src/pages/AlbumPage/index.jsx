import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaEdit,
  FaTag,
  FaCheck,
  FaSpinner,
  FaLeaf,
} from 'react-icons/fa';
import './AlbumPage.less';
import photos from '@/api/photos';
import photo_category from '@/api/photo_category';
import EmptyState from '@/components/EmptyState';
import ImagePreview from '@/components/ImagePreview';
import SemiCircleFloatCategory from '@/components/SemiCircleFloatCategory';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { Dialog } from 'antd-mobile';
import { getLoginInfo } from '@/utils/storage';

function AlbumPage() {
  const navigate = useNavigate();
  const { couple } = getLoginInfo() || {};

  // 基础图片状态（完全保留第一个代码的原始定义）
  const [images, setImages] = useState([]); // 用于展示的图片URL列表
  const [originalImages, setOriginalImages] = useState([]); // 当前筛选的原始数据
  const [fullOriginalImages, setFullOriginalImages] = useState([]); // 完整原始数据
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState('');
  const [listLoading, setListLoading] = useState(false); // 初始加载/筛选加载状态

  // 分页核心状态（替换为第二个代码的currentPage/nextPage逻辑）
  const [currentPage, setCurrentPage] = useState(1); // 当前已加载的页码
  const [nextPage, setNextPage] = useState(1); // 下一次要请求的页码（解决异步更新问题）
  const [limit] = useState(18); // 每页固定18条
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [loadingMore, setLoadingMore] = useState(false); // 加载更多中状态
  const scrollRef = useRef(null); // 滚动容器的ref
  const loadMoreTimer = useRef(null); // 滚动防抖定时器

  // 分类设置相关状态（完全保留第一个代码的原始定义）
  const [setCategoryVisible, setSetCategoryVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [setCategoryLoading, setSetCategoryLoading] = useState(false);

  /**
   * 获取照片列表（替换为第二个代码的分页核心逻辑，保留原始数据处理）
   */
  async function getPhotoList(categoryId = '', isLoadMore = false) {
    // 1. 严格请求锁：避免重复请求（第二个代码的核心校验）
    if (!couple?.id) {
      toastFail('用户信息异常，请重新登录');
      return;
    }
    if ((!isLoadMore && listLoading) || (isLoadMore && loadingMore)) {
      console.log('请求中，拒绝重复调用');
      return;
    }
    if (isLoadMore && !hasMore) {
      console.log('无更多数据，拒绝调用');
      return;
    }

    // 2. 设置加载状态（保留第一个代码的逻辑）
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setListLoading(true);
      setCurrentPage(1); // 筛选时重置当前页码（第二个代码逻辑）
      setNextPage(1); // 筛选时重置下一页请求页码（第二个代码逻辑）
      setHasMore(true);
    }

    try {
      // 3. 构造请求参数（使用nextPage确保页码正确递增，第二个代码逻辑）
      const requestPage = isLoadMore ? nextPage : 1;
      console.log(`发起请求：页码=${requestPage}，分类=${categoryId}`);
      const params = {
        page: requestPage,
        limit,
        ...(categoryId && { category_id: categoryId }),
      };

      // 4. 调用接口（保留第一个代码的接口逻辑）
      const { data } = await photos.list(params);
      const newData = data?.rows || data || [];
      const total = data?.count || data.length || 0;

      // 5. 处理数据和页码（结合第一个代码的数据合并逻辑 + 第二个代码的页码更新逻辑）
      if (isLoadMore) {
        // 加载更多：追加数据（保留第一个代码的合并逻辑）
        const updatedFullImages = [...fullOriginalImages, ...newData];
        const updatedOriginalImages = [...originalImages, ...newData];
        const updatedImages = updatedOriginalImages.map(
          (v) => window._config.DOMAIN_URL + v.image_url
        );

        // 先更新下一次请求的页码（第二个代码核心：确保下次请求正确）
        setNextPage(requestPage + 1);
        // 再更新当前已加载页码（第二个代码逻辑）
        setCurrentPage(requestPage);

        // 保留第一个代码的数据状态更新
        setFullOriginalImages(updatedFullImages);
        setOriginalImages(updatedOriginalImages);
        setImages(updatedImages);

        // 判断是否还有更多数据（结合两个代码的逻辑）
        const hasMoreData = updatedOriginalImages.length < total;
        setHasMore(hasMoreData);
        console.log(
          `加载更多完成：当前页=${requestPage}，总数据=${updatedOriginalImages.length}，总条数=${total}，是否有更多=${hasMoreData}`
        );
      } else {
        // 初始加载/筛选：覆盖数据（保留第一个代码的合并逻辑）
        const formattedImages = newData.map(
          (v) => window._config.DOMAIN_URL + v.image_url
        );

        // 重置页码（第二个代码逻辑）
        setNextPage(2); // 下一次请求第2页
        setCurrentPage(1); // 当前页为第1页

        // 保留第一个代码的数据状态更新
        setFullOriginalImages(newData);
        setOriginalImages(newData);
        setImages(formattedImages);

        // 判断是否有更多数据（结合两个代码的逻辑）
        const hasMoreData = newData.length < total;
        setHasMore(hasMoreData);
        console.log(
          `初始加载完成：当前页=1，总数据=${newData.length}，总条数=${total}，是否有更多=${hasMoreData}`
        );
      }

      setEditMode(false); // 加载数据后重置编辑模式（保留第一个代码逻辑）
    } catch (error) {
      console.error('获取相册列表失败:', error);
      toastFail(isLoadMore ? '加载更多失败，请重试' : '获取相册失败，请重试');
    } finally {
      // 6. 关闭加载状态（保留第一个代码的逻辑）
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setListLoading(false);
      }
    }
  }

  // 初始化+分类筛选（完全保留第一个代码的原始逻辑）
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { code, data } = await photo_category.list();
        const fullCategoryList = [{ id: '', name: '全部' }, ...(data || [])];
        setCategoryList(fullCategoryList);
      } catch (error) {
        console.error('获取分类列表异常:', error);
        toastFail('分类加载失败，请重试');
        setCategoryList([{ id: '', name: '全部' }]);
      }
    };

    fetchCategories();
    getPhotoList('', false);
  }, [couple?.id]);

  // 滚动监听（替换为第二个代码的逻辑，确保滚动触发准确）
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    // 清除上一次定时器（防抖，第二个代码逻辑）
    clearTimeout(loadMoreTimer.current);

    // 滚动停止200ms后判断（确保状态更新完成，第二个代码逻辑）
    loadMoreTimer.current = setTimeout(() => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const isBottom = scrollHeight - clientHeight - scrollTop <= 100;

      // 严格校验：只有在非加载中、有更多数据时才触发（第二个代码逻辑）
      if (isBottom && !loadingMore && hasMore && !listLoading) {
        console.log('触发加载更多，下一页页码=', nextPage);
        getPhotoList(currentCategoryId, true);
      }
    }, 200); // 延长防抖时间，确保状态同步（第二个代码逻辑）
  }, [currentCategoryId, loadingMore, hasMore, listLoading, nextPage]);

  // 监听滚动事件（保留第一个代码的清理逻辑，结合第二个代码的绑定）
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    // 组件卸载时清理（保留第一个代码逻辑，补充定时器清理）
    return () => {
      clearTimeout(loadMoreTimer.current);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // 分类筛选（完全保留第一个代码的原始逻辑）
  const filterList = (categoryId) => {
    setCurrentCategoryId(categoryId);
    getPhotoList(categoryId, false);
  };

  // 批量删除（完全保留第一个代码的原始逻辑，未做任何修改）
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要删除的照片');
      return;
    }

    Dialog.confirm({
      content: `确定要删除选中的 ${selectedIds.length} 张照片吗？`,
      onConfirm: async () => {
        setBatchDeleteLoading(true);
        try {
          await photos.batchDelete({ ids: selectedIds });

          // 更新完整列表
          const updatedFullImages = fullOriginalImages.filter(
            (img) => !selectedIds.includes(img.id)
          );
          setFullOriginalImages(updatedFullImages);

          // 刷新当前筛选列表
          const filteredImages = currentCategoryId
            ? updatedFullImages.filter(
                (img) => img.category_id === currentCategoryId
              )
            : updatedFullImages;
          setOriginalImages(filteredImages);

          const newImages = filteredImages.map(
            (v) => window._config.DOMAIN_URL + v.image_url
          );
          setImages(newImages);

          setSelectedIds([]);
          toastSuccess(`成功删除 ${selectedIds.length} 张照片`);
          // 适配新分页状态：重置页码（结合第二个代码逻辑）
          setCurrentPage(1);
          setNextPage(2);
          setEditMode(false);
          // 重新判断是否有更多数据
          setHasMore(
            filteredImages.length <
              (await photos.list({ category_id: currentCategoryId })).data.total
          );
        } catch (error) {
          console.error('批量删除照片失败:', error);
          toastFail('删除失败，请稍后重试');
        } finally {
          setBatchDeleteLoading(false);
        }
      },
    });
  };

  // 批量设置分类（完全保留第一个代码的原始逻辑，未做任何修改）
  const handleBatchSetCategory = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要设置分类的照片');
      setSetCategoryVisible(false);
      return;
    }
    if (!selectedCategoryId) {
      toastMsg('请选择目标分类');
      return;
    }

    setSetCategoryLoading(true);
    try {
      await photos.batchSetCategory({
        photo_ids: selectedIds,
        category_id: selectedCategoryId,
      });

      // 更新完整列表
      const updatedFullImages = fullOriginalImages.map((img) =>
        selectedIds.includes(img.id)
          ? { ...img, category_id: selectedCategoryId }
          : img
      );
      setFullOriginalImages(updatedFullImages);

      // 刷新当前筛选列表
      const filteredImages = currentCategoryId
        ? updatedFullImages.filter(
            (img) => img.category_id === currentCategoryId
          )
        : updatedFullImages;
      setOriginalImages(filteredImages);

      const formattedImages = filteredImages.map(
        (v) => window._config.DOMAIN_URL + v.image_url
      );
      setImages(formattedImages);

      toastSuccess(`成功为 ${selectedIds.length} 张照片设置分类`);
      setSelectedIds([]);
      setSetCategoryVisible(false);
      setSelectedCategoryId('');
      // 适配新分页状态：重置页码（结合第二个代码逻辑）
      setCurrentPage(1);
      setNextPage(2);
      setEditMode(false);
    } catch (error) {
      console.error('批量设置分类失败:', error);
      toastFail('设置分类失败，请稍后重试');
    } finally {
      setSetCategoryLoading(false);
    }
  };

  // 以下方法完全保留第一个代码的原始实现，未做任何修改
  function addAlbum() {
    navigate('/upload');
  }

  const toggleeditMode = () => {
    if (editMode) {
      setSelectedIds([]);
    }
    setEditMode(!editMode);
  };

  const handleImageSelect = (e, photoId) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleCancelSetCategory = () => {
    setSetCategoryVisible(false);
  };

  // 渲染部分（完全保留第一个代码的原始结构，确保UI一致）
  return (
    <div
      className="page"
      ref={scrollRef}
      style={{ height: '100vh', overflowY: 'auto', paddingBottom: 0 }}
    >
      {/* 初始加载/筛选加载提示 */}
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
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FaSpinner
            size={16}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          加载中...
        </div>
      )}

      {/* 设置分类弹窗（完全保留原始结构） */}
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
                {setCategoryLoading ? (
                  <>
                    <FaSpinner
                      size={14}
                      style={{
                        animation: 'spin 1s linear infinite',
                        marginRight: 4,
                      }}
                    />
                    设置中...
                  </>
                ) : (
                  '确认设置'
                )}
              </button>
              <button onClick={handleCancelSetCategory} className="cancel-btn">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 页面头部（完全保留原始结构） */}
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

        {/* 批量操作工具栏（完全保留原始结构） */}
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
                  <>
                    <FaSpinner
                      size={14}
                      style={{
                        animation: 'spin 1s linear infinite',
                        marginRight: 4,
                      }}
                    />
                    删除中...
                  </>
                ) : (
                  <>
                    <FaTrashAlt size={14} /> 删除
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 空状态提示（完全保留原始结构） */}
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

        {/* 照片网格（完全保留原始结构） */}
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
              const currentPhoto = originalImages[index] || {};
              const isSelected = selectedIds.includes(currentPhoto.id);

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
                    aspectRatio: '1/1',
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
                      loading="lazy"
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
              );
            })}
          </div>
        )}

        {/* 加载更多提示（保留原始结构，适配新分页状态） */}
        <div className="album-loading-more">
          {loadingMore ? (
            <div className="album-loading-more__card album-loading-more--loading">
              <span className="album-loading-more__icon">
                <FaSpinner
                  size={16}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              </span>
              <span className="album-loading-more__text">正在加载更多照片</span>
            </div>
          ) : !hasMore && images.length > 0 ? (
            <div className="album-loading-more__card album-loading-more--no-more">
              <span className="album-loading-more__icon">
                <FaLeaf size={16} />
              </span>
              <span className="album-loading-more__text">
                已展示全部照片啦～
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 分类选择器（完全保留原始结构） */}
      <SemiCircleFloatCategory
        categoryList={categoryList}
        onSearch={filterList}
        defaultSelectedId={currentCategoryId}
        disabled={listLoading || editMode}
      />
    </div>
  );
}

export default AlbumPage;
