import { setCache, getCache } from '@/common/js/utils'
import { getDefaultMaterialApplicationOrderFormState } from '@/common/js/resetStore/resetStore.js'
export default {
  state: getDefaultMaterialApplicationOrderFormState(),
	
  getters:{
		addMaterialApplicationMessage: (state) => {
			return state.addMaterialApplicationMessage
		},
		materialApplicationOrderType: (state) => {
			return state.materialApplicationOrderType
		}
  },

  mutations:{
		// 保存添加的物资申领信息
		changeAddMaterialApplicationMessage (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				state.addMaterialApplicationMessage = playLoad
			}
		},
		// 保存物质申领订单类型
		changeMaterialApplicationOrderType (state, playLoad) {
			state.materialApplicationOrderType = playLoad
		},
		//重置物资申请信息的状态
		resetMaterialApplicationOrderFormInfoState(state) {
			Object.assign(state, getDefaultMaterialApplicationOrderFormState())
		}
  },
  
  actions:{
		resetMaterialApplicationOrderFormState({ commit }) {
			commit('resetMaterialApplicationOrderFormInfoState')
		}
	}
}
