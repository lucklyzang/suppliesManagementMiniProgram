import { setCache, getCache } from '@/common/js/utils'
import { getDefaultOrderFormAuditState } from '@/common/js/resetStore/resetStore.js'
export default {
  state: getDefaultOrderFormAuditState(),
	
  getters:{
		suppliesHomeGlobalTimer: (state) => {
			return state.suppliesHomeGlobalTimer
		}
  },

  mutations:{
		// 保存全局物资管理首页suppliesHomeGlobalTimer
		changeSuppliesHomeGlobalTimer (state, payLoad) {
			state.suppliesHomeGlobalTimer = payLoad
		},
		//重置公共信息的状态
		resetSuppliesManagementInfoState(state) {
			Object.assign(state, getDefaultSuppliesManagementState())
		}
  },
  
  actions:{
		resetSuppliesManagementState({ commit }) {
			commit('resetSuppliesManagementInfoState')
		}
	}
}
