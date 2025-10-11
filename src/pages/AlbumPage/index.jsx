import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrashAlt, FaTimes, FaTrash } from 'react-icons/fa';
import './AlbumPage.less';
import photos from '@/api/photos';
import EmptyState from '@/components/EmptyState';
import ImagePreview from '@/components/ImagePreview';
import SemiCircleFloatCategory from '@/components/SemiCircleFloatCategory';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { Dialog } from 'antd-mobile';

function AlbumPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]); // 预览用的完整图片URL
  const [originalImages, setOriginalImages] = useState([]); // 原始接口数据（含id）
  const [deleteMode, setDeleteMode] = useState(false); // 批量删除模式：true=开启，false=关闭
  const [selectedIds, setSelectedIds] = useState([]); // 已勾选的照片ID集合
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false); // 批量删除加载状态
  const categoryList = [
    {
      id: 1,
      name: "分类1"
    },
    {
      id: 2,
      name: "分类2"
    }
  ]

  // 获取照片列表（原有逻辑不变）
  async function getPhotoList() {
    try {
      const { data } = await photos.list();
      setOriginalImages(data || []);
      const imgs = (data || []).map(
        (v) => window._config.DOMAIN_URL + v.image_url
      );
      setImages(imgs || []);
    } catch (error) {
      console.error('获取相册列表失败:', error);
      toastFail('获取相册失败，请重试');
    }
  }

  useEffect(() => {
    getPhotoList();
    // 退出页面时重置批量删除状态（避免缓存状态）
    return () => {
      setDeleteMode(false);
      setSelectedIds([]);
    };
  }, []);

  // 跳转添加照片（原有逻辑不变）
  function addAlbum() {
    navigate('/upload');
  }

  // 切换批量删除模式：开启/关闭
  const toggleDeleteMode = () => {
    if (deleteMode) {
      // 从「批量删除」切换到「取消删除」：清空已选
      setSelectedIds([]);
    }
    setDeleteMode(!deleteMode);
  };

  // 勾选/取消勾选单张照片
  const handleImageSelect = (e, photoId) => {
    e.stopPropagation(); // 防止触发图片预览
    setSelectedIds((prev) => {
      if (prev.includes(photoId)) {
        // 已勾选：移除
        return prev.filter((id) => id !== photoId);
      } else {
        // 未勾选：添加
        return [...prev, photoId];
      }
    });
  };

  // 批量删除确认
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toastMsg('请先勾选要删除的照片');
      return;
    }

    Dialog.confirm({
      content: '确定要删除选中的 ' + selectedIds.length + ' 张照片吗？',
      onConfirm: async () => {
        setBatchDeleteLoading(true);
        try {
          // 调用批量删除接口（若接口支持批量，推荐传数组；若仅支持单删，循环调用）
          // 这里假设接口支持批量删除：photos.batchDelete({ ids: selectedIds })
          await photos.batchDelete({ ids: selectedIds });

          // 本地列表更新：过滤掉已删除的照片
          const newOriginalImages = originalImages.filter(
            (img) => !selectedIds.includes(img.id)
          );
          const newImages = newOriginalImages.map(
            (v) => window._config.DOMAIN_URL + v.image_url
          );

          setOriginalImages(newOriginalImages);
          setImages(newImages);
          setSelectedIds([]); // 清空已选
          toastSuccess('成功删除 ' + selectedIds.length + ' 张照片');
        } catch (error) {
          console.error('批量删除照片失败:', error);
          toastFail('删除失败，请稍后重试');
        } finally {
          setBatchDeleteLoading(false);
        }
      },
    });
  };

  // 根据分类筛选
  const filterList = (id) => {
    console.log("id >>>>", id)
  }

  return (
    <div className="page">
      <div className="section">
        {/* 头部：新增「批量删除/取消删除」按钮 */}
        <div
          className="section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3>我们的相册</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* 原有添加照片按钮 */}
            <button
              className="primary-btn"
              onClick={addAlbum}
              disabled={deleteMode} // 批量删除模式下禁用添加
              style={{ opacity: deleteMode ? 0.6 : 1 }}
            >
              <FaPlus /> 添加照片
            </button>
            {/* 新增：批量删除/取消删除 切换按钮 */}
            <button
              className={`${deleteMode ? 'danger-btn' : 'default-btn'}`}
              onClick={toggleDeleteMode}
              disabled={images.length === 0} // 无照片时禁用
            >
              {deleteMode ? (
                <>
                  <FaTimes size={14} /> 取消删除
                </>
              ) : (
                <>
                  <FaTrash size={14} /> 批量删除
                </>
              )}
            </button>
          </div>
        </div>

        {/* 批量删除模式下：显示已选数量和删除按钮 */}
        {deleteMode && selectedIds.length > 0 && (
          <div
            className="batch-delete-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: 'var(--accent-color)',
              marginTop: '1.3rem',
            }}
          >
            <span style={{ color: '#ff4d4f', fontSize: 14 }}>
              已选中 {selectedIds.length} 张照片
            </span>
            <button
              className="danger-btn"
              onClick={handleBatchDelete}
              disabled={batchDeleteLoading}
              style={{
                marginRight: '0.85rem',
              }}
            >
              {batchDeleteLoading ? (
                '删除中...'
              ) : (
                <>
                  <FaTrashAlt size={14} /> 确认删除
                </>
              )}
            </button>
          </div>
        )}

        {/* 空状态（原有逻辑不变） */}
        <EmptyState showBox={images?.length === 0} />

        {/* 相册网格：批量删除模式下显示勾选框 */}
        <div
          className={`album-grid ${
            deleteMode && selectedIds.length > 0 ? 'top-spacing' : ''
          }`}
          style={{
            gap: '0.21333rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          {images.map((item, index) => {
            const currentPhoto = originalImages[index] || {};
            const isSelected = selectedIds.includes(currentPhoto.id); // 是否已勾选

            return (
              <div
                key={currentPhoto.id || index} // 优先用照片ID作key
                className="album-item"
                style={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: deleteMode ? 'pointer' : 'default',
                  opacity: deleteMode && !isSelected ? 0.7 : 1, // 未勾选时降低透明度
                }}
                onClick={(e) =>
                  deleteMode && handleImageSelect(e, currentPhoto.id)
                } // 批量模式下点击卡片勾选
              >
                {/* 1. 图片预览（原有逻辑不变，批量模式下可禁用预览） */}
                <ImagePreview
                  currIndex={index}
                  imageList={images}
                  onClick={(e) => !deleteMode && e.stopPropagation()} // 批量模式下禁用预览
                  style={{ pointerEvents: deleteMode ? 'none' : 'auto' }} // 批量模式下屏蔽预览交互
                />

                {/* 2. 批量删除模式下：显示勾选框（默认隐藏） */}
                {deleteMode && (
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
                    onClick={(e) => e.stopPropagation()} // 避免触发卡片点击
                  >
                    {isSelected && <FaTimes size={12} color="#fff" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <SemiCircleFloatCategory categoryList={categoryList} onSearch={filterList} />
    </div>
  );
}

export default AlbumPage;
