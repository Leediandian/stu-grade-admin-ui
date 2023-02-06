/*
 * @Author: diandian
 * @Date: 2022-11-28 15:14:43
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-11-28 17:28:17
 * @FilePath: \stm-grade-admin-ui\src\api\system\course.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询所有课程列表
export function allListCourse (query) {
  return request({
    url: '/system/course/allList',
    method: 'get',
    params: query
  })
}

// 查询分页课程列表
export function listCourse (query) {
  return request({
    url: '/system/course/list',
    method: 'get',
    params: query
  })
}

// 查询课程详细
export function getCourse (courseId) {
  return request({
    url: '/system/course/' + courseId,
    method: 'get'
  })
}

// 新增课程
export function addCourse (data) {
  return request({
    url: '/system/course',
    method: 'post',
    data: data
  })
}

// 修改课程
export function updateCourse (data) {
  return request({
    url: '/system/course',
    method: 'put',
    data: data
  })
}

// 删除课程
export function delCourse (courseId) {
  return request({
    url: '/system/course/' + courseId,
    method: 'delete'
  })
}
