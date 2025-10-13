import React, { useState, useEffect } from 'react';
import './UploadPage.less';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '@/components/ImageUploader';
import photos from '@/api/photos';
import photo_category from '@/api/photo_category';
import TopNavBar from '@/components/TopNavBar';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const UploadPhotoPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await photo_category.list();
        // 假设接口返回格式为 { code: 200, data: [{ id: 1, name: '分类1' }, ...] }
        if (data.code === 200 && Array.isArray(data.data)) {
          setCategories(data.data);
          // 如果有分类，默认选中第一个
          if (data.data.length > 0) {
            setSelectedCategory(data.data[0].id);
          }
        } else {
          toastFail('获取分类失败');
          console.error('获取分类失败:', data);
        }
      } catch (error) {
        toastFail('获取分类时发生错误');
        console.error('获取分类错误:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toastMsg('请上传照片');
      return;
    }

    if (!selectedCategory) {
      toastMsg('请选择照片分类');
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
        category_id: selectedCategory  // 添加分类ID到请求参数
      };

      // 调用照片上传接口
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
          {/* 分类选择下拉列表 */}
          <div className="form-group is-required">
            <label>照片分类</label>
            <div className="form-container">
              {loadingCategories ? (
                <div className="category-loading">加载分类中...</div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="category-select"
                  disabled={loadingCategories}
                >
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="">暂无分类</option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* 照片上传区域 */}
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