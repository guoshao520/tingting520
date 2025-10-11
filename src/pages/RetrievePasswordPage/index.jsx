import React, { useRef, useState, useEffect } from 'react';
import './RetrievePasswordPage.less';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import user from '@/api/user';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';

const RetrievePasswordPage = () => {
  const navigate = useNavigate(); // 初始化路由导航
  // 核心状态：存储账号（跨步骤使用）
  const [account, setAccount] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单ref（仅当前步骤使用）
  const questionRef = useRef(null);
  const answerRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // 步骤切换时强制清空所有输入框（关键修复）
  useEffect(() => {
    // 清空当前步骤不相关的输入框
    if (step === 1) {
      if (newPasswordRef.current) newPasswordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    } else if (step === 2) {
      if (questionRef.current) questionRef.current.value = '';
      if (answerRef.current) answerRef.current.value = '';
    }
  }, [step]);

  // 第一步：验证账号和安全问题
  const handleVerify = async (e) => {
    e.preventDefault();
    const question = questionRef.current?.value;
    const answer = answerRef.current?.value.trim();

    if (!account) { toastMsg('请输入账号'); return; }
    if (!question) { toastMsg('请选择安全问题'); return; }
    if (!answer) { toastMsg('请输入安全问题答案'); return; }

    setIsSubmitting(true);
    try {
      const data = await user.verifySafetyIssue({
        username: account,
        safety_issue: question + '|' + answer,
      });
      
      if (data.code === 200) {
        toastSuccess('验证通过');
        setStep(2);
      } else {
        toastFail(data.message || '验证失败');
      }
    } catch (error) {
      console.error('验证失败:', error);
      toastFail('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 第二步：重置密码
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newPassword = newPasswordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!newPassword) { toastMsg('请输入新密码'); return; }
    if (newPassword.length < 6) { toastMsg('密码长度不能少于6位'); return; }
    if (newPassword !== confirmPassword) { toastMsg('两次密码不一致'); return; }

    setIsSubmitting(true);
    try {
      const data = await user.resetPassword({
        username: account,
        new_password: newPassword
      });
      
      if (data.code === 200) {
        toastSuccess('重置成功，正在跳转登录');
        setTimeout(() => {
          navigate('/login');
        }, 1500)
      } else {
        toastFail(data.message || '重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      toastFail('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="password-container">
      <TopNavBar title={step === 1 ? '找回密码' : '重置密码'} />
      <div className="password-content">
        {/* 第一步表单：用独立form标签隔离 */}
        {step === 1 && (
          <form 
            onSubmit={handleVerify} 
            className="verify-form"
            autoComplete="off"
          >
            <div className="form-group">
              <label>账号</label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value.trim())}
                placeholder="请输入您的账号"
                disabled={isSubmitting}
                maxLength={50}
                autoComplete="one-time-code"
                name="verify-account"
              />
            </div>

            <div className="form-group">
              <label>安全问题</label>
              <select
                ref={questionRef}
                disabled={isSubmitting}
                defaultValue=""
                name="security-question"
                autoComplete="off"
              >
                <option value="" disabled>请选择安全问题</option>
                <option value="mother_name">您母亲的姓名是？</option>
                <option value="father_name">您父亲的姓名是？</option>
                <option value="first_school">您的第一所学校名称是？</option>
                <option value="pet_name">您的宠物名字是？</option>
                <option value="birth_place">您的出生地是？</option>
                <option value="childhood_nickname">您的童年昵称是？</option>
              </select>
            </div>

            <div className="form-group">
              <label>安全问题答案</label>
              <input
                type="text"
                ref={answerRef}
                placeholder="请输入安全问题的答案"
                disabled={isSubmitting}
                maxLength={50}
                autoComplete="off"
                name="security-answer"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '验证中...' : '下一步'}
            </button>
          </form>
        )}

        {/* 第二步表单：完全独立的form标签，避免与第一步共享上下文 */}
        {step === 2 && (
          <form 
            onSubmit={handleResetPassword} 
            className="reset-form"
            autoComplete="new-password"
          >
            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                ref={newPasswordRef}
                placeholder="请输入新密码（至少6位）"
                disabled={isSubmitting}
                maxLength={20}
                // 关键：避免被识别为旧密码
                autoComplete="new-password"
                name="new-password"
                // 额外防填充：动态生成name（可选）
                // name={`new-password-${Date.now()}`}
              />
            </div>

            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                ref={confirmPasswordRef}
                placeholder="请再次输入新密码"
                disabled={isSubmitting}
                maxLength={20}
                autoComplete="new-password"
                name="confirm-new-password"
              />
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="back-btn"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                上一步
              </button>
              <button
                type="submit"
                className="submit-btn submit-new-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '重置中...' : '确认重置'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RetrievePasswordPage;