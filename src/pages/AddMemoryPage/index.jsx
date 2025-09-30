import React, { useRef, useState } from 'react';
import './AddMemoryPage.less';
import ImageUploader from '@/components/ImageUploader';
import memory from '@/api/memory';
import TopNavBar from '@/components/TopNavBar';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

const AddMemory = () => {
  // 表单元素引用
  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const contentRef = useRef(null);
  const dateRef = useRef(null);
  const fileInputRef = useRef(null);

  // 状态管理
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 简单验证
    if (!titleRef.current.value.trim()) {
      toastMsg('请输入回忆标题');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        couple_id: 1,
        title: titleRef.current.value,
        location: locationRef.current.value,
        memory_date: dateRef.current.value,
        content: contentRef.current.value,
        images,
      };

      const data = await memory.create(params);
      if (data.code === 200) {
        toastSuccess('保存成功');
      } else {
        toastFail(data.message);
      }
    } catch (error) {
      console.error('保存错误:', error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (uploadedImages) => {
    console.log('上传成功:', uploadedImages);
    // 这里可以保存到状态或发送到服务器
    uploadCallBack(uploadedImages);
  };

  const uploadCallBack = async (uploadedImages) => {
    const list = uploadedImages.map((v) => ({
      image_url: v.upyunPath,
    }));
    setImages(list);
  };

  const handleUploadError = (errors) => {
    console.error('上传错误:', errors);
  };

  return (
    <div>
      <TopNavBar title={'添加回忆'} />
      {/* {message && <div className="message">{message}</div>} */}
      <div className="add-memory-container">
        <form onSubmit={handleSubmit} className="memory-form">
          <div className="form-group">
            <label>标题 *</label>
            <input
              type="text"
              ref={titleRef}
              placeholder="给回忆起个标题"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>地点</label>
            <input
              type="text"
              ref={locationRef}
              placeholder="填写地点"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>日期</label>
            <input type="date" ref={dateRef} disabled={isSubmitting} />
          </div>

          <div className="form-group">
            <label>回忆内容 *</label>
            <textarea
              ref={contentRef}
              rows="5"
              placeholder="描述这段回忆..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>照片</label>
            <div className="form-container">
              <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存回忆'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemory;
