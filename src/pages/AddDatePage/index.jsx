import React, { useRef, useState } from 'react';
import './AddDatePage.less';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import importantDate from '@/api/importantDate';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'
import { getLoginInfo } from '@/utils/storage'

const AddDatePage = () => {
  const navigate = useNavigate(); 
  // 表单元素引用（保留非select的ref，select改用state控制）
  const titleRef = useRef(null);
  const dayDateRef = useRef(null);

  // 🔴 关键修改：用state管理select的选中值，替代option的selected
  const [dayType, setDayType] = useState('custom'); // 类型默认值：custom
  const [remindBeforeDays, setRemindBeforeDays] = useState('7'); // 提醒天数默认值：7（对应原selected）

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
      const loginInfo = getLoginInfo()
      const couple_id = loginInfo?.couple?.id
      const params = {
        couple_id,
        title: titleRef.current.value.trim(),
        day_date: dayDateRef.current.value,
        day_type: dayType, // 🔴 改用state值
        remind_before_days: parseInt(remindBeforeDays) || 7 // 🔴 改用state值
      };

      const data = await importantDate.create(params);
      if (data.code === 200) {
        toastSuccess('保存成功');
        setTimeout(() => {
          navigate(-1)
        }, 1500)
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
    <div className="add-date-container">
      <TopNavBar title={'添加重要日子'} />
      <div className="add-date-content">
        <form onSubmit={handleSubmit} className="date-form">
          <div className="form-group is-required">
            <label>重要日子名称</label>
            <input
              type="text"
              ref={titleRef}
              placeholder="例如：纪念日、生日、相遇日等"
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          <div className="form-group is-required">
            <label>日期</label>
            <input 
              type="date" 
              ref={dayDateRef} 
              disabled={isSubmitting}
            />
          </div>

          {/* 🔴 类型select：用value+onChange控制，删除option的selected */}
          <div className="form-group">
            <label>类型</label>
            <select 
              value={dayType} // 绑定state值
              onChange={(e) => setDayType(e.target.value)} // 监听变化更新state
              disabled={isSubmitting}
            >
              <option value="custom">自定义</option>
              <option value="birthday">生日</option>
              <option value="anniversary">纪念日</option>
            </select>
          </div>

          {/* 🔴 提醒天数select：用value+onChange控制，删除option的selected */}
          <div className="form-group">
            <label>提前提醒天数</label>
            <select 
              value={remindBeforeDays} // 绑定state值（默认7）
              onChange={(e) => setRemindBeforeDays(e.target.value)} // 监听变化更新state
              disabled={isSubmitting}
            >
              <option value="0">不提醒</option>
              <option value="1">提前1天</option>
              <option value="3">提前3天</option>
              <option value="7">提前7天</option> {/* 无需selected，state默认值控制 */}
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