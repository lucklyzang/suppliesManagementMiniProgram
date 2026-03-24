// 登录信息store的初始值
export function getDefaultLoginState() {
	return {
		userInfo: {},
		token: null, //请求token,
		affairToken: null, //事务订单专用token
		isLogin: false,
		overDueWay: false,
		isMedicalMan: true,
		templateType: '',
		socketOpen: false,
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
		baseURL: 'https://test.spd.blinktech.cn/infra/swagger'
	}	
}

// 物资申领和订单信息store的初始值
export function getDefaultMaterialApplicationOrderFormState() {
	return {
		addMaterialApplicationMessage: {}
	}	
}

// 订单审核信息store的初始值
export function getDefaultOrderFormAuditState() {
	return {
	}	
}