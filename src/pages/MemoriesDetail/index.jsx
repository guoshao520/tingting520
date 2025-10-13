import React, { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaHeart,
  FaEdit,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCloudSun,
  FaSmile,
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaShareAlt,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import './MemoriesDetail.less';
import memory from '@/api/memory';
import TopNavBar from '@/components/TopNavBar';
import ImagePreview from '@/components/ImagePreview';
import { getImgUrl } from '@/utils';

const MemoryDetail = () => {
  const { id } = useParams(); // 获取URL中的id参数
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [memoryData, setMemoryData] = useState({ images: [] });
  // 新增：控制图片预览弹窗的显示/隐藏
  const [showViewer, setShowViewer] = useState(false);
  // 新增：预览时当前选中的图片索引
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleBack = () => {
    window.history.back(); // 浏览器后退
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === memoryData.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? memoryData.images.length - 1 : prevIndex - 1
    );
  };

  // 新增：打开图片预览（点击主图或指示器触发）
  const openViewer = (index = currentImageIndex) => {
    setViewerIndex(index); // 记录当前要预览的图片索引
    setShowViewer(true); // 显示预览弹窗
  };

  // 新增：关闭图片预览
  const closeViewer = () => {
    setShowViewer(false);
  };

  // 新增：预览时切换图片
  const handleViewerChange = (newIndex) => {
    setViewerIndex(newIndex);
  };

  async function getMemoriesInfo() {
    const { data } = await memory.detail(id);
    const obj = {
      ...data.memory,
      images: data.photos || [], // 确保images为数组，避免无图片时报错
    };
    setMemoryData(obj);
  }

  useEffect(() => {
    getMemoriesInfo();
  }, [id]); // 依赖id，确保路由参数变化时重新请求

  // 处理预览图片列表：格式化为 ImageViewer 所需的数组（仅包含图片URL）
  const previewImageList = memoryData.images.map(
    (item) => getImgUrl(item.image_url)
  );

  console.log('previewImageList', previewImageList);

  return (
    <div className="memory-detail">
      <TopNavBar title={'回忆详情'} />

      <div className="memory-content">
        <div className="memory-hero">
          <div className="image-gallery">
            <ImagePreview
              currIndex={currentImageIndex}
              imageList={memoryData.images.map(v => getImgUrl(v.image_url))}
            />

            {/* 原有轮播控制按钮 */}
            {memoryData.images.length > 1 && (
              <>
                <button className="nav-button prev" onClick={prevImage}>
                  <FaChevronLeft />
                </button>
                <button className="nav-button next" onClick={nextImage}>
                  <FaChevronRight />
                </button>

                {/* 图片指示器：点击也可打开预览 */}
                <div className="image-indicators">
                  {memoryData.images.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator ${
                        index === currentImageIndex ? 'active' : ''
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index); // 先切换主图
                        openViewer(index); // 再打开预览（定位到当前点击的图片）
                      }}
                      style={{ cursor: 'pointer' }}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="memory-meta">
            <h2 className="memory-title">{memoryData.title || '未命名回忆'}</h2>
            <div className="memory-date">
              <FaCalendarAlt className="meta-icon" />
              <span>{memoryData.memory_date || '未知时间'}</span>
            </div>

            <div className="memory-tags">
              <span className="tag">
                <FaMapMarkerAlt className="tag-icon" />
                {memoryData.location || '未知地点'}
              </span>
            </div>
          </div>
        </div>

        <div className="memory-body">
          <div className="memory-text">
            {memoryData.content ? (
              memoryData.content
                .split('\n')
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p className="empty-content">暂无回忆内容</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;
