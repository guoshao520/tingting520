import React, { useRef, useState, useEffect } from 'react';
import './ClassifyForm.less';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import photo_category from '@/api/photo_category'; 
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const ClassifyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classifyNameRef = useRef(null);
  const sortValueRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClassifyId, setCurrentClassifyId] = useState(null);
  const { couple } = getLoginInfo() || {};

  // 解析URL参数获取分类ID（判断是否为编辑模式）
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const classifyId = searchParams.get('id');
    if (classifyId) {
      setIsEditMode(true);
      setCurrentClassifyId(classifyId);
      // 编辑模式：获取分类详情并填充表单
      getClassifyDetail(classifyId);
    }
  }, [location.search]);

  // 获取分类详情
  const getClassifyDetail = async (classifyId) => {
    try {
      const { data } = await photo_category.detail(classifyId);
      if (data) {
        classifyNameRef.current.value = data.name || '';
        sortValueRef.current.value = data.sort_order || '';
      }
    } catch (error) {
      console.error('获取分类详情失败:', error);
      toastFail('加载分类信息失败，请重试');
      navigate(-1);
    }
  };

  // 提交表单（新增/编辑通用）
  const handleSubmit = async (e) => {
    e.preventDefault();
    const className = classifyNameRef.current.value.trim();
    const sortValue = sortValueRef.current.value.trim();

    if (!className) {
      toastMsg('请输入分类名称');
      return;
    }
    if (!sortValue) {
      toastMsg('请输入排序值');
      return;
    }
    if (isNaN(Number(sortValue))) {
      toastMsg('排序值请输入数字');
      return;
    }

    setIsSubmitting(true);
    const params = {
      name: className,
      sort_order: parseInt(sortValue),
      couple_id: couple?.id
    };

    try {
      let response;
      if (isEditMode && currentClassifyId) {
        // 编辑模式：调用更新接口
        response = await photo_category.update(currentClassifyId, params);
      } else {
        // 新增模式：调用创建接口
        response = await photo_category.create(params);
      }

      if (response?.code === 200) {
        const successMsg = isEditMode ? '编辑分类成功' : '添加分类成功';
        toastSuccess(successMsg);
        setTimeout(() => navigate(-1), 1500);
      } else {
        toastFail(response?.message || '操作失败，请重试');
      }
    } catch (error) {
      console.error(`${isEditMode ? '编辑' : '添加'}分类错误:`, error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="classify-form-container">
      <TopNavBar 
        title={isEditMode ? '编辑分类' : '添加分类'} 
        onLeftClick={() => navigate(-1)}
      />
      <div className="classify-form-content">
        <form onSubmit={handleSubmit} className="classify-form">
          <div className="form-group is-required">
            <label>分类名称</label>
            <input
              type="text"
              ref={classifyNameRef}
              placeholder="请输入分类名称"
              disabled={isSubmitting}
              maxLength={50}
            />
          </div>

          <div className="form-group is-required">
            <label>排序值</label>
            <input 
              type="text" 
              ref={sortValueRef} 
              placeholder="请输入排序值（数字）"
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新' : '保存')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClassifyForm;