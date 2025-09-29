import http from '@/utils/request';

const wish = {
  // 查询心愿详情
  detail: (id) => http.get(`/wishlist/detail/${id}`),

  // 创建心愿
  create: (data) => http.post('/wishlist/create', data),

  // 更新心愿
  update: (id, data) => http.put(`/wishlist/update/${id}`, data),

  // 删除心愿
  delete: (id) => http.delete(`/wishlist/delete/${id}`),

  // 更新状态
  complete: (id, data) => http.put(`/wishlist/complete/${id}`, data),

  // 获取心愿列表
  list: (params) => http.get('/wishlist/list', params),
};

export default wish