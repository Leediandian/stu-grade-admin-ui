/*
 * @Author: diandian
 * @Date: 2022-11-28 15:14:43
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-12-09 16:35:44
 * @FilePath: \stm-grade-admin-ui\src\api\system\exam.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询课程考试安排列表
export function listExam (query) {
  return request({
    url: '/system/exam/list',
    method: 'get',
    params: query
  })
}

// 查询课程考试安排列表 不分页 
export function allList () {
  return request({
    url: '/system/exam/allList',
    method: 'get',
  })
}

// 查询课程考试安排详细
export function getExam (examId) {
  return request({
    url: '/system/exam/' + examId,
    method: 'get'
  })
}

// 新增课程考试安排
export function addExam (data) {
  return request({
    url: '/system/exam',
    method: 'post',
    data: data
  })
}

// 修改课程考试安排
export function updateExam (data) {
  return request({
    url: '/system/exam',
    method: 'put',
    data: data
  })
}

// 删除课程考试安排
export function delExam (examId) {
  return request({
    url: '/system/exam/' + examId,
    method: 'delete'
  })
}
