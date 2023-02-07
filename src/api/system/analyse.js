/*
 * @Author: diandian
 * @Date: 2022-11-28 15:14:43
 * @LastEditors: diandain 498728659@qq.com
 * @LastEditTime: 2023-02-07 17:08:53
 * @FilePath: \stu-grade-admin-ui\src\api\system\analyse.js
 * @Description: 
 * 
 * Copyright (c) 2022 by error: git config user.name && git config user.email & please set dead value or install git, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询单一个学生全部成绩数据分析
export function stuAnalyse (query) {
  return request({
    url: '/system/analyse/stuAnalyse',
    method: 'post',
    params: query
  })
}

// 查询该课程里所有学生的成绩数据分析
export function scoreAnalyse (query) {
  return request({
    url: '/system/analyse/scoreAnalyse',
    method: 'post',
    params: query
  })
}

