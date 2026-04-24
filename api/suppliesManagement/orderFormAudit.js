import request from '@/api/request';

// 待审核任务数量统计
export function getSaleStatisticsPendingReview() {
	return request({
	    url: '/spd/admin-api/erp/sale-statistics/pending-review',
	    method: 'get'
	  })
}