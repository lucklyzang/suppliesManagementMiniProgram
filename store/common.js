import { setCache, getCache } from '@/common/js/utils'
import { getDefaultCommonState } from '@/common/js/resetStore/resetStore.js'
export default {	
	state: getDefaultCommonState(),
	getters: {
		statusBarHeight:(state) => {
			state.statusBarHeight = getCache('statusBarHeight') ? getCache('statusBarHeight') : 47;
			return state.statusBarHeight
		},
		navigationBarHeight:(state) => {
			state.navigationBarHeight = getCache('navigationBarHeight') ? getCache('navigationBarHeight') : 40;
			return state.navigationBarHeight
		},
		capsuleMessage:(state) => {
			state.capsuleMessage = getCache('capsuleMessage') ? getCache('capsuleMessage') : {};
			return state.capsuleMessage
		},
		allOrderCancelReason:(state) => {
			state.allOrderCancelReason = getCache('allOrderCancelReason') ? getCache('allOrderCancelReason') :  {
				cancelReason: {},
				environmentCancelReason: {},
				projectCancelReason: {},
				affairCancelReason: {}
			};
			return state.allOrderCancelReason
		},
		currentIndex:(state) => {
			state.currentIndex = getCache('currentIndex') ? getCache('currentIndex') : 0;
			return state.currentIndex
		},
		baseURL:(state) => {
			return state.baseURL
		}
	},
	mutations: {
		storeStatusBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('statusBarHeight', playLoad);
				state.statusBarHeight = playLoad
			}
		},
		storeNavigationBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('navigationBarHeight', playLoad);
				state.navigationBarHeight = playLoad
			}
		},
		storeCapsuleMessage(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('capsuleMessage', playLoad);
				state.capsuleMessage = playLoad
			}
		},
		storeAllOrderCancelReason (state,playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('allOrderCancelReason', playLoad);
				state.allOrderCancelReason = playLoad
			}
		},
		storeCurrentIndex (state,playLoad) {
			if (playLoad != 'null') {
				setCache('currentIndex', playLoad);
				state.currentIndex = playLoad
			}
		},
		//重置公共信息的状态
		resetCommonInfoState(state) {
				Object.assign(state, getDefaultCommonState())
		}
	},
	actions: {
		resetCommitState({ commit }) {
			commit('resetCommonInfoState')
		}
	}
}
