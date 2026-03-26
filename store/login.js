import { setCache, getCache } from '@/common/js/utils'
import { getDefaultLoginState } from '@/common/js/resetStore/resetStore.js'
export default {	
	state: getDefaultLoginState(),
	getters: {
		userInfo:(state) => {
			state.userInfo = getCache('userInfo') ? getCache('userInfo') : {};
			return state.userInfo
		},
		userTokenInfo:(state) => {
			state.userTokenInfo = getCache('userTokenInfo') ? getCache('userTokenInfo') : null;
			return state.userTokenInfo
		},
		chooseHospitalArea:(state) => {
			state.chooseHospitalArea = getCache('chooseHospitalArea') ? getCache('chooseHospitalArea') : {};
			return state.chooseHospitalArea
		},
		isLogin: (state) => {
			state.isLogin = getCache('isLogin') ? getCache('isLogin') === 'false' ? false : true : false;
			return state.isLogin
		},
		token:(state) => {
			state.token = getCache('token') ? getCache('token') : null;
			return state.token
		},
		overDueWay: state => state.overDueWay
	},
	mutations: {
		storeUserInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('userInfo', playLoad);
				state.userInfo = playLoad
			}
		},
		storeUserTokenInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('userTokenInfo', playLoad);
				state.userTokenInfo = playLoad
			}
		},
		storeChooseHospitalArea(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('chooseHospitalArea', playLoad);
				state.chooseHospitalArea = playLoad
			}
		},
		// 修改token状态
		changeToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('token', playLoad);
				state.token = playLoad
			}
		},
		// 修改是否登录状态
		changeIsLogin(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('isLogin', playLoad);
				state.isLogin = playLoad
			}
		},
		// 修改过期方式
		changeOverDueWay(state, playLoad) {
			state.overDueWay = playLoad
		},
		//重置登录信息的状态
		resetLoginInfoState(state) {
				Object.assign(state, getDefaultLoginState())
		}
	},
	actions: {
		resetLoginState({ commit }) {
			commit('resetLoginInfoState')
		}
	}
}
