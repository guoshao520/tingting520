import React, { useRef, useState, useEffect } from 'react';
import './MemoryForm.less';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageUploader from '@/components/ImageUploader';
import memory from '@/api/memory';
import TopNavBar from '@/components/TopNavBar';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const MemoryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 表单元素引用
  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const contentRef = useRef(null);
  const dateRef = useRef(null);
  const fileInputRef = useRef(null);

  // 状态管理
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMemoryId, setCurrentMemoryId] = useState(null);
  const { couple } = getLoginInfo() || {};

  // 解析URL参数，判断是否为编辑模式并加载详情
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const memoryId = searchParams.get('id');
    if (memoryId) {
      setIsEditMode(true);
      setCurrentMemoryId(memoryId);
      getMemoryDetail(memoryId);
    }
  }, [location.search]);

  // 获取回忆详情（编辑模式）
  const getMemoryDetail = async (memoryId) => {
    try {
      const { data } = await memory.detail(memoryId, { couple_id: couple?.id });
      if (data) {
        // 填充表单数据
        titleRef.current.value = data.memory?.title || '';
        locationRef.current.value = data.memory?.location || '';
        contentRef.current.value = data.memory?.content || '';
        dateRef.current.value = data.memory?.memory_date || '';
        // 处理已上传图片（格式适配ImageUploader）
        const formattedImages = data.photos?.map(img => ({
          upyunPath: img.image_url,
          url: img.image_url // 假设ImageUploader需要预览URL，根据实际组件调整
        })) || [];
        setImages(formattedImages.map(img => ({ image_url: img.upyunPath })));
        // 若ImageUploader支持回显已上传图片，可补充对应逻辑
      }
    } catch (error) {
      console.error('获取回忆详情失败:', error);
      toastFail('加载回忆信息失败，请重试');
      navigate(-1);
    }
  };

  // 提交表单（新增/编辑通用）
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 简单验证
    if (!titleRef.current.value.trim()) {
      toastMsg('请输入回忆标题');
      return;
    }
    if (!dateRef.current.value.trim()) {
      toastMsg('请选择日期');
      return;
    }
    if (!contentRef.current.value.trim()) {
      toastMsg('请填写回忆内容');
      return;
    }
    if (images.length === 0) {
      toastMsg('请上传照片');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        couple_id: couple?.id,
        title: titleRef.current.value,
        location: locationRef.current.value,
        memory_date: dateRef.current.value,
        content: contentRef.current.value,
        images
      };

      let response;
      if (isEditMode && currentMemoryId) {
        // 编辑模式：调用更新接口
        response = await memory.update(currentMemoryId, params);
      } else {
        // 新增模式：调用创建接口
        response = await memory.create(params);
      }

      if (response?.code === 200) {
        const successMsg = isEditMode ? '编辑回忆成功' : '保存回忆成功';
        toastSuccess(successMsg);
        setTimeout(() => navigate(-1), 1500);
      } else {
        toastFail(response?.message || '操作失败，请重试');
      }
    } catch (error) {
      console.error(`${isEditMode ? '编辑' : '保存'}回忆错误:`, error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (uploadedImages) => {
    uploadCallBack(uploadedImages);
  };

  const uploadCallBack = async (uploadedImages) => {
    console.log("uploadedImages", uploadedImages)
    const list = uploadedImages.map((v) => ({
      image_url: v.upyunPath ? v.upyunPath : v.url,
    }));
    setImages(list);
  };

  const handleUploadError = (errors) => {
    console.error('上传错误:', errors);
  };

  return (
    <div className='memory-form-container'>
      <TopNavBar 
        title={isEditMode ? '编辑回忆' : '添加回忆'} 
        onLeftClick={() => navigate(-1)}
      />
      <div className="memory-form-content">
        <form onSubmit={handleSubmit} className="memory-form">
          <div className="form-group is-required">
            <label>标题</label>
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

          <div className="form-group is-required">
            <label>日期</label>
            <input type="date" ref={dateRef} disabled={isSubmitting} />
          </div>

          <div className="form-group is-required">
            <label>回忆内容</label>
            <textarea
              ref={contentRef}
              rows="5"
              placeholder="描述这段回忆..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group is-required">
            <label>照片</label>
            <div className="form-container">
              <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                // 若组件支持回显已上传图片，添加初始图片参数（根据组件实际API调整）
                initialImages={isEditMode ? images.map(img => ({ url: img.image_url })) : []}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? '更新中...' : '保存中...') 
              : (isEditMode ? '更新回忆' : '保存回忆')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemoryForm;