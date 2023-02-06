/*
 * @Author: diandian
 * @Date: 2022-11-28 15:14:43
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-02-05 18:42:56
 * @FilePath: \stm-grade-admin-ui\src\api\system\grade.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询全部课程明细信息列表 不分頁
export function allListGrade (query) {
  return request({
    url: '/system/grade/allList',
    method: 'get',
    params: query
  })
}

// 查询课程明细信息列表
export function listGrade (query) {
  return request({
    url: '/system/grade/list',
    method: 'get',
    params: query
  })
}

// 查询课程明细信息详细
export function getGrade (gradeId) {
  return request({
    url: '/system/grade/' + gradeId,
    method: 'get'
  })
}

// 新增课程明细信息
export function addGrade (data) {
  return request({
    url: '/system/grade',
    method: 'post',
    data: data
  })
}

// 新增多个班级课程明细信息
export function addMultipleGrade (data) {
  return request({
    url: '/system/grade/addMultiple',
    method: 'post',
    data: data
  })
}

// 修改课程明细信息
export function updateGrade (data) {
  return request({
    url: '/system/grade',
    method: 'put',
    data: data
  })
}

// 删除课程明细信息
export function delGrade (gradeId) {
  return request({
    url: '/system/grade/' + gradeId,
    method: 'delete'
  })
}
