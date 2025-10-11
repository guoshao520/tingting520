import React, { useState } from 'react';
import './UploadPage.less';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '@/components/ImageUploader';
import photos from '@/api/photos';
import TopNavBar from '@/components/TopNavBar';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const UploadPhotoPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleUploadSuccess = (uploadedImages) => {
    console.log('照片上传成功:', uploadedImages);
    const formattedImages = uploadedImages.map((v) => ({
      image_url: v.upyunPath,
    }));
    setImages(formattedImages);
  };

  const handleUploadError = (errors) => {
    console.error('照片上传错误:', errors);
    const errorMsg = errors[0]?.message || '照片上传失败，请重试';
    toastFail(errorMsg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toastMsg('请上传照片');
      return;
    }

    // 禁用按钮，防止重复提交
    setIsSubmitting(true);

    try {
      const loginInfo = getLoginInfo();
      const couple_id = loginInfo?.couple?.id;

      const params = {
        couple_id,
        images: images,
      };

      // 调用照片上传接口（替换为实际接口方法）
      const data = await photos.create(params);
      if (data.code === 200) {
        toastSuccess('照片保存成功');
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toastFail(data.message || '照片保存失败');
      }
    } catch (error) {
      console.error('照片保存错误:', error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      // 恢复按钮状态
      setIsSubmitting(false);
    }
  };

  return (
    <div className='uploadPage-container'>
      <TopNavBar title={'上传照片'} />

      <div className="uploadPage-content">
        <form onSubmit={handleSubmit} className="uploadPage-form">
          <div className="form-group is-required">
            <label>照片</label>
            <div className="form-container">
              <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxCount={9}
                accept="image/jpg,image/png,image/jpeg"
              />
              {images.length > 0 && (
                <div className="upload-count">
                  已选择 {images.length} 张照片
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存照片'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoPage;