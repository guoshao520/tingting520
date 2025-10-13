import axios from 'axios';
import { toastMsg } from '@/utils/toast';
// 🔴 导入App.js暴露的全局导航函数
import { navigate } from '@/router';

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 1. 存储所有pending请求（用于401批量取消）
let pendingRequests = new Map();
// 2. 跳转锁（无刷新跳转后变量不重置）
export let isRedirectingToLogin = false;

// 生成唯一请求标识（避免误取消）
const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 已在跳转中，直接取消当前请求
    if (isRedirectingToLogin) {
      const cancel = axios.CancelToken.source().cancel;
      cancel('已触发401跳转，取消当前请求');
      return Promise.resolve(new Error('已触发401跳转，取消当前请求'));
    }

    // 免Token请求列表（登录页接口不需要加Token）
    const noTokenUrls = ['/api/v1/user/login', '/api/v1/user/register', '/api/v1/user/send-code'];
    const isNoTokenUrl = noTokenUrls.some(url => config.url.includes(url));

    // 非免Token请求，添加Token
    if (!isNoTokenUrl) {
      const token = localStorage.getItem('loveToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 记录pending请求（用于后续取消）
    const requestKey = generateRequestKey(config);
    const cancelToken = new axios.CancelToken(cancel => {
      pendingRequests.set(requestKey, cancel);
    });
    config.cancelToken = cancelToken;

    return config;
  },
  (error) => {
    const requestKey = generateRequestKey(error.config || {});
    pendingRequests.delete(requestKey);
    return Promise.resolve(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);

    const { data, status } = response;
    if (status === 200 && data.code === 200) {
      return Promise.resolve(data);
    }
    return handleResponseError(data, response);
  },
  (error) => {
    const requestKey = generateRequestKey(error.config || {});
    pendingRequests.delete(requestKey);

    // 排除主动取消的请求，不触发错误提示
    if (axios.isCancel(error)) {
      console.log('请求已主动取消:', error.message);
      return Promise.resolve(error);
    }

    return handleNetworkError(error);
  }
);

// 🔴 核心：401统一处理（用路由跳转替代页面刷新）
const handle401 = (msg = '认证失败，请重新登录') => {
  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;

  // 1. 提示用户
  toastMsg(msg);

  // 2. 批量取消所有pending请求（断绝后续401）
  pendingRequests.forEach((cancel, key) => {
    cancel('401认证失败，批量取消请求');
    pendingRequests.delete(key);
  });

  // 3. 清除Token
  localStorage.removeItem('loveToken');

  // 4. 🔴 路由无刷新跳转（replace: 避免回退循环）
  setTimeout(() => {
    navigate('/login', { replace: true });
    window.location.reload();
  }, 300); // 短延迟确保提示可见
};

// 处理响应错误（后端业务错误）
const handleResponseError = (data, response) => {
  const { code, message: msg } = data;
  switch (code) {
    case 401:
      handle401(msg);
      break;
    case 412:
      toastMsg(msg || '请求参数不完整');
      break;
    case 403:
      toastMsg(msg || '您没有权限执行此操作');
      break;
    case 500:
      toastMsg(msg || '系统异常，请稍后重试');
      break;
    default:
      toastMsg(msg || '请求失败');
  }
  return Promise.resolve({ code, message: msg, data: data.data });
};

// 处理网络错误（状态码错误、断网等）
const handleNetworkError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
        handle401(data?.message);
        break;
      case 403:
        toastMsg('您没有权限执行此操作');
        break;
      case 404:
        toastMsg('请求的资源不存在');
        break;
      case 500:
        toastMsg('服务器内部错误');
        break;
      default:
        toastMsg(`请求错误: ${status}`);
    }
    return Promise.resolve({
      code: status,
      message: data?.message || '请求失败',
      data: data?.data
    });
  } else if (error.request) {
    toastMsg('网络异常，请检查网络连接');
    return Promise.resolve({
      code: -1,
      message: '网络异常',
      data: null
    });
  } else {
    return Promise.resolve({
      code: -2,
      message: error.message,
      data: null
    });
  }
};

// 通用请求方法（不变）
const createRequestMethod = (method) => (url, data = {}, config = {}) => {
  const requestConfig = { url, method, ...config };
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    requestConfig.data = data;
  } else {
    requestConfig.params = data;
  }
  return request(requestConfig);
};

// 具体请求方法（不变）
export const http = {
  get: createRequestMethod('get'),
  post: createRequestMethod('post'),
  put: createRequestMethod('put'),
  patch: createRequestMethod('patch'),
  delete: createRequestMethod('delete'),
  request,
};

// 无接口模式（不变）
export const noInterfaceHttp = {
  get: () => Promise.resolve({ code: 200, data: [] }),
  post: () => Promise.resolve({ code: 200, data: [] }),
  put: () => Promise.resolve({ code: 200, data: [] }),
  patch: () => Promise.resolve({ code: 200, data: [] }),
  delete: () => Promise.resolve({ code: 200, data: [] }),
  request,
};

export default http;