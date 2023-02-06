import request from '@/utils/request'

// 查询课程考试安排明细列表
export function listDetail(query) {
  return request({
    url: '/system/detail/list',
    method: 'get',
    params: query
  })
}

// 查询课程考试安排明细详细
export function getDetail(examDetailId) {
  return request({
    url: '/system/detail/' + examDetailId,
    method: 'get'
  })
}

// 新增课程考试安排明细
export function addDetail(data) {
  return request({
    url: '/system/detail',
    method: 'post',
    data: data
  })
}

// 修改课程考试安排明细
export function updateDetail(data) {
  return request({
    url: '/system/detail',
    method: 'put',
    data: data
  })
}

// 删除课程考试安排明细
export function delDetail(examDetailId) {
  return request({
    url: '/system/detail/' + examDetailId,
    method: 'delete'
  })
}
