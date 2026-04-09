import request from '@/api/request';

// 账号密码登录
export function logIn(data) {
	return request({
	    url: 'spd/admin-api/system/auth/login',
	    method: 'post',
	    data
	  })
}

// 获取用户详情
export function getUserInfo(userId) {
	return request({
	    url: `spd/admin-api/system/user/get?id=${userId}`,
	    method: 'get'
	  })
}

// 用户退出登录
export function userSignOut() {
  return request({
    url: 'spd/app-api/system/auth/logout',
    method: 'post'
  })
};

// 修改密码
export function modificationPassword(data) {
  return request({
    url: '/spd/admin-api/system/user/profile/update-password',
    method: 'put',
    data
  })
};

// 获得所有科室信息
export function getDepartmentInfo() {
	return request({
	    url: '/spd/admin-api/system/department/get-simple-list',
	    method: 'get'
	  })
}