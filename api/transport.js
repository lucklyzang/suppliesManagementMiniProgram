import request from '@/api/request';
import Qs from 'qs'
import store from '@/store'
// 查询运送类型
export function queryTransportType(data) {
  return request({
    url: 'trans/taskType/queryAll',
    method: 'get',
    params: data
  })
};

// 查询运送类型分类
export function queryTransportTypeClass(data) {
  return request({
    url: 'trans/taskTypeClass/queryAll',
    method: 'get',
    params: data
  })
};

// 查询调度任务(根据id)
export function getDispatchTaskMessageById(taskId,tempFlag) {
  return request({
    url: store.getters.templateType == 'template_one' ? `trans/task/query/${taskId}/${tempFlag}` : `trans/dispatch/app/query/${taskId}`,
    method: 'get'
  })
};

// 查询目的地(科室)
export function queryAllDestination(proId) {
  return request({
    url: `trans/department/dict/${proId}`,
    method: 'get'
  })
};

// 查询转运工具
export function queryTransportTools(data) {
  return request({
    url: 'trans/tool/queryAll',
    method: 'get',
    params: data
  })
};

// 生成调度任务(一个病人)
export function generateDispatchTask(data) {
  return request({
    url: 'trans/task/add',
    method: 'post',
    data
  })
};

// 生成调度任务(多个病人)
export function generateDispatchTaskMany(data) {
  return request({
    url: 'trans/dispatch/app/save',
    method: 'post',
    data
  })
};

// 查询调度任务(分配给本人的已完成)
export function getDispatchTaskComplete(data) {
  return request({
    url: store.getters.templateType == 'template_one' ? 'trans/task/queryTask':'trans/dispatch/queryTask',
    method: 'get',
    params: data
  })
};

// 取消原因查询
export function queryDispatchTaskCancelReason(data) {
  return request({
    url: 'trans/cancel/queryAll',
    method: 'get',
    params: data
  })
};

// 调度任务的操作(取消)
export function updateDispatchTask(data) {
  return request({
    url: store.getters.templateType == 'template_one' ? 'trans/task/update':'trans/dispatch/update',
    method: 'put',
    data
  })
};

// 生成调度任务(多个病人)
export function generateDispatchTaskManyNew(data) {
  return request({
      url: 'trans/dispatch/saveTransDispatchTaskForApp',
      method: 'post',
      data
  })
};

// 根据科室查询房间信息
export function departmentRoom(data) {
  return request({
    url: 'trans/bxSpace/loadData',
    method: 'get',
    params: data
  })
};

// 查询创建调度任务时是否配置接触隔离选项
export function queryTransConfig (proId, key) {
  return request({
    url: `trans/paramConfig/queryByKey?proId=${proId}&key=${key}`,
    method: 'get'
  })
};

// 查询运送员
export function getTransporter(proId,workerId) {
    return request({
      url: `trans/worker/assignWorker/${proId}?workerId=${workerId}`,
      method: 'get'
    })
};

// 运送任务编辑(单病人)
export function editDispathTaskSingle (data) {
  return request({
    url: 'trans/task/updateTransForApp',
    method: 'post',
    data
  })
};

// 编辑运送任务(多个病人)
export function editDispatchTaskManyNew(data) {
  return request({
      url: 'trans/dispatch/updateTransDispatchTaskForApp',
      method: 'post',
      data
  })
};

// 调度任务催单
export function taskReminder(proId,taskId) {
  return request({
    url: store.getters.templateType == 'template_one' ? `trans/task/reminder/${proId}/${taskId}` : `trans/dispatch/reminder/${proId}/${taskId}`,
    method: 'get'
  })
};
