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

// 根据订单查询出货单
export function getSaleReturnPage(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-out/query-by-orderId?orderId=${id}`,
	    method: 'get'
	  })
}

// 获得出货单详情
export function getSaleReturn(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-out/get?id=${id}`,
	    method: 'get'
	  })
}

// 创建退换货
export function createSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-return/create',
	    method: 'post',
			data
	  })
}

// 确认收货(单个)
export function confirmSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/confirm',
	    method: 'put',
			params: data
	  })
}

// 确认收货(批量)
export function confirmAllSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/confirm-all',
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
	    method: 'get',
			params: data
	  })
}

// 查询订单操作记录
export function queryorderOperationLog(orderId) {
	return request({
	    url: `/spd/admin-api/erp/order-operation-log/list-by-order-id?orderId=${orderId}`,
	    method: 'get'
	  })
}