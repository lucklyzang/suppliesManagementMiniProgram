import request from '@/api/request';

// 查询反馈意见
export function queryFeedback(data) {
  return request({
    url: 'trans/feedbackConf/queryAll',
    method: 'get',
    params: data
  })
};

// 提交总体反馈意见
export function submitFeedback(data) {
  return request({
    url: 'trans/wholeFeedback/add',
    method: 'post',
    data
  })
};

// 提交任务反馈意见
export function submitTaskFeedback(data,type) {
  return request({
    url: `trans/feedback/feedback/${type}`,
    method: 'post',
    data
  })
};