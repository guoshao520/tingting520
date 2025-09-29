import http from '@/utils/request';

const importantDay = {
  // 查询重要日子详情
  detail: (id) => http.get(`/important-day/detail/${id}`),

  // 创建重要日子
  create: (data) => http.post('/important-day/create', data),

  // 更新重要日子
  update: (id, data) => http.put(`/important-day/update/${id}`, data),

  // 删除重要日子
  delete: (id) => http.delete(`/important-day/delete/${id}`),

  // 获取重要日子列表
  list: (params) => http.get('/important-day/list', params),
};

export default importantDay