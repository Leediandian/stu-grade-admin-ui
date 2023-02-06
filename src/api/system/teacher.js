/*
 * @Author: diandian
 * @Date: 2022-11-16 00:03:27
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-11-28 17:00:49
 * @FilePath: \stm-grade-admin-ui\src\api\system\teacher.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询教师列表 全部
export function allListTeacher (query) {
  return request({
    url: '/system/teacher/allList',
    method: 'get',
    params: query
  })
}


// 查询教师列表 分页
export function listTeacher (query) {
  return request({
    url: '/system/teacher/list',
    method: 'get',
    params: query
  })
}

// 查询教师详细
export function getTeacher (teaId) {
  return request({
    url: '/system/teacher/' + teaId,
    method: 'get'
  })
}

// 新增教师
export function addTeacher (data) {
  return request({
    url: '/system/teacher',
    method: 'post',
    data: data
  })
}

// 修改教师
export function updateTeacher (data) {
  return request({
    url: '/system/teacher',
    method: 'put',
    data: data
  })
}

// 删除教师
export function delTeacher (teaId) {
  return request({
    url: '/system/teacher/' + teaId,
    method: 'delete'
  })
}
