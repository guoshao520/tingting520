import http from '@/utils/request';

const photo_category = {
  // 查询照片分类详情
  detail: (id) => http.get(`/photo-category/detail/${id}`),

  // 创建照片分类
  create: (data) => http.post('/photo-category/upload', data),

  // 更新照片分类
  update: (id, data) => http.put(`/photo-category/update/${id}`, data),

  // 删除照片分类
  delete: (id) => http.delete(`/photo-category/delete/${id}`),

  // 批量删除照片分类
  batchDelete: (data) => http.delete(`/photo-category/batchDelete`, data),

  // 获取照片分类列表
  list: (params) => http.get('/photo-category/list', params),
};

export default photo_category