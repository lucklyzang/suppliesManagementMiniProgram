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
		//重置订单审核信息的状态
		resetOrderFormAuditInfoState(state) {
			Object.assign(state, getDefaultOrderFormAuditState())
		}
  },
  
  actions:{
		resetOrderFormAuditState({ commit }) {
			commit('resetOrderFormAuditInfoState')
		}
	}
}
