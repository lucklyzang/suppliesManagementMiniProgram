import request from '@/api/request'
import qs from 'qs'
// 获取产品精简列表
export function getProductSimpleList() {
	return request({
	    url: '/spd/admin-api/erp/product/simple-list',
	    method: 'get'
	  })
}

// 创建计划订单
export function createPlanOrder(data) {
	return request({
	    url: '/spd/admin-api/erp/plan-order/create',
	    method: 'post',
			data
	  })
}

// 获取计划订单分页
export function getPlanOrderPage(data) {
	if (data.orderTime && Array.isArray(data.orderTime)) {
	  data.orderTime = data.orderTime.map(date => date + ' 00:00:00');
	};
	return request({
	    url: '/spd/admin-api/erp/plan-order/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}