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

// 更新计划订单
export function updatePlanOrder(data) {
	return request({
	    url: '/spd/admin-api/erp/plan-order/update',
	    method: 'put',
			data
	  })
}

// 删除计划订单
export function deletePlanOrder(id) {
	return request({
	    url: `/spd/admin-api/erp/plan-order/delete?ids=${id}`,
	    method: 'delete'
	  })
}

// 获取计划订单分页
export function getPlanOrderPage(data) {
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
	    url: '/spd/admin-api/erp/plan-order/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}

// 获得计划订单详情
export function getPlanOrder(id) {
	return request({
	    url: `/spd/admin-api/erp/plan-order/get?id=${id}`,
	    method: 'get'
	  })
}

// 获得退换货分页
export function getSaleReturnPage(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-return/page',
	    method: 'get',
			params: data
	  })
}

// 获得退换货详情
export function getSaleReturn(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-return/get?id=${id}`,
	    method: 'get'
	  })
}

// 更新退换货
export function updateSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-return/update',
	    method: 'put',
			params: data
	  })
}

// 确认收货
export function confirmSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/confirm',
	    method: 'put',
			params: data
	  })
}

// 创建订单评价信息
export function createOrderEvaluate(data) {
	return request({
	    url: '/spd/admin-api/erp/order-evaluate/create',
	    method: 'post',
			data
	  })
}

// 获得订单评价信息
export function getOrderEvaluate(data) {
	return request({
	    url: '/spd/admin-api/erp/order-evaluate/get-by-order-id',
	    method: 'post',
			params: data
	  })
}