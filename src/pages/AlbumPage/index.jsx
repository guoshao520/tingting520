import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa'
import './AlbumPage.less' // 假设你有样式文件
import photos from '@/api/photos'
import EmptyState from '@/components/EmptyState'
import ImagePreview from '@/components/ImagePreview'

function AlbumPage() {
  const navigate = useNavigate()
  const [images, setImages] = useState([])

  async function getPhotoList() {
    // const { data } = await photos.list();
    // const imgs = data.map((v) => v.image_url);
    const imgs = [
      'https://picsum.photos/800/600?1',
      'https://picsum.photos/800/600?1',
      'https://picsum.photos/800/600?1',
      'https://picsum.photos/800/600?1',
      'https://picsum.photos/800/600?1',
    ]
    setImages(imgs || [])
  }

  useEffect(() => {
    getPhotoList()
  }, [])

  function addAlbum() {
    navigate('/upload')
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

        <EmptyState showBox={images?.length === 0} />
        <div className="album-grid">
          {images.map((item, index) => (
            <div key={index} className="album-item">
              <ImagePreview currIndex={index} imageList={images} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AlbumPage
