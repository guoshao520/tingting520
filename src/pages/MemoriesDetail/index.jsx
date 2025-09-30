import React, { useState, useEffect } from 'react'
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
} from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import './MemoriesDetail.less'
import { memorieInfo } from '@/data'
import memory from '@/api/memory'
import TopNavBar from '@/components/TopNavBar'

const MemoryDetail = () => {
  const { id } = useParams() // 获取URL中的id参数
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [memoryData, setMemoryData] = useState({ images: [] })
 
  const handleBack = () => {
    window.history.back() // 浏览器后退
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === memoryData.images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? memoryData.images.length - 1 : prevIndex - 1
    )
  }

  async function getMemoriesInfo() {
    const { data } = await memory.detail(id);
    const obj = {
      ...data.memory,
      images: data.photos
    }
    setMemoryData(obj)
  }

  useEffect(() => {
    getMemoriesInfo();
  }, []);

  return (
    <div className="memory-detail">
      <TopNavBar title={'回忆详情'} />

      <div className="memory-content">
        <div className="memory-hero">
          <div className="image-gallery">
            <img
              src={window._config.DOMAIN_URL + memoryData.images[currentImageIndex]?.image_url}
              alt={memoryData.title}
              className="main-image"
            />

            {memoryData.images.length > 1 && (
              <>
                <button className="nav-button prev" onClick={prevImage}>
                  <FaChevronLeft />
                </button>
                <button className="nav-button next" onClick={nextImage}>
                  <FaChevronRight />
                </button>

                <div className="image-indicators">
                  {memoryData.images.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator ${
                        index === currentImageIndex ? 'active' : ''
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="memory-meta">
            <h2 className="memory-title">{memoryData.title}</h2>
            <div className="memory-date">
              <FaCalendarAlt className="meta-icon" />
              <span>{memoryData.date}</span>
            </div>

            <div className="memory-tags">
              <span className="tag">
                <FaMapMarkerAlt className="tag-icon" />
                {memoryData.location}
              </span>
            </div>
          </div>
        </div>

        <div className="memory-body">
          <div className="memory-text">
            {memoryData.content?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryDetail
