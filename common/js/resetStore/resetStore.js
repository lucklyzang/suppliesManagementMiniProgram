// 登录信息store的初始值
export function getDefaultLoginState() {
	return {
		userInfo: {},
		userTokenInfo: {},
		token: null, //请求token,
		isLogin: false,
		overDueWay: false,
		chooseHospitalArea: {}
	}	
}

// 公共信息store的初始值
export function getDefaultCommonState() {
	return {
		//状态栏高度
		statusBarHeight: 0,
		//导航栏栏高度
		navigationBarHeight: 0,
		// 胶囊信息
		capsuleMessage: {},
		// 生产域名 https://blinktech.cn/nblink
		// 开发域名 https://blink.blinktech.cn/nblink
		// 准生产域名 https://ver.blinktech.cn/nblink
		// 测试域名 https://show.blinktech.cn/nblink
		baseURL: 'https://test.spd.blinktech.cn'
	}	
}

// 物资申领和订单信息store的初始值
export function getDefaultMaterialApplicationOrderFormState() {
	return {
		addMaterialApplicationMessage: [],
		materialApplicationOrderType: 0
	}	
}

// 订单审核信息store的初始值
export function getDefaultOrderFormAuditState() {
	return {
		suppliesHomeGlobalTimer: null
	}	
}