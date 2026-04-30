<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<light-hint ref="alertToast"></light-hint>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="submit-success-icon">
				<u-icon name="checkmark-circle-fill" color="#289E8E" size="60"></u-icon>
			</view>
			<view class="submit-success-text">
				<text>提交成功！</text>
			</view>
			<view class="submit-success-replenish">
				<text>请耐心等待商家处理</text>
			</view>
		</view>
		<view class="bottom-btn">
				<view class="back-box" @click="backTo">
					<text>返回</text>
				</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import navBar from "@/components/zhouWei-navBar"
	import { getPlanOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
	export default {
		components: {
			navBar
		},
		data() {
			return {
				path: '',
				showLoadingHint: false,
				infoText: '加载中···',
				isAllSure: false,
				message: {}
			}
		},
		onLoad (options) {
			if (options.transmitParams) {
				try {
					const rawData = decodeURIComponent(options.transmitParams);
					this.message = JSON.parse(rawData);
					this.path = message['path'];
					if (this.path == 'confirmReceipt') {
						this.getPlanOrderEvent()
					}
				} catch (e) {
					console.error('参数解析失败', e);
				}
			}
		},
		computed: {
			...mapGetters([
				'statusBarHeight',
				'navigationBarHeight'
			])
		},
		methods: {
			...mapMutations([
				'changeIsCanRequest'
			]),
			
			// 顶部导航返回事件
			backTo () {
				const pages = getCurrentPages();
				if (this.path == 'changingOrRefundingDetails') {
					uni.navigateBack({
					  delta: 2
					})
				} else if (this.path == 'confirmReceipt') {
					if (this.isAllSure) {
						const prevPage = pages[pages.length - 3];
						if (prevPage) {
							prevPage.$vm.allSureConfirmOrderEvent();
						}
					};
					uni.navigateBack({
					  delta: 2
					})
				} else if (this.path == 'confirmReceiptDetails') {
					const prevPage = pages[pages.length - 3];
					if (prevPage) {
						prevPage.$vm.getData();
						this.changeIsCanRequest(false)
					};
					uni.navigateBack({
					  delta: 2
					})
				}
			},
			
			// 查询订单详情
			getPlanOrderEvent() {
				this.isAllSure = false;
				this.showLoadingHint = true;
				this.infoText = '查询中···';
				getPlanOrder(this.message['orderId']).then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if ( res && res.data.code == 0) {
						// 判断当前订单是否全部收货完成
						if (res.data.data['status'] == 50) {
							this.isAllSure = true;
						}
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'bottom'
						})
					}
				})
				.catch((err) => {
					this.infoText = '';
					this.showLoadingHint = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'bottom'
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
		background: #fff;
		.top-background-area {
			width: 100%;
			background: #7BE9A0;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.nav {
			width: 100%;
		};
		.content {
			width: 100%;
			background: #fff;
			z-index: 10;
			flex: 1;
			height: 0;
			padding: 0 0 20px 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			.submit-success-icon {
				margin-bottom: 40px;
			};
			.submit-success-text {
				margin-bottom: 10px;
				word-break: break-all;
				>text {
					font-size: 14px;
					color: #101010;
				}
			};
			.submit-success-replenish {
				word-break: break-all;
				>text {
					font-size: 14px;
					color: #101010;
				}
			}
		};
		.bottom-btn {
			height: 100px;
			width: 94%;
			margin: 0 auto;
			display: flex;
			align-items: center;
			justify-content: center;
			.back-box {
				 width: 70%;
				 height: 32px;
				 border: 1px solid #44CC72;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 >text {
					font-size: 12px;
					color: #44CC72;
				 }
			}
		}
	}
</style>
