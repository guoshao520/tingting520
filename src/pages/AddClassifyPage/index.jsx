import React, { useRef, useState } from 'react';
import './AddClassifyPage.less';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
// 假设你有对应的分类相关接口，这里替换为实际的接口导入
import classify from '@/api/classify'; 
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

const AddClassifyPage = () => {
  const navigate = useNavigate(); 
  // 分类名称输入框引用
  const classifyNameRef = useRef(null);
  // 排序值输入框引用
  const sortValueRef = useRef(null);

  // 状态管理：提交中状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 简单验证
    if (!classifyNameRef.current.value.trim()) {
      toastMsg('请输入分类名称');
      return;
    }
    if (!sortValueRef.current.value.trim()) {
      toastMsg('请输入排序值');
      return;
    }
    // 验证排序值为数字
    if (isNaN(Number(sortValueRef.current.value))) {
      toastMsg('排序值请输入数字');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        classify_name: classifyNameRef.current.value.trim(),
        sort_value: parseInt(sortValueRef.current.value)
      };

      const data = await classify.create(params);
      if (data.code === 200) {
        toastSuccess('添加分类成功');
        setTimeout(() => {
          navigate(-1)
        }, 1500)
      } else {
        toastFail(data.message);
      }
    } catch (error) {
      console.error('添加分类错误:', error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-classify-container">
      <TopNavBar title={'添加分类'} />
      <div className="add-classify-content">
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
            {isSubmitting ? '添加中...' : '添加分类'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClassifyPage;