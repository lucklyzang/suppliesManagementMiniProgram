<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<light-hint ref="alertToast"></light-hint>
		<u-toast ref="uToast" />
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="修改密码" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="former-password-area">
				<view class="former-password-left">
					<text>*</text>
					<text>请输入旧密码</text>
				</view>
				<view class="former-password-right">
				 <u--input
						border="surround"
						type="password"
						clearable
						v-model="formerPasswordValue"
					></u--input>
				</view>
			</view>
			<view class="former-password-area new-password-area">
				<view class="former-password-left">
					<text>*</text>
					<text>请输入新密码</text>
				</view>
				<view class="former-password-right">
				 <u--input
						border="surround"
						type="password"
						clearable
						v-model="newPasswordValue"
					></u--input>
					<view class="password-explain">
						密码至少8位，可以使用字母和数字。
					</view>
				</view>
			</view>
			<view class="former-password-area">
				<view class="former-password-left">
					<text>*</text>
					<text>请确认新密码</text>
				</view>
				<view class="former-password-right">
				 <u--input
						border="surround"
						type="password"
						clearable
						v-model="surePasswordValue"
					></u--input>
				</view>
			</view>
		</view>
		<view class="bottom-area">
			<view class="quit-area" @click="submitModificationEvent">提交修改</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import _ from 'lodash'
	import {
		setCache,
		removeAllLocalStorage,
	} from '@/common/js/utils'
	import store from '@/store'
	import { modificationPassword } from '@/api/login.js'
	import navBar from "@/components/zhouWei-navBar"
	import LightHint from "@/components/light-hint/light-hint.vue"
	export default {
		components: {
			navBar,
			LightHint
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				formerPasswordValue: '',
				newPasswordValue: '',
				surePasswordValue: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight'
			]),
			userName() {
				return this.userInfo['name']
			},
			userAccount() {
				return this.userInfo['userName']
			},
			proName () {
			  return this.userInfo['proName']
			},
			proId() {
				return this.userInfo['proId']
			},
			workerId() {
				return this.userInfo['user']['id']
			},
			depId() {
				return this.userInfo['depId'] === null ? '' : this.userInfo['depId']
			},
			depName() {
				return this.userInfo['depName'] === null ? '' : this.userInfo['depName']
			}
		},
		methods: {
			...mapMutations([
				'changeOverDueWay'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 提交修改事件
			submitModificationEvent () {
				// 旧密码不能为空
				if (this.formerPasswordValue == '') {
					this.$refs.uToast.show({
						message: '请输入旧密码',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 新密码不能为空
				if (this.newPasswordValue == '') {
					this.$refs.uToast.show({
						message: '请输入新密码',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 新旧密码不能相同
				if (this.newPasswordValue == this.formerPasswordValue) {
					this.$refs.uToast.show({
						message: '修改失败！旧密码与新密码一致，请重新输入',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 确认新密码不能为空
				if (this.surePasswordValue == '') {
					this.$refs.uToast.show({
						message: '请确认新密码',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 两次密码输入不一致
				if (this.newPasswordValue != this.surePasswordValue) {
					this.$refs.uToast.show({
						message: '两次密码输入不一致',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 新密码不能少于8位
				if (this.newPasswordValue.length < 8) {
					this.$refs.uToast.show({
						message: '修改失败，新密码不得少于8位!',
						position: 'center',
						type: 'warning'
					});
					return
				};
				// 新密码只能包含数字和字母
				if (!(/^[a-zA-Z0-9]+$/.test(this.newPasswordValue))) {
					this.$refs.uToast.show({
						message: '修改失败，新密码只能包含数字和字母',
						position: 'center',
						type: 'warning'
					});
					return
				};
				this.showLoadingHint = true;
				modificationPassword({
					oldPassword: this.formerPasswordValue,
					newPassword: this.newPasswordValue
				}).then((res) => {
					this.showLoadingHint = false;
				  if (res && res.data.code == 200) {
						this.changeOverDueWay(true);
						setTimeout(()=>{
							uni.redirectTo({
								url: '/pages/login/login'
							})
						},2000);
						// 清空store和localStorage
						if(store.getters.suppliesHomeGlobalTimer) {window.clearInterval(store.getters.suppliesHomeGlobalTimer)};
						store.dispatch('resetOrderFormAuditState');
						store.dispatch('resetMaterialApplicationOrderFormState');
						store.dispatch('resetLoginState');
						removeAllLocalStorage();
						this.$refs.alertToast.show({
							type: 'success',
							message: '修改成功!',
							isShow: true
						});
				  } else {
						this.$refs.alertToast.show({
							type: 'error',
							message: `${res.data.msg}!`,
							isShow: true
						})
				  }
				})
				.catch((err) => {
					this.showLoadingHint = false;
				  this.$refs.uToast.show({
				    message: `${err.message}`,
				    type: 'error'
				  })
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "~@/common/stylus/variable.scss";
	page {
		width: 100%;
		height: 100%;
	};
	.content-box {
		@include content-wrapper;
		height: 100vh !important;
		box-sizing: border-box;
		background: #f6f6f6;
		::v-deep .u-popup {
			flex: none !important
		};
		::v-deep .u-loading-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
			z-index: 200000;
		};
		::v-deep .u-transition {
			z-index: 100000 !important;
		};
		.top-background-area {
			width: 100%;
			background: #44CC72;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.nav {
			width: 100%;
		};
		.content {
			 flex: 1;
			 overflow: auto;
			 padding: 20px;
			 box-sizing: border-box;
			 position: relative;
			 background: #F8F8F8;
			 .former-password-area {
				 display: flex;
				 justify-content: space-between;
				 align-items: center;
				 margin-bottom: 14px;
				 .former-password-left {
					 margin-right: 10px;
					 >text {
						 &:first-child {
							 color: #DB4747;
							 margin-right: 4px;
						 };
						 &:last-child {
							 font-weight: bold;
							 font-size: 14px;
							 color: #000000;
						 }
					 }
				 };
				 .former-password-right {
					 flex: 1;
					 background: #fff;
				 }
			 };
			 .new-password-area {
				 .former-password-right {
					 .password-explain {
						 font-size: 12px;
						 color: #DB4747;
					 }
				 }
			 }
		};
		.bottom-area {
			height: 110px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 10px;
			box-sizing: border-box;
			.quit-area {
				display: block;
				height: 44px;
				background: #44CC72;
				border-radius: 4px;
				font-size: 14px;
				color: #fff;
				line-height: 44px;
				text-align: center;
				width: 60%;
			}
		}
	}
</style>
