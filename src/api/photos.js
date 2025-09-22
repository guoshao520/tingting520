import http from '@/utils/request';

const photos = {
  // 查询配置详情
  detail: (id) => http.get(`/generalconfig/detail/${id}`),

  // 创建配置
  create: (data) => http.post('/generalconfig/create', data),

  // 更新配置
  update: (id, data) => http.put(`/generalconfig/update/${id}`, data),

  // 删除配置
  delete: (id) => http.delete(`/generalconfig/delete/${id}`),

  // 获取配置列表
  list: (params) => http.get('/generalconfig/list', params),
};

export default photos