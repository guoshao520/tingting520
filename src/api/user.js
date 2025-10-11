import http from '@/utils/request';

const user = {
  // 查询用户详情
  detail: (id) => http.get(`/user/detail/${id}`),

  // 更新用户信息
  update: (data) => http.put(`/user/update`, data),

  // 获取用户列表
  login: (data) => http.post('/user/login', data),

  // 验证安全问题
  verifySafetyIssue: (data) => http.post('/user/verifySafetyIssue', data),

  // 重置密码
  resetPassword: (data) => http.post('/user/resetPassword', data),

  // 修改密码
  updatePassword: (data) => http.post('/user/updatePassword', data),
};

export default user