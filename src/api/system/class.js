/*
 * @Author: diandian
 * @Date: 2022-11-22 20:17:00
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-02-06 16:16:17
 * @FilePath: \stu-grade-admin-ui\src\api\system\class.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询班级列表
export function listClass (query) {
  return request({
    url: '/system/class/list',
    method: 'get',
    params: query
  })
}

// 查询班级及下面的学生列表
export function getStuChildrenList () {
  return request({
    url: '/system/class/listOfStudent',
    method: 'get'
  })
}

// 查询班级及下面的学生列表 (查询的是还没生成账号的学生数据)
export function listOfStudentByNullUserName () {
  return request({
    url: '/system/class/listOfStudentByNullUserName',
    method: 'get',
  })
}

// 查询班级详细
export function getClass (classId) {
  return request({
    url: '/system/class/' + classId,
    method: 'get'
  })
}


// 新增班级
export function addClass (data) {
  return request({
    url: '/system/class',
    method: 'post',
    data: data
  })
}

// 修改班级
export function updateClass (data) {
  return request({
    url: '/system/class',
    method: 'put',
    data: data
  })
}

// 删除班级
export function delClass (classId) {
  return request({
    url: '/system/class/' + classId,
    method: 'delete'
  })
}
