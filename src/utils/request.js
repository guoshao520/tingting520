import axios from 'axios';
import { toastMsg } from '@/utils/toast'

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做统一处理
    const { data, status } = response;

    if (status === 200 && data.code === 200) {
      return Promise.resolve(data);
    }

    // 处理非常规成功状态
    return handleResponseError(data, response);
  },
  (error) => {
    // 对响应错误做统一处理
    return handleNetworkError(error);
  }
);

// 处理响应错误
const handleResponseError = (data, response) => {
  const { code, message: msg } = data;

  switch (code) {
    case 401:
      // 认证失败
      toastMsg(msg || '认证失败，请重新登录')
      // 清除 token 并跳转到登录页
      localStorage.removeItem('token');
      // window.location.href = '/login';
      break;

    case 412:
      // 缺少查询参数
      toastMsg(msg || '请求参数不完整')
      break;

    case 403:
      // 无权限
      toastMsg(msg || '您没有权限执行此操作')
      break;

    case 500:
      // 系统异常
      toastMsg(msg || '系统异常，请稍后重试')
      break;

    default:
      toastMsg(msg || '请求失败')
  }

  return Promise.reject({ code, message: msg, data: data.data });
};

// 处理网络错误
const handleNetworkError = (error) => {
  if (error.response) {
    // 服务器返回了错误状态码
    const { status, data } = error.response;

    switch (status) {
      case 401:
        toastMsg('认证失败，请重新登录')
        localStorage.removeItem('token');
        // window.location.href = '/login';
        break;

      case 403:
        toastMsg('您没有权限执行此操作')
        break;

      case 404:
        toastMsg('请求的资源不存在')
        break;

      case 500:
        toastMsg('服务器内部错误')
        break;

      default:
        toastMsg(`请求错误: ${status}`)
    }

    return Promise.reject({
      code: status,
      message: data?.message || '请求失败',
      data: data?.data
    });
  } else if (error.request) {
    // 请求已发出但没有收到响应
    toastMsg('网络异常，请检查网络连接')
    return Promise.reject({
      code: -1,
      message: '网络异常',
      data: null
    });
  } else {
    // 请求配置错误
    toastMsg('请求配置错误')
    return Promise.reject({
      code: -2,
      message: error.message,
      data: null
    });
  }
};

// 通用请求方法
const createRequestMethod = (method) => (url, data = {}, config = {}) => {
  const upperMethod = method.toUpperCase();

  const requestConfig = {
    url,
    method,
    ...config
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
    requestConfig.data = data;
  } else {
    requestConfig.params = data;
  }

  return request(requestConfig);
};

// 具体请求方法
export const http = {
  get: createRequestMethod('get'),
  post: createRequestMethod('post'),
  put: createRequestMethod('put'),
  patch: createRequestMethod('patch'),
  delete: createRequestMethod('delete'),
  request, // 原始 axios 实例，用于特殊需求
};

// 无接口模式
export const noInterfaceHttp = {
  get: () => Promise.resolve({ code: 200, data: [] }),
  post: () => Promise.resolve({ code: 200, data: [] }),
  put: () => Promise.resolve({ code: 200, data: [] }),
  patch: () => Promise.resolve({ code: 200, data: [] }),
  delete: () => Promise.resolve({ code: 200, data: [] }),
  request, // 原始 axios 实例，用于特殊需求
};

export default noInterfaceHttp;