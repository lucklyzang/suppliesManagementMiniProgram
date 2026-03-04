import request from '@/api/request';
import Qs from 'qs'

// 即时保洁任务新增
export function addForthwithCleanTask(data) {
    return request({
        url: 'clean/cleanTask/add',
        method: 'post',
        data
    })
}

// 即时保洁任务编辑
export function editForthwithCleanTask(data) {
    return request({
        url: 'clean/cleanTask/modify',
        method: 'put',
        data
    })
}

// 即时保洁任务详情
export function getForthwithCleanTaskDetails(id) {
    return request({
        url: `clean/cleanTask/query/${id}`,
        method: 'get'
    })
}

// 查询当天保洁员(保洁管理)
export function attendanceWorkerList(proId) {
    return request({
        url: `clean/attendance/forIndex/${proId}`,
        method: 'get'
    })
}

// 获取违反标准信息
export function getViolateStandardMessage(data) {
    return request({
        url: 'clean/cleanArea/standards',
        method: 'get',
        params: data
    })
}

// 获取建筑信息
export function getArchitectureMessage(data) {
    return request({
        url: 'clean/structure/query2Select',
        method: 'get',
        params: data
    })
}

// 获取科室信息
export function getDepartmentMessage(data) {
    return request({
        url: 'clean/department/query2Select',
        method: 'get',
        params: data
    })
}

// 获取目的区域信息
export function getGoalAreaMessage(data) {
    return request({
        url: 'clean/goalArea/queryAll',
        method: 'get',
        params: data
    })
}

// 获取功能区信息
export function getFunctionAreaMessage(data) {
    return request({
        url: 'clean/cleanArea/queryAll',
        method: 'get',
        params: data
    })
}

// 取消任务(即时保洁和专项保洁)
export function cancelTask(data) {
    return request({
        url: 'clean/cleanTask/cancel',
        method: 'put',
        data
    })
}

// 取消原因(即时保洁和专项保洁)
export function cancelTaskReason(data) {
    return request({
        url: 'clean/cancel/queryAll',
        method: 'get',
				params: data
    })
}

// 获取阿里云签名接口
export function getAliyunSign() {
	return request({
	    url: 'clean/oss/getSign',
	    method: 'get'
	})
}

// 查询保洁管理任务列表
export function queryCleaningManageTaskList(data) {
    return request({
        url: 'clean/cleanTask/app/listAll',
        method: 'get',
        params: data
    })
};

// 查询保洁管理任务列表(历史任务)
export function queryCleaningManageTaskListHistory(data) {
    return request({
        url: 'clean/cleanTask/app/history',
        method: 'get',
        params: data
    })
};

// 保洁任务催单
export function cleanTaskReminder(proId,taskId) {
  return request({
    url: `clean/cleanTask/reminder/${proId}/${taskId}`,
    method: 'get'
  })
};