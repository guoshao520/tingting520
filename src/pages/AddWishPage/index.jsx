import React, { useRef, useState } from 'react';
import './AddWishPage.css';  // 保留原有样式
import TopNavBar from '@/components/TopNavBar';
import wish from '@/api/wish';  // 引入心愿相关接口
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

const AddDatePage = () => {
  // 表单元素引用
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const targetDateRef = useRef(null);
  const priorityRef = useRef(null);

  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单（对接心愿接口）
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 简单验证
    if (!titleRef.current.value.trim()) {
      toastMsg('请输入心愿名称');
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建心愿参数（对应wishlist模型字段）
      const params = {
        couple_id: 1,  // 实际项目中应从登录状态获取
        title: titleRef.current.value.trim(),
        description: descriptionRef.current.value.trim() || '',
        target_date: targetDateRef.current.value || null,
        priority: parseInt(priorityRef.current.value) || 1
      };

      // 调用心愿新增接口
      const data = await wish.create(params);
      
      if (data.code === 200) {
        toastSuccess('保存成功');
        // 重置表单
        titleRef.current.value = '';
        descriptionRef.current.value = '';
        targetDateRef.current.value = '';
        priorityRef.current.value = '1';
      } else {
        toastFail(data.message);
      }
    } catch (error) {
      console.error('保存错误:', error);
      toastFail(error.message || '网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TopNavBar title={'添加心愿'} />
      <div className="add-date-container">
        <form onSubmit={handleSubmit} className="date-form">
          <div className="form-group">
            <label>心愿名称 *</label>
            <input
              type="text"
              ref={titleRef}
              placeholder="例如：一起去旅行、学习新技能等"
              disabled={isSubmitting}
              maxLength={200}  // 对应模型中的200字符限制
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
            {isSubmitting ? '添加中...' : '保存心愿'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDatePage;