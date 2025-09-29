import http from '@/utils/request';

const memory = {
  // 查询回忆详情
  detail: (id) => http.get(`/memory/detail/${id}`),

  // 创建回忆
  create: (data) => http.post('/memory/create', data),

  // 更新回忆
  update: (id, data) => http.put(`/memory/update/${id}`, data),

  // 删除回忆
  delete: (id) => http.delete(`/memory/delete/${id}`),

  // 获取回忆列表
  list: (params) => http.get('/memory/list', params),
};

export default memory