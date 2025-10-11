// 存储Token到localStorage
export const setToken = (token) => {
  localStorage.setItem('loveToken', token);
};

// 获取Token
export const getToken = () => {
  return localStorage.getItem('loveToken');
};

// 存储LoginInfo到localStorage
export const setLoginInfo = (loginInfo) => {
  localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
};

// 获取LoginInfo
export const getLoginInfo = () => {
  try {
    const data = localStorage.getItem('loginInfo');
    return JSON.parse(data || '{}');
  } catch (error) {
    return {};
  }
};

// 清除缓存（退出登录用）
export const removeLocal = () => {
  localStorage.removeItem('loveToken');
  localStorage.removeItem('loginInfo');
};
