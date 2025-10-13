import React, { useRef, useState, useEffect } from 'react';
import './DateForm.less';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import importantDate from '@/api/importantDate';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const DateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 表单元素引用
  const titleRef = useRef(null);
  const dayDateRef = useRef(null);

  // 状态管理
  const [dayType, setDayType] = useState('custom');
  const [remindBeforeDays, setRemindBeforeDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDateId, setCurrentDateId] = useState(null);
  const { couple } = getLoginInfo() || {};

  // 解析URL参数判断是否为编辑模式
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dateId = searchParams.get('id');
    if (dateId) {
      setIsEditMode(true);
      setCurrentDateId(dateId);
      getDateDetail(dateId);
    }
  }, [location.search]);

  // 获取重要日子详情（编辑模式）
  const getDateDetail = async (dateId) => {
    try {
      const { data } = await importantDate.detail(dateId);
      if (data) {
        // 填充表单数据
        titleRef.current.value = data.title || '';
        dayDateRef.current.value = data.day_date || '';
        setDayType(data.day_type || 'custom');
        setRemindBeforeDays(data.remind_before_days?.toString() || '7');
      }
    } catch (error) {
      console.error('获取重要日子详情失败:', error);
      toastFail('加载数据失败，请重试');
      navigate(-1);
    }
  };

  // 提交表单（新增/编辑通用）
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证
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
        couple_id: couple?.id,
        title: titleRef.current.value.trim(),
        day_date: dayDateRef.current.value,
        day_type: dayType,
        remind_before_days: parseInt(remindBeforeDays) || 7
      };

      let response;
      if (isEditMode && currentDateId) {
        // 编辑模式：调用更新接口
        response = await importantDate.update(currentDateId, params);
      } else {
        // 新增模式：调用创建接口
        response = await importantDate.create(params);
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
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="date-form-container">
      <TopNavBar 
        title={isEditMode ? '编辑重要日子' : '添加重要日子'} 
        onLeftClick={() => navigate(-1)}
      />
      <div className="date-form-content">
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

          <div className="form-group">
            <label>类型</label>
            <select 
              value={dayType}
              onChange={(e) => setDayType(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="custom">自定义</option>
              <option value="birthday">生日</option>
              <option value="anniversary">纪念日</option>
            </select>
          </div>

          <div className="form-group">
            <label>提前提醒天数</label>
            <select 
              value={remindBeforeDays}
              onChange={(e) => setRemindBeforeDays(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="0">不提醒</option>
              <option value="1">提前1天</option>
              <option value="3">提前3天</option>
              <option value="7">提前7天</option>
              <option value="15">提前15天</option>
              <option value="30">提前30天</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? '更新中...' : '添加中...') 
              : (isEditMode ? '更新日子' : '保存日子')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default DateForm;