import React, { useRef, useState } from 'react';
import './AddDatePage.css';
import TopNavBar from '@/components/TopNavBar';
import importantDate from '@/api/importantDate';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

const AddDatePage = () => {
  // 表单元素引用
  const titleRef = useRef(null);
  const dayDateRef = useRef(null);
  const dayTypeRef = useRef(null);
  const remindBeforeDaysRef = useRef(null);

  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 简单验证
    if (!titleRef.current.value.trim()) {
      toastMsg('请输入重要日子名称');
      return;
    }

    if (!dayDateRef.current.value) {
      toastMsg('请选择日期');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        couple_id: 1, // 根据实际情况获取
        title: titleRef.current.value.trim(),
        day_date: dayDateRef.current.value,
        day_type: dayTypeRef.current.value,
        remind_before_days: parseInt(remindBeforeDaysRef.current.value) || 7
      };

      const data = await importantDate.create(params);
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

  return (
    <div>
      <TopNavBar title={'添加重要日子'} />
      <div className="add-date-container">
        <form onSubmit={handleSubmit} className="date-form">
          <div className="form-group">
            <label>重要日子名称 *</label>
            <input
              type="text"
              ref={titleRef}
              placeholder="例如：纪念日、生日、相遇日等"
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>日期 *</label>
            <input 
              type="date" 
              ref={dayDateRef} 
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>类型</label>
            <select ref={dayTypeRef} disabled={isSubmitting}>
              <option value="custom">自定义</option>
              <option value="birthday">生日</option>
              <option value="anniversary">纪念日</option>
            </select>
          </div>

          <div className="form-group">
            <label>提前提醒天数</label>
            <select ref={remindBeforeDaysRef} disabled={isSubmitting}>
              <option value="0">不提醒</option>
              <option value="1">提前1天</option>
              <option value="3">提前3天</option>
              <option value="7" selected>提前7天</option>
              <option value="15">提前15天</option>
              <option value="30">提前30天</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '添加中...' : '保存日子'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDatePage;