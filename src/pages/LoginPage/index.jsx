import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './LoginPage.less';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast';
import { Dialog } from 'antd-mobile';
import user from '@/api/user';
import { setToken, setLoginInfo } from '@/utils/storage';

const LoginPage = () => {
  const navigate = useNavigate(); // 初始化路由导航
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 简单表单验证
    if (!formData.username?.trim()) {
      return toastMsg('请输入账号');
    }
    if (!formData.password?.trim()) {
      return toastMsg('请输入密码');
    }

    setIsLoading(true);
    try {
      // 调用实际登录接口（假设user.login是接口方法）
      const response = await user.login(formData);

      // 假设接口返回格式：{ code: 200, data: { token, userId, coupleId }, message: '登录成功' }
      if (response.code === 200) {
        // 存储Token到本地（localStorage/sessionStorage）
        setLoginInfo(response.data);
        setToken(response.data?.token);
        toastSuccess('登录成功');
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          const { is_safety_issue } = response.data.user || {};
          if (!is_safety_issue) {
            Dialog.confirm({
              content: '为了方便后续找回密码，是否前往设置安全问题',
              onConfirm: async () => {
                navigate('/set-safety-issue');
              },
              onCancel: async () => {
                navigate('/');
              },
            });
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        console.log('response.message', response.message);
        // 接口返回错误信息（如账号密码错误）
        toastFail(response.message || '登录失败，请重试');
      }
    } catch (error) {
      console.log('error', error);
      // toastFail(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toRetrievePassword = () => {
    navigate('/retrieve-password');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-hearts">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-heart"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <FaHeart className="logo-icon" />
            <h1>甜蜜时光</h1>
          </div>
          <p>记录我们的爱情故事</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="请输入账号"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="login-input"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="login-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <div className="loading-spinner"></div> : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            忘记密码？{' '}
            <a className="bottom-link" onClick={toRetrievePassword}>
              点我找回
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
