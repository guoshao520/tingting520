import http from '@/utils/request';

const importantDay = {
  // 查询照片分类详情
  detail: (id) => http.get(`/classify/detail/${id}`),

  // 创建照片分类
  create: (data) => http.post('/classify/create', data),

  // 更新照片分类
  update: (id, data) => http.put(`/classify/update/${id}`, data),

  // 删除照片分类
  delete: (id) => http.delete(`/classify/delete/${id}`),

  // 获取照片分类列表
  list: (params) => http.get('/classify/list', params),
};

export default importantDay