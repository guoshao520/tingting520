import React from 'react';
import ImageUploader from '@/components/ImageUploader';
import photos from '@/api/photos';
import './UploadPage.css';
import TopNavBar from '@/components/TopNavBar';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

function App() {
  const handleUploadSuccess = (uploadedImages) => {
    console.log('上传成功:', uploadedImages);
    // 这里可以保存到状态或发送到服务器
    uploadCallBack(uploadedImages);
  };

  const uploadCallBack = async (uploadedImages) => {
    const params = {
      images: uploadedImages.map((v) => ({
        image_url: v.upyunPath,
      })),
    };
    const data = await photos.create(params);
    if (data.code === 200) {
      toastSuccess('上传成功');
    }
  };

  const handleUploadError = (errors) => {
    console.error('上传错误:', errors);
  };

  return (
    <div>
      <TopNavBar title={'添加照片'} />
      <div className="upload-container">
        <ImageUploader
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>
    </div>
  );
}

export default App;
