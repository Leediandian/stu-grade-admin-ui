/*
 * @Author: diandian
 * @Date: 2022-11-16 00:03:27
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-12-27 13:54:46
 * @FilePath: \stm-grade-admin-ui\src\api\system\student.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询院级列表/班级列表/专业列表
export function searchCommonList ({ }) {
  return request({
    url: '/system/student/searchCommonList',
    method: 'get',
    params: {}
  })
}

// 查询学生列表
export function listStudent (query) {
  return request({
    url: '/system/student/list',
    method: 'get',
    params: query
  })
}



// 查询学生详细
export function getStudent (stuId) {
  return request({
    url: '/system/student/' + stuId,
    method: 'get'
  })
}

// 新增学生
export function addStudent (data) {
  return request({
    url: '/system/student',
    method: 'post',
    data: data
  })
}

// 修改学生
export function updateStudent (data) {
  return request({
    url: '/system/student',
    method: 'put',
    data: data
  })
}

// 删除学生
export function delStudent (stuId) {
  return request({
    url: '/system/student/' + stuId,
    method: 'delete'
  })
}
