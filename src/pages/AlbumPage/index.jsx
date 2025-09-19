import React, { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import './AlbumPage.css' // 假设你有样式文件

// 动态导入不同年份的图片
const imageContext2025 = require.context(
  '@/assets/images/2025',
  false,
  /\.(png|jpe?g|svg)$/
)
const imageContext2024 = require.context(
  '@/assets/images/2024',
  false,
  /\.(png|jpe?g|svg)$/
)

function AlbumPage() {
  const [images, setImages] = useState([])
  const [selectedYear, setSelectedYear] = useState('2025')
  const [loading, setLoading] = useState(false)

  // 年份选项
  const years = ['2025', '2024']

  // 根据选择的年份加载图片
  useEffect(() => {
    setLoading(true)

    const loadImagesForYear = (year) => {
      switch (year) {
        case '2025':
          return [...new Set(imageContext2025.keys().map(imageContext2025))]
        case '2024':
          return [...new Set(imageContext2024.keys().map(imageContext2024))]
        default:
          return []
      }
    }

    // 模拟加载延迟
    setTimeout(() => {
      const yearImages = loadImagesForYear(selectedYear)
      setImages(yearImages)
      setLoading(false)
    }, 300)
  }, [selectedYear])

  function addAlbum() {
    alert("暂未开发")
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">
          <h3>我们的相册</h3>
          <button className="primary-btn" onClick={addAlbum}>
            <FaPlus /> 添加照片
          </button>
        </div>

        {/* 年份选择器 */}
        <div className="year-selector">
          <span className="year-label">选择年份: </span>
          <div className="year-buttons">
            {years.map((year) => (
              <button
                key={year}
                className={`year-btn ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}年
              </button>
            ))}
          </div>
        </div>

        {/* 照片统计 */}
        <div className="album-stats">
          <p>
            {selectedYear}年共有 {images.length} 张照片
          </p>
        </div>

        {/* 照片网格 */}
        {loading ? (
          <div className="loading">加载中...</div>
        ) : images.length === 0 ? (
          <div className="empty-album">
            <p>{selectedYear}年还没有照片</p>
            <button className="primary-btn">
              <FaPlus /> 上传第一张照片
            </button>
          </div>
        ) : (
          <div className="album-grid">
            {images.map((item, index) => (
              <div key={index} className="album-item">
                <img src={item} alt={`${selectedYear}年照片 ${index + 1}`} />
                <div className="image-overlay">
                  <span className="image-date">
                    亲亲
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlbumPage
