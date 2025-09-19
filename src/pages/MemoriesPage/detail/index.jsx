import React, { useState } from 'react'
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
import './detail.css'
import { memorieInfo } from '@/data'

const MemoryDetail = ({ memory }) => {
  const { id } = useParams() // 获取URL中的id参数
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const memoryData = memorieInfo[id]

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

  const handleBack = () => {
    window.history.back() // 浏览器后退
  }

  return (
    <div className="memory-detail">
      <header className="memory-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h2>回忆详情</h2>
      </header>

      <div className="memory-content">
        <div className="memory-hero">
          <div className="image-gallery">
            <img
              src={memoryData.images[currentImageIndex]}
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
              <span className="tag">
                <FaCloudSun className="tag-icon" />
                {memoryData.weather}
              </span>
              <span className="tag">
                <FaSmile className="tag-icon" />
                {memoryData.mood}
              </span>
            </div>
          </div>
        </div>

        <div className="memory-body">
          <div className="memory-text">
            {memoryData.boy_content?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryDetail
