/*
 * @Author: diandian
 * @Date: 2022-11-22 20:17:00
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-11-24 09:35:29
 * @FilePath: \stm-grade-admin-ui\src\api\system\department.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询院系列表 所有
export function allListDepartment (query) {
  return request({
    url: '/system/department/allList',
    method: 'get',
    params: query
  })
}
// 查询院系列表 所有 包括下面的专业
export function allListDepartmentChildren (query) {
  return request({
    url: '/system/department/allListChildren',
    method: 'get',
    params: query
  })
}
// 查询院系列表 分页
export function listDepartment (query) {
  return request({
    url: '/system/department/list',
    method: 'get',
    params: query
  })
}

// 查询院系详细
export function getDepartment (departmentId) {
  return request({
    url: '/system/department/' + departmentId,
    method: 'get'
  })
}

// 新增院系
export function addDepartment (data) {
  return request({
    url: '/system/department',
    method: 'post',
    data: data
  })
}

// 修改院系
export function updateDepartment (data) {
  return request({
    url: '/system/department',
    method: 'put',
    data: data
  })
}

// 删除院系
export function delDepartment (departmentId) {
  return request({
    url: '/system/department/' + departmentId,
    method: 'delete'
  })
}
