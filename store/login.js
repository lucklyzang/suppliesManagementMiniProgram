import { setCache, getCache } from '@/common/js/utils'
import { getDefaultLoginState } from '@/common/js/resetStore/resetStore.js'
export default {	
	state: getDefaultLoginState(),
	getters: {
		userInfo:(state) => {
			state.userInfo = getCache('userInfo') ? getCache('userInfo') : {};
			return state.userInfo
		},
		isMedicalMan:(state) => {
			state.isMedicalMan = getCache('isMedicalMan') ? getCache('isMedicalMan') === 'false' ? false : true : true;
			return state.isMedicalMan
		},
		chooseHospitalArea:(state) => {
			state.chooseHospitalArea = getCache('chooseHospitalArea') ? getCache('chooseHospitalArea') : {};
			return state.chooseHospitalArea
		},
		isLogin: (state) => {
			state.isLogin = getCache('isLogin') ? getCache('isLogin') === 'false' ? false : true : false;
			return state.isLogin
		},
		socketOpen: (state) => {
			state.socketOpen = getCache('socketOpen') ? getCache('socketOpen') === 'false' ? false : true : false;
			return state.socketOpen
		},
		templateType:  (state) => {
			state.templateType = getCache('templateType') ? getCache('templateType') : '';
			return state.templateType
		},
		token:(state) => {
			state.token = getCache('token') ? getCache('token') : null;
			return state.token
		},
		affairToken:(state) => {
			state.affairToken = getCache('affairToken') ? getCache('affairToken') : null;
			return state.affairToken
		},
		overDueWay: state => state.overDueWay
	},
	mutations: {
		changeIsMedicalMan (state, playLoad) {
			setCache('isMedicalMan', playLoad);
		  state.isMedicalMan = playLoad
		},
		storeUserInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('userInfo', playLoad);
				state.userInfo = playLoad
			}
		},
		storeChooseHospitalArea(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('chooseHospitalArea', playLoad);
				state.chooseHospitalArea = playLoad
			}
		},
		// 修改模板状态
		changeTemplateType(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('templateType', playLoad);
				state.templateType = playLoad
			}
		},
		// 修改token状态
		changeToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('token', playLoad);
				state.token = playLoad
			}
		},
		// 修改事务接口token状态
		changeAffairToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('affairToken', playLoad);
				state.affairToken = playLoad
			}
		},
		// 修改socken是否打开
		changeSocketOpen(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('socketOpen', playLoad);
				state.socketOpen = playLoad
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
