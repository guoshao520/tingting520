import React, { useRef, useState, useEffect } from 'react';
import './WishForm.less';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import wish from '@/api/wish';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const WishForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const targetDateRef = useRef(null);
  const priorityRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWishId, setCurrentWishId] = useState(null);
  const { couple } = getLoginInfo() || {};

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const wishId = searchParams.get('id');
    if (wishId) {
      setIsEditMode(true);
      setCurrentWishId(wishId);
      getWishDetail(wishId);
    }
  }, [location.search]);

  const getWishDetail = async (wishId) => {
    try {
      const { data } = await wish.detail(wishId);
      if (data) {
        titleRef.current.value = data.title || '';
        descriptionRef.current.value = data.description || '';
        targetDateRef.current.value = data.target_date || '';
        priorityRef.current.value = data.priority || 1;
      }
    } catch (error) {
      console.error('获取心愿详情失败:', error);
      toastFail('加载数据失败，请重试');
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titleRef.current.value.trim()) {
      toastMsg('请输入心愿名称');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        couple_id: couple?.id,
        title: titleRef.current.value.trim(),
        description: descriptionRef.current.value.trim() || '',
        target_date: targetDateRef.current.value || null,
        priority: parseInt(priorityRef.current.value) || 1
      };

      let response;
      if (isEditMode && currentWishId) {
        response = await wish.update(currentWishId, params);
      } else {
        response = await wish.create(params);
      }

      if (response?.code === 200) {
        const successMsg = isEditMode ? '更新成功' : '保存成功';
        toastSuccess(successMsg);
        setTimeout(() => navigate(-1), 1500);
      } else {
        toastFail(response?.message || '操作失败，请重试');
      }
    } catch (error) {
      console.error(`${isEditMode ? '更新' : '保存'}错误:`, error);
      toastFail(error.message || '网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TopNavBar 
        title={isEditMode ? '编辑心愿' : '添加心愿'} 
        onLeftClick={() => navigate(-1)}
      />
      <div className="wish-form-container">
        <form onSubmit={handleSubmit} className="wish-form">
          <div className="form-group is-required">
            <label>心愿名称</label>
            <input
              type="text"
              ref={titleRef}
              placeholder="例如：一起去旅行、学习新技能等"
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>心愿描述</label>
            <textarea
              ref={descriptionRef}
              placeholder="详细描述一下这个心愿吧..."
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>目标完成日期</label>
            <input 
              type="date" 
              ref={targetDateRef} 
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>优先级</label>
            <select ref={priorityRef} disabled={isSubmitting}>
              <option value="1">低</option>
              <option value="2">中</option>
              <option value="3">高</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? '更新中...' : '添加中...') 
              : (isEditMode ? '更新心愿' : '保存心愿')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default WishForm;