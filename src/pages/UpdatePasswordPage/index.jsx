import React, { useRef, useState, useEffect } from 'react';
import './UpdatePasswordPage.less';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '@/components/TopNavBar';
import user from '@/api/user';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { FaKey } from 'react-icons/fa'; // 引入修改密码相关图标

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  // 表单状态：用户名、旧密码、新密码
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单ref：用于获取输入值和清空
  const oldPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // 组件卸载前清空输入（优化安全性）
  useEffect(() => {
    return () => {
      if (oldPasswordRef.current) oldPasswordRef.current.value = '';
      if (newPasswordRef.current) newPasswordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    };
  }, []);

  // 核心：修改密码（对接changePassword接口）
  const handleChangePassword = async (e) => {
    e.preventDefault();
    // 获取表单值并去重
    const oldPassword = oldPasswordRef.current?.value?.trim();
    const newPassword = newPasswordRef.current?.value?.trim();
    const confirmPassword = confirmPasswordRef.current?.value?.trim();
    if (!oldPassword) {
      toastMsg('请输入旧密码');
      return;
    }
    if (!newPassword) {
      toastMsg('请输入新密码');
      return;
    }
    if (!confirmPassword) {
      toastMsg('请确认新密码');
      return;
    }

    // 2. 密码规则校验（与接口逻辑对齐）
    if (newPassword.length < 6) {
      toastMsg('新密码长度不能少于6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastMsg('两次输入的新密码不一致');
      return;
    }
    // 提前校验新旧密码是否相同（减少接口请求）
    if (newPassword === oldPassword) {
      toastMsg('新密码不能和旧密码重复');
      return;
    }

    // 3. 提交接口
    setIsSubmitting(true);
    try {
      const data = await user.updatePassword({
        password: oldPassword, // 旧密码（接口参数名：password）
        new_password: newPassword, // 新密码
      });

      // 4. 接口响应处理
      if (data.code === 200) {
        toastSuccess('密码修改成功，正在重新登录');
        // 延迟跳转登录页（给用户看提示）
        setTimeout(() => {
          navigate('/login');
          // 跳转前清空所有输入（安全优化）
          if (oldPasswordRef.current) oldPasswordRef.current.value = '';
          if (newPasswordRef.current) newPasswordRef.current.value = '';
          if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
        }, 1500);
      } else {
        // 接口返回错误（如旧密码错误、用户不存在）
        toastFail(data.message || '密码修改失败');
      }
    } catch (error) {
      // 网络错误处理
      console.error('修改密码接口异常:', error);
      toastFail(error.response?.data?.message || '网络错误，请稍后重试');
    } finally {
      // 无论成功失败，都结束提交状态
      setIsSubmitting(false);
    }
  };

  // 返回登录页
  const handleGoBack = () => {
    navigate('/login');
  };

  return (
    <div className="password-container">
      {/* 顶部导航栏：修改标题为“修改密码”，增加返回按钮 */}
      <TopNavBar
        title="修改密码"
        leftIcon={<FaKey size={16} />} // 密码相关图标
        onLeftClick={handleGoBack} // 左侧点击返回登录页
      />

      {/* 表单容器：保持原有样式结构 */}
      <div className="password-content">
        <form
          onSubmit={handleChangePassword}
          className="change-password-form"
          autoComplete="new-password" // 避免浏览器自动填充旧密码
        >
          {/* 旧密码输入项（新增） */}
          <div className="form-group is-required">
            <label className="form-label">旧密码</label>
            <input
              type="password"
              ref={oldPasswordRef}
              placeholder="请输入当前使用的旧密码"
              disabled={isSubmitting}
              maxLength={20}
              autoComplete="current-password" // 提示浏览器填充旧密码（优化体验）
              className="form-input"
              required
            />
          </div>

          {/* 新密码输入项（保留原有） */}
          <div className="form-group is-required">
            <label className="form-label">新密码</label>
            <input
              type="password"
              ref={newPasswordRef}
              placeholder="请输入新密码（至少6位，建议包含字母和数字）"
              disabled={isSubmitting}
              maxLength={20}
              autoComplete="new-password" // 关键：避免被识别为旧密码
              className="form-input"
              required
            />
          </div>

          {/* 确认新密码输入项（保留原有） */}
          <div className="form-group is-required">
            <label className="form-label">确认新密码</label>
            <input
              type="password"
              ref={confirmPasswordRef}
              placeholder="请再次输入新密码"
              disabled={isSubmitting}
              maxLength={20}
              autoComplete="new-password"
              className="form-input"
              required
            />
          </div>

          {/* 提交按钮：保持原有样式，调整文案 */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <span>处理中...</span> : '确认修改密码'}
          </button>

          {/* 辅助提示：新增安全提示（可选） */}
          <div className="password-tips">
            <p>• 新密码建议包含字母、数字和特殊符号，提高安全性</p>
            <p>• 请勿使用与其他平台相同的密码，避免批量泄露风险</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
