<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<light-hint ref="alertToast"></light-hint>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast"></u-toast>
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="确认收货" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="delivery-information-list">
				<view class="delivery-information-text">
					<text>送货信息:</text>
				</view>
				<u-empty text="您还没有相关订单" mode="list" v-if="isShowNoData"></u-empty>
				<view class="delivery-information" v-for="(item,index) in saleReturnOrderList" :key="item.id" @click="enterChangingOrRefundingDetailsEvent(item,index)">
					<view class="delivery-information-left">
						<view class="delivery-number-message">
							<view class="delivery-number">
								<text>送货单号:</text>
								<text>{{ item.no }}</text>
							</view>
							<view class="harvest-date" v-if="item.status == 60">
								<text>收货日期:</text>
								<text>{{ item.checkTime }}</text>
							</view>
						</view>
						<view class="related-order-number-message">
							<view class="related-order-number">
								<text>关联订单号:</text>
								<text>{{ item.orderNo }}</text>
							</view>
							<view class="delivery-date">
								<text>送货日期:</text>
								<text>{{ item.outTime }}</text>
							</view>
						</view>
					</view>
					<view class="delivery-information-right">
						<text :class="{'aleradyCompleteStyle' : item.status == 60}">{{ stateTransfer(item.status) }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="bottom-btn">
				<view class="back-box" @click="allConfirmReceiptEvent" v-if="isShowAllConfirmReceipt">
					<text>全部确认收货</text>
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
	import SOtime from '@/common/js/utils/SOtime.js'
	import { getPlanOrder,confirmAllSaleReturn, getSaleReturnPage } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
	import { setCache,removeAllLocalStorage, getDate } from '@/common/js/utils'
	import _ from 'lodash'
	import LightHint from "@/components/light-hint/light-hint.vue";
	export default {
		components: {
			navBar,
			LightHint
		},
		data() {
			return {
				showLoadingHint: false,
				infoText: '加载中···',
				isExecute: true,
				isShowAllConfirmReceipt: false,
				isShowNoData: false,
				loadingShow: false,
				isAllSure: false,
				currentId: 0,
				saleReturnOrderList: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight'
			]),
			userName() {
				return this.userInfo['nickname']
			},
			userAccount() {
				return this.userInfo['username']
			},
			workerId() {
				return this.userInfo['id']
			},
			proName () {
				return this.userInfo['deptName']
			},
			proId() {
				return this.userInfo['deptId']
			},
			depId() {
				return this.userInfo['departmentId']
			},
			depName() {
				return ''
			}
		},
		
		onLoad (options) {
			this.isExecute = false;
			if (JSON.stringify(options) != '{}') {
				this.currentId = Number(options.id);
				this.getSaleReturnPageEvent(this.currentId)
			}
		},
		
		onShow () {
			if (this.isExecute) {
				this.getSaleReturnPageEvent(this.currentId)
			}
		},
		
		onHide () {
			this.isExecute = true;
		},
		
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				// 全部确认成功后,删除该订单
			 	// 获取页面栈
				if (this.isAllSure) {
					const pages = getCurrentPages();
					const prevPage = pages[pages.length - 2];
					if (prevPage) {
						prevPage.$vm.allSureConfirmOrderEvent();
					}
				};
			 	uni.navigateBack()
			},
			
			// 判断是否显示全部确认收货按钮
			judgeIsShowAllConfirmReceiptEvent() {
				let flag = this.saleReturnOrderList.some((item,index) => { return item.status == 21});
				if (flag) {
					this.isShowAllConfirmReceipt = true
				} else {
					this.isShowAllConfirmReceipt = false
				}
			},
			
			//任务状态转换
			stateTransfer (num) {
				switch(num) {
						case 10:
							return '待送货'
							break;
						case 20:
								return '已发货'
								break;
						case 21:
								return '已送达'
								break;
						case 30:
								return '退换货'
								break;
						case 40:
								return '已取消'
								break;
						case 50:
								return '已撤销'
								break;
						case 60:
								return '已确认'
								break;
				} 
			},
			
			getSaleReturnPageEvent(id) {
				this.saleReturnOrderList = [];
				this.isShowNoData = false;
				this.showLoadingHint = true;
				this.infoText = '加载中···';
				getSaleReturnPage(id).then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if ( res && res.data.code == 0) {
						this.saleReturnOrderList = res.data.data;
						if (this.saleReturnOrderList.length == 0) {
							this.isShowNoData = true
						} else {
							this.saleReturnOrderList.forEach((item)=>{
								item.outTime = item.outTime ? SOtime.time8(item.outTime,true) : '';
								item.checkTime = item.checkTime ? SOtime.time8(item.checkTime,true) : '';
							});
							this.isShowNoData = false;
							this.judgeIsShowAllConfirmReceiptEvent();
						};
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'bottom'
						})
					}
				})
				.catch((err) => {
					this.showLoadingHint = false;
					this.infoText = '';
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'bottom'
					})
				})
			},
			
			// 查询订单详情
			getPlanOrderEvent() {
				this.isAllSure = false;
				this.showLoadingHint = true;
				this.infoText = '查询中···';
				getPlanOrder(this.currentId).then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if ( res && res.data.code == 0) {
						// 判断当前订单是否全部收货完成
						if (res.data.data['status'] == 50) {
							this.isAllSure = true;
						};
						this.backTo();
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
			},
			
			// 进入确认货详情事件
			enterChangingOrRefundingDetailsEvent (item,index) {
				let transmitParams = encodeURIComponent(
				 JSON.stringify({
					 id: item.id,
					 orderId: this.currentId,
					 status: item.status
				 })
				);
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/confirmReceiptDetails/confirmReceiptDetails?transmitParams=${transmitParams}`
				})
			},
			
			// 确认全部收货事件
			allConfirmReceiptEvent () {
				this.showLoadingHint = true;
				this.infoText = '提交中···';
				confirmAllSaleReturn({
					id: this.currentId
				}).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if ( res && res.data.code == 0) {
						if (res.data.data) {
							this.$refs.uToast.show({
								message: '全部确认收货成功!',
								type: 'success',
								position: 'bottom'
							});
							this.getPlanOrderEvent()
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'bottom'
							})
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
			height: 0;
			background: #fff;
			z-index: 10;
			flex: 1;
			overflow: auto;
			padding: 0 0 20px 0;
			box-sizing: border-box;
			position: relative;
			::v-deep .u-empty {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%)
			};
			.delivery-information-list {
				padding: 0 8px;
				box-sizing: border-box;
				margin-bottom: 10px;
				.delivery-information-text {
					margin: 6px 0;
					padding: 0 6px;
					box-sizing: border-box;
					>text {
						font-size: 14px;
						color: #101010;
					}
				};
				.delivery-information {
					border-radius: 6px;
					background-color: rgba(255,255,255,1);
					box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.07);
					padding: 6px 3px 6px 6px;
					box-sizing: border-box;
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 6px;
					.delivery-information-left {
						flex: 1;
						width: 0;
						display: flex;
						flex-direction: column;
						justify-content: center;
						.delivery-number-message {
							display: flex;
							justify-content: space-between;
							margin-bottom: 10px;
							.delivery-number {
								margin-right: 10px;
								flex: 1;
								display: flex;
								>text {
									font-size: 14px;
									color: #101010;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										word-break: break-all;
										flex: 1;
									}
								}
							};
							.harvest-date {
								width: 42%;
								display: flex;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										word-break: break-all;
										flex: 1;
									}
								}
							}
						};
						.related-order-number-message {
							display: flex;
							justify-content: space-between;
							.related-order-number {
								margin-right: 10px;
								flex: 1;
								display: flex;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										word-break: break-all;
										flex: 1;
									}
								}
							};
							.delivery-date {
								width: 42%;
								display: flex;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										word-break: break-all;
										flex: 1;
									}
								}
							}
						}
					};
					.delivery-information-right {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 60px;
						>text {
							display: inline-block;
							width: 52px;
							height: 26px;
							text-align: center;
							line-height: 26px;
							border-radius: 4px;
							background: #E8CB51;
							color: #fff;
							font-size: 12px;
						};
						.aleradyCompleteStyle {
							background: #9EA1B6 !important
						}
					}
				}
			};
			.order-status-record {
				padding: 0 3px;
				box-sizing: border-box;
				margin-bottom: 6px;
				.order-status-record-text {
					margin-bottom: 6px;
					padding: 0 3px;
					box-sizing: border-box;
					>text {
						font-size: 14px;
						color: #101010;
					}
				};
				.order-status-record-list-wrapper {
					position: relative;
					.order-status-record-list-line {
						position: absolute;
						top: 6px;
						left: 6px;
						width: 1px;
						height: 70%;
						background: rgba(59,157,249,0.19);
					};
					.order-status-record-list {
						display: flex;
						margin-bottom: 10px;
						.order-status-record-left {
							display: flex;
							justify-content: center;
							margin-right: 10px;
							padding-top: 4px;
							box-sizing: border-box;
							>text {
								width: 14px;
								height: 14px;
								z-index: 10;
								border-radius: 50%;
								background-color: #3370FF;
							}
						};
						.order-status-record-right {
							flex: 1;
							display: flex;
							flex-wrap: wrap;
							>view {
								margin-right: 4px;
								margin-bottom: 4px;
							};
							.order-status-text {
								display: flex;
								justify-content: center;
								align-items: center;
								width: 64px;
								height: 22px;
								background: #3370FF;
								border-radius: 4px;
								margin-bottom: 0 !important;
								>text {
									font-size: 14px;
									color: #fff;
								}
							};
							.commom-view {
								>text {
									font-size: 12px;
									color: #BBBBBB;
									&:nth-child(1) {
										margin-right: 2px;
									}
								}
							}
						}
					}
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
				 width: 55%;
				 height: 32px;
				 background: #11D183;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 >text {
					font-size: 12px;
					color: #fff;
				 }
			}
		}
	}
</style>
