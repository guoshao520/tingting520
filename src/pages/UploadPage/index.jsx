import React from 'react'
import ImageUploader from '@/components/ImageUploader'
import photos from '@/api/photos'

function App() {
  const handleUploadSuccess = (uploadedImages) => {
    console.log('上传成功:', uploadedImages)
    // 这里可以保存到状态或发送到服务器
  }

  const handleUploadError = (errors) => {
    console.error('上传错误:', errors)
    alert(`上传完成，但有${errors.length}个文件失败`)
  }

  return (
    <div className="upload-container">
      <ImageUploader
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </div>
  )
}

export default App
