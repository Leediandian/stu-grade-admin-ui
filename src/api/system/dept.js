import request from '@/utils/request'

// 查询用户分类列表
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}

// 查询用户分类列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 查询用户分类详细
export function getDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get'
  })
}

// 新增用户分类
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data: data
  })
}

// 修改用户分类
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data: data
  })
}

// 删除用户分类
export function delDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete'
  })
}