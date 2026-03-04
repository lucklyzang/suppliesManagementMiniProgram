import request from '@/api/request';

// 账号密码登录
export function logIn(data) {
	return request({
	    url: 'trans/login/login',
	    method: 'post',
	    data
	  })
}

// 用户退出登录
export function userSignOut(proId,workerId) {
  return request({
    url: `trans/login/signOut/${proId}/${workerId}`,
    method: 'get'
  })
};

// 微信登录
export function weixinLogIn(code) {
	return request({
	    url: `trans/login/wx/${code}`,
	    method: 'get'
	})
}

// 微信授权绑定已存在账号
export function boundExist(code,data) {
	return request({
	    url: `trans/login/wx/boundExist/${code}`,
	    method: 'post',
			data
	})
}

// 微信授权不绑定账号
export function boundNotExist(proId,code) {
	return request({
	    url: `trans/login/wx/boundNotExist/${proId}/${code}`,
	    method: 'post',
			data: {}
	})
}

// 修改密码
export function modificationPassword(data) {
  return request({
    url: 'project/user/update-password',
    method: 'put',
    data
  })
};

// 查询模板
export function getTemplateType(proId) {
  return request({
    url: `trans/project/template/${proId}`,
    method: 'get'
  })
};
