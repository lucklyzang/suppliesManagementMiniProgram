import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import common from './common.js';
import createMaterialApplicationOrderForm from './suppliesManagement/createMaterialApplicationOrderForm.js';
import createOrderFormAudit from './suppliesManagement/createOrderFormAudit.js'
Vue.use(Vuex);
export default new Vuex.Store({
  modules:{
    login,
		common,
		createMaterialApplicationOrderForm,
		createOrderFormAudit
  }
});