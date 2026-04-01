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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="订单详情" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="content-top">
				<view class="content-top-left">
					<text>已申购产品</text>
				</view>
			</view>
			<view class="content-center">
				<view class="empty-info" v-if="materialList.length == 0">
					<u-empty text="暂无产品" mode="list"></u-empty>
				</view>
				<view class="product-list" v-for="(item,index) in materialList" :key="item.productName">
					<view class="product-left">
						<image :src="item['images'] ? item['images'] : productDefaultImage" mode="widthFix"></image>
					</view>
					<view class="product-center">
						<view class="product-name">
							<text>
								{{ item.productName }}
							</text>
						</view>
						<view class="product-specification">
							<view class="product-specification-left">
								<text>
									{{ item.specification ? item.specification : '无' }}
								</text>
							</view>
							<view class="product-specification-right">
								<text>￥</text>
								<text>
									{{ formatPrice(item.productPrice) }}
								</text>
								<text>
									{{ `/${item.productUnitName}` }}
								</text>
							</view>
						</view>
					</view>
					<view class="product-right">
						<view class="product-number-box">
							<text>数量:</text>
							<text>{{ item.count }}</text>
						</view>
						<view class="product-total-price">
							<text>总额:</text>
							<text>{{ `￥${formatPrice(item.totalPrice)}` }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="total-prices">
				<view class="total-prices-right">
					<text>合计:</text>
					<text>{{ `￥${formatPrice(allChooseProductPrice)}` }}</text>
				</view>
			</view>
			<view class="order-message">
				<view class="create-delivery-date">
					<view class="create-delivery-date-left">
						<text>创建时间:</text>
						<text>{{ orderMessage['orderTime'] }}</text>
					</view>
					<view class="create-delivery-date-left">
						<text>交货日期:</text>
						<text></text>
					</view>
				</view>
				<view class="create-delivery-date">
					<view class="create-delivery-date-left">
						<text>下单医院:</text>
						<text></text>
					</view>
					<view class="create-delivery-date-left">
						<text>送货地址:</text>
						<text>{{ orderMessage['address'] ? orderMessage['address'] : '无' }}</text>
					</view>
				</view>
				<view class="product-list remark-box">
					<text>备注:</text>
					<text>{{ orderMessage['remark'] ? orderMessage['remark'] : '无' }}</text>
				</view>
			</view>
			<view class="delivery-information-list">
				<view class="delivery-information-text">
					<text>送货信息:</text>
				</view>
				<view class="delivery-information" @click="enterChangingOrRefundingDetailsEvent">
					<view class="delivery-information-left">
						<view class="delivery-number-message">
							<view class="delivery-number">
								<text>送货单号:</text>
								<text>5564267</text>
							</view>
							<view class="harvest-date">
								<text>收货日期:</text>
								<text>2026-02-24</text>
							</view>
						</view>
						<view class="related-order-number-message">
							<view class="related-order-number">
								<text>关联单号:</text>
								<text>5564267</text>
							</view>
							<view class="delivery-date">
								<text>送货日期:</text>
								<text>2026-02-24</text>
							</view>
						</view>
					</view>
					<view class="delivery-information-right">
						<text>已发货</text>
					</view>
				</view>
			</view>
			<view class="order-status-record">
				<view class="order-status-record-text">
					<text>订单状态记录:</text>
				</view>
				<view class="order-status-record-list-wrapper">
					<view class="order-status-record-list">
						<view class="order-status-record-list-line"></view>
						<view class="order-status-record-left">
							<text></text>
						</view>
						<view class="order-status-record-right">
							<view class="order-status-text">
								<text>待审核</text>
							</view>
							<view class="commom-view operation-time">
								<text>操作时间:</text>
								<text>2025-05-12 12:10</text>
							</view>
							<view class="commom-view operation-people">
								<text>操作人:</text>
								<text>沙克老师</text>
							</view>
							<view class="commom-view audit-opinion">
								<text>审核意见:</text>
								<text>数量没有写对</text>
							</view>
							<view class="commom-view refuse-reason">
								<text>拒绝理由:</text>
								<text>数量没有写对</text>
							</view>
							<view class="commom-view sales-return-reason">
								<text>退货原因:</text>
								<text>数量没有写对</text>
							</view>
							<view class="commom-view score-box">
								<text>评分:</text>
								<text>5星</text>
							</view>
							<view class="commom-view evaluate-box">
								<text>评价:</text>
								<text>非常不错</text>
							</view>
						</view>
					</view>
					<view class="order-status-record-list">
						<view class="order-status-record-list-line"></view>
						<view class="order-status-record-left">
							<text></text>
						</view>
						<view class="order-status-record-right">
							<view class="order-status-text">
								<text>待审核</text>
							</view>
							<view class="commom-view operation-time">
								<text>操作时间:</text>
								<text>2025-05-12 12:10</text>
							</view>
							<view class="commom-view operation-people">
								<text>操作人:</text>
								<text>沙克老师</text>
							</view>
							<view class="commom-view score-box">
								<text>评分:</text>
								<text>5星</text>
							</view>
							<view class="commom-view evaluate-box">
								<text>评价:</text>
								<text>非常不错</text>
							</view>
						</view>
					</view>
					<view class="order-status-record-list">
						<view class="order-status-record-list-line" v-if="false"></view>
						<view class="order-status-record-left">
							<text></text>
						</view>
						<view class="order-status-record-right">
							<view class="order-status-text">
								<text>待审核</text>
							</view>
							<view class="commom-view operation-time">
								<text>操作时间:</text>
								<text>2025-05-12 12:10</text>
							</view>
							<view class="commom-view operation-people">
								<text>操作人:</text>
								<text>沙克老师</text>
							</view>
							<view class="commom-view score-box">
								<text>评分:</text>
								<text>5星</text>
							</view>
							<view class="commom-view evaluate-box">
								<text>评价:</text>
								<text>非常不错</text>
							</view>
						</view>
					</view>
				</view>
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
	import SOtime from '@/common/js/utils/SOtime.js';
	import { setCache,removeAllLocalStorage, getDate } from '@/common/js/utils'
	import { getPlanOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
				loadingShow: false,
				allChooseProductPrice: 0,
				productDefaultImage: require('@/static/img/basic-message.png'),
				orderMessage: {},
				materialList: []
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
			this.getPlanOrderEvent(Number(options.id));
		},
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 查询订单详情
			getPlanOrderEvent(id) {
				this.showLoadingHint = true;
				this.infoText = '加载中···';
				getPlanOrder(id).then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if ( res && res.data.code == 0) {
						this.orderMessage = res.data.data;
						this.materialList = this.orderMessage['items'];
						this.allChooseProductPrice = this.orderMessage['totalProductPrice'];
						this.orderMessage['orderTime'] = SOtime.time3(this.orderMessage['orderTime']);
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
			
			//任务状态转换
			stateTransfer (num) {
				switch(num) {
						case 10:
							return '待审核'
							break;
						case 20:
								return '待确认'
								break;
						case 21:
								return '未通过'
								break;
						case 30:
								return '待发货'
								break;
						case 31:
								return '已拒绝'
								break;
						case 40:
								return '已发货'
								break;
						case 41:
								return '售后中'
								break;
				} 
			},
			
			// 保留两位小数，返回数字类型，修复精度问题
			formatPrice(num) {
			  if (typeof num !== 'number' || isNaN(num)) return "0.00";
				 const value = Math.round(num * 100) / 100;
				 return value.toFixed(2);
			},
			
			// 进入退换货详情事件
			enterChangingOrRefundingDetailsEvent () {
				uni.navigateTo({
					url: '/materialApplicationPackage/pages/changingOrRefundingDetails/changingOrRefundingDetails'
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
			.content-top {
			 height: 40px;
			 padding: 0 14px;
			 box-sizing: border-box;
			 display: flex;
			 align-items: center;
			 justify-content: space-between;
			 .content-top-left {
				 >text {
					font-size: 14px;
					color: #777575; 
				 }
			 };
			 .content-top-right {
				 width: 84px;
				 height: 27px;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 background: #3B9DF9;
					>text {
						font-size: 12px;
						color: #fff;
						margin-left: 4px;
					}
			 }
			};
			.content-center {
			 width: 97%;
			 padding: 0 6px;
			 box-sizing: border-box;
			 max-height: 564px;
			 margin: 0 auto;
			 border-radius: 6px;
			 background: #F0F2FE;
			 overflow: auto;
			 position: relative;
			 .empty-info {
					width: 100px;
					height: 120px;
					position: absolute;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;
					margin: auto;
					z-index: 100;
			 };
			 .product-list {
				 padding: 10px 0;
				 box-sizing: border-box;
				 border-bottom: 1px solid #BBBBBB;
				 display: flex;
				 align-items: center;
				 .product-left {
					 margin-right: 10px;
					 image {
						 width: 54px;
						 height: 54px;
					 }
				 };
				 .product-center {
					 flex: 1;
					 margin-right: 10px;
					  @include no-wrap;
					 .product-name {
						 @include no-wrap;
						 margin-bottom: 4px;
						 >text {
							 width: 100%;
							 display: inline-block;
							 @include no-wrap;
							 font-size: 14px;
							 color: #3B9DF9;
						 }
					 };
					 .product-specification {
						 display: flex;
						 @include no-wrap;
						 .product-specification-left {
							 margin-right: 10px;
							 >text {
								 font-size: 12px;
								 color: #777575;
							 }
						 };
						 .product-specification-right {
							 flex: 1;
							  @include no-wrap;
							 >text {
								 font-size: 12px;
								 color: #F44E23;
							 }
						 }
					 }
				 };
				 .product-right {
					 display: flex;
					 flex-direction: column;
					 justify-content: center;
					 .product-number-box {
						 margin-bottom: 4px;
						 >text {
							 font-size: 12px;
							 color: #101010;
							 &:nth-child(1) {
								 margin-right: 10px;
							 }
						 }
					 };
					 .product-total-price {
						 text-align: center;
						 >text {
							 font-size: 12px;
							 color: #101010;
							 &:nth-child(1) {
							 		margin-right: 10px;
							 };
							 &:nth-child(2) {
							 	 color: #F44E23;							
							 }
						 }
					 }
				 }
			 }
			};
			.total-prices {
			 width: 97%;
			 height: 40px;
			 padding: 0 6px;
			 box-sizing: border-box;
			 display: flex;
			 align-items: center;
			 justify-content: flex-end;
			 margin: 0 auto;
			 .total-prices-right {
				>text {
				 font-size: 14px;
				 color: #E86F50;
				 &:nth-child(1) {
					 margin-right: 4px;
				 }
				} 
			 }
			};
			.order-message {
				margin: 10px 0;
				padding: 0 6px;
				box-sizing: border-box;
				.create-delivery-date {
					 display: flex;
					 align-items: center;
					 margin-top: 10px;
					 .create-delivery-date-left {
						 flex: 1;
						 width: 0;
						 display: flex;
						 align-items: center;
						 >text {
							 display: inline-block;
							 font-size: 12px;
							 &:nth-child(1) {
								 color: #9E9E9A;
								 margin-right: 6px;
							 };
							 &:nth-child(2) {
								 @include no-wrap;
								 flex: 1;
								 color: #101010;
							 }
						 }
					 };
					 .create-delivery-date-right {
						 flex: 1;
						 width: 0;
						 display: flex;
						 align-items: center;
						 >text {
							 display: inline-block;
							 font-size: 12px;
							 &:nth-child(1) {
								 color: #9E9E9A;
								 margin-right: 6px;
							 };
							 &:nth-child(2) {
								 @include no-wrap;
								 flex: 1;
								 color: #101010;
							 }
						 }
					 }
				};
				.remark-box {
					display: flex;
					margin-top: 10px;
					>text {
						 display: inline-block;
						 font-size: 12px;
						 &:nth-child(1) {
							 color: #9E9E9A;
							 margin-right: 6px;
						 };
						 &:nth-child(2) {
							 word-break: break-all;
							 flex: 1;
							 color: #000000 !important;
						 }
					}
				}	
			};
			.delivery-information-list {
				padding: 0 3px;
				box-sizing: border-box;
				margin-bottom: 10px;
				.delivery-information-text {
					margin-bottom: 6px;
					padding: 0 3px;
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
					padding: 6px 3px;
					box-sizing: border-box;
					display: flex;
					justify-content: space-between;
					align-items: center;
					.delivery-information-left {
						flex: 1;
						width: 0;
						display: flex;
						flex-direction: column;
						justify-content: center;
						.delivery-number-message {
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 10px;
							.delivery-number {
								flex: 1;
								margin-right: 10px;
								width: 0;
								display: flex;
								align-items: center;
								>text {
									font-size: 14px;
									color: #101010;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										@include no-wrap;
										flex: 1;
									}
								}
							};
							.harvest-date {
								flex: 1;
								width: 0;
								display: flex;
								align-items: center;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										@include no-wrap;
										flex: 1;
									}
								}
							}
						};
						.related-order-number-message {
							display: flex;
							align-items: center;
							justify-content: space-between;
							.related-order-number {
								flex: 1;
								margin-right: 10px;
								width: 0;
								display: flex;
								align-items: center;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										@include no-wrap;
										flex: 1;
									}
								}
							};
							.delivery-date {
								flex: 1;
								width: 0;
								display: flex;
								align-items: center;
								>text {
									font-size: 12px;
									color: #777575;
									&:nth-child(1) {
										margin-right: 4px;
									};
									&:nth-child(2) {
										@include no-wrap;
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
					.order-status-record-list {
						display: flex;
						padding-bottom: 10px;
						box-sizing: border-box;
						position: relative;
						.order-status-record-list-line {
							position: absolute;
							top: 11px;
							left: 6px;
							width: 1px;
							height: 100%;
							background: rgba(59,157,249,0.19);
						};
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
		}
	}
</style>
