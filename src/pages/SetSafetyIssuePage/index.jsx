import React, { useRef, useState } from 'react';
import './SetSafetyIssuePage.less';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import user from '@/api/user';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { getLoginInfo } from '@/utils/storage';

const SetSafetyIssuePage = () => {
  const navigate = useNavigate(); // 初始化路由导航
  // 表单元素引用
  const questionRef = useRef(null);
  const answerRef = useRef(null);

  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证
    if (!questionRef.current.value) {
      toastMsg('请选择安全问题');
      return;
    }

    const answer = answerRef.current.value.trim();
    if (!answer) {
      toastMsg('请输入问题答案');
      return;
    }

    if (answer.length < 2) {
      toastMsg('答案长度不能少于2个字符');
      return;
    }

    setIsSubmitting(true);

    try {
      const loginInfo = getLoginInfo();
      const username = loginInfo?.user?.username;
      
      const params = {
        username,
        safety_issue: questionRef.current.value + '|' + answer,
      };

      const data = await user.update(params);
      if (data.code === 200) {
        toastSuccess('安全问题设置成功');
        setTimeout(() => {
          navigate('/profile')
        }, 1500)
      } else {
        toastFail(data.message || '设置失败，请重试');
      }
    } catch (error) {
      console.error('设置安全问题错误:', error);
      toastFail(error.message || '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftBack = () => {
    navigate('/set')
  }

  return (
    <div className="security-question-container">
      <TopNavBar title={'设置安全问题'} onBack={leftBack} />
      <div className="security-question-content">
        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group is-required">
            <label>选择安全问题</label>
            <select 
              ref={questionRef} 
              disabled={isSubmitting}
              defaultValue=""
            >
              <option value="" disabled>请选择一个安全问题</option>
              <option value="mother_name">您母亲的姓名是？</option>
              <option value="father_name">您父亲的姓名是？</option>
              <option value="first_school">您的第一所学校名称是？</option>
              <option value="pet_name">您的宠物名字是？</option>
              <option value="birth_place">您的出生地是？</option>
              <option value="spouse_birthday">您配偶的生日是？</option>
              <option value="childhood_nickname">您的童年昵称是？</option>
              <option value="first_job">您的第一份工作是什么？</option>
              <option value="favorite_teacher">您最喜欢的老师姓名是？</option>
              <option value="favorite_book">您最喜欢的一本书是？</option>
            </select>
          </div>

          <div className="form-group is-required">
            <label>问题答案</label>
            <input
              type="text"
              ref={answerRef}
              placeholder="请输入答案"
              disabled={isSubmitting}
              maxLength={50}
            />
            <div className="form-hint">请牢记您的答案，用于找回密码等场景</div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存安全问题'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetSafetyIssuePage;