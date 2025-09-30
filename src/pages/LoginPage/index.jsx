import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaHeart } from 'react-icons/fa';
import './LoginPage.less';
import { toastMsg, toastSuccess, toastFail } from '@/utils/toast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 模拟登录请求
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('登录数据:', formData);
      toastSuccess('登录成功！');
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setIsLoading(false);
    }
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
                animationDuration: `${5 + Math.random() * 5}s`
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

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>还没有账户？ <a href="#register" className="register-link">立即注册</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;