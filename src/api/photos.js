import http from '@/utils/request';

const photos = {
  // 查询照片详情
  detail: (id) => http.get(`/photo/detail/${id}`),

  // 创建照片
  create: (data) => http.post('/photo/upload', data),

  // 更新照片
  update: (id, data) => http.put(`/photo/update/${id}`, data),

  // 删除照片
  delete: (id) => http.delete(`/photo/delete/${id}`),

  // 获取照片列表
  list: (params) => http.get('/photo/list', params),
};

export default photos