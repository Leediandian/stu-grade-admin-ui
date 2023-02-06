import request from '@/utils/request'

// 查询成绩异议处理记录列表
export function listObjection(query) {
  return request({
    url: '/system/objection/list',
    method: 'get',
    params: query
  })
}

// 查询成绩异议处理记录详细
export function getObjection(gradeObjId) {
  return request({
    url: '/system/objection/' + gradeObjId,
    method: 'get'
  })
}

// 新增成绩异议处理记录
export function addObjection(data) {
  return request({
    url: '/system/objection',
    method: 'post',
    data: data
  })
}

// 修改成绩异议处理记录
export function updateObjection(data) {
  return request({
    url: '/system/objection',
    method: 'put',
    data: data
  })
}

// 删除成绩异议处理记录
export function delObjection(gradeObjId) {
  return request({
    url: '/system/objection/' + gradeObjId,
    method: 'delete'
  })
}
