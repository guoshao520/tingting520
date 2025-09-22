import React, { useState, useCallback } from 'react'
import useUpYunUpload from '@/hooks/useUpYunUpload'
import './ImageUploader.css'

const ImageUploader = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [currentFile, setCurrentFile] = useState('')

  const { uploadFiles } = useUpYunUpload()

  // 处理拖放事件
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

  // 处理文件选择
  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  // 处理上传的文件
  const handleFiles = useCallback(
    async (files) => {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadedImages([])

      // 进度回调
      const onProgress = (progress, fileIndex, totalFiles, fileName) => {
        setUploadProgress(progress)
        setCurrentFile(`${fileName} (${fileIndex + 1}/${totalFiles})`)
      }

      try {
        const results = await uploadFiles(files, 'photos', onProgress)

        // 处理结果
        const successfulUploads = []
        const errors = []

        for (let i = 0; i < results.length; i++) {
          const result = results[i]

          if (result.success) {
            // 创建预览
            const file = files[i]
            const reader = new FileReader()

            const imageData = await new Promise((resolve) => {
              reader.onload = (e) => {
                resolve({
                  name: file.name,
                  url: e.target.result,
                  upyunPath: result.path,
                })
              }
              reader.readAsDataURL(file)
            })

            successfulUploads.push(imageData)
          } else {
            errors.push({
              fileName: result.fileName,
              error: result.error,
            })
          }
        }

        // 更新状态
        setUploadedImages(successfulUploads)

        // 回调通知
        if (successfulUploads.length > 0 && onUploadSuccess) {
          onUploadSuccess(successfulUploads)
        }

        if (errors.length > 0 && onUploadError) {
          onUploadError(errors)
        }

        // 显示结果摘要
        if (errors.length > 0) {
          alert(
            `上传完成。成功: ${successfulUploads.length}, 失败: ${errors.length}`
          )
        }
      } catch (error) {
        console.error('上传过程中出错:', error)
        if (onUploadError) {
          onUploadError([{ error: error.message }])
        }
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        setCurrentFile('')
      }
    },
    [uploadFiles, onUploadSuccess, onUploadError]
  )

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <h2>上传照片</h2>
        <p>支持拖放或点击选择照片</p>
      </div>

      <div
        className={`uploader-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <div className="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                fill="#4A90E2"
              />
              <path d="M14 2V8H20" fill="#3D7BC2" />
              <path
                d="M16 13H8V11H16V13ZM16 17H8V15H16V17ZM13 9H8V7H13V9Z"
                fill="white"
              />
            </svg>
          </div>
          <p>拖放照片到这里，或</p>
          <label htmlFor="file-upload" className="upload-button">
            选择照片
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p>上传中: {uploadProgress.toFixed(1)}%</p>
          {currentFile && (
            <p className="current-file">当前文件: {currentFile}</p>
          )}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          <h3>已上传的照片 ({uploadedImages.length}张)</h3>
          <div className="image-grid">
            {uploadedImages.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.url} alt={image.name} />
                <p>{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
