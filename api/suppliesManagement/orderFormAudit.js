import request from '@/api/request';
import qs from 'qs'
// 待审核任务数量统计
export function getSaleStatisticsPendingReview() {
	return request({
	    url: '/spd/admin-api/erp/sale-statistics/pending-review',
	    method: 'get'
	  })
}

// 更新订单状态
export function checkOrder(data) {
	return request({
	    url: '/spd/admin-api/erp/check-order/update-status',
	    method: 'put',
			params: data
	  })
}

// 获取审核订单分页
export function getCheckOrderPage(data) {
	if (data.orderTime && Array.isArray(data.orderTime)) {
	  data.orderTime = data.orderTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
	    url: '/spd/admin-api/erp/check-order/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}

// 获得审核订单详情
export function getCheckOrder(id) {
	return request({
	    url: `/spd/admin-api/erp/check-order/get?id=${id}`,
	    method: 'get'
	  })
}