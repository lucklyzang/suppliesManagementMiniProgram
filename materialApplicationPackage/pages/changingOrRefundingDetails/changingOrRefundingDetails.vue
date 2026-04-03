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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="退换货" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="delivery-number">
				<text>送货单号:</text>
				<text>{{ saleReturnOrderDetailsList.id }}</text>
			</view>
			<view class="delivery-table">
				<view class="delivery-table-title">
					<view class="product-cell">
						<text>产品</text>
					</view>
					<view class="specification-cell">
						<text>规格型号</text>
					</view>
					<view class="deliver-number-cell">
						<text>发货数</text>
					</view>
					<view class="sales-return-cell">
						<text>退货数</text>
					</view>
					<view class="barter-cell">
						<text>换货数</text>
					</view>
					<view class="unit-cell">
						<text>单位</text>
					</view>
				</view>
				<view class="delivery-list-box">
					<view class="delivery-list" v-for="(item,index) in saleReturnOrderDetailsList['items']" :key="item.id">
						<view class="product-content">
							<text>{{ item.productName }}</text>
						</view>
						<view class="specification-content">
							<text>{{ item.model }}</text>
						</view>
						<view class="deliver-number-content">
							<text>{{ item.count }}</text>
						</view>
						<view class="sales-return-content">
							 <u--input
							    border="none"
									type="digit"
							    v-model="item.alesReturnCount"
							  ></u--input>
						</view>
						<view class="barter-content">
							 <u--input
							    border="none"
									type="digit"
							    v-model="item.barterCount"
							  ></u--input>
						</view>
						<view class="unit-content">
							<text>{{ item.productUnitName }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="exchange-reason">
				<view class="exchange-reason-left">
					<text>*</text>
					<text>退换原因:</text>
				</view>
				<view class="exchange-reason-right">
					<u--textarea v-model="exchangeReason" placeholder="请输入退换原因" border="none"></u--textarea>
				</view>
			</view>
		</view>
		<view class="bottom-btn">
				<view class="cancel-box" @click="cancelEvent">
					<text>取消</text>
				</view>
				<view class="submit-box" @click="submitEvent">
					<text>提交</text>
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
	import { getSaleReturn, createSaleReturn } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
				loadingShow: false,
				exchangeReason: '',
				saleReturnOrderDetailsList: [],
				saleReturnOrderMessage: {}
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
			if (options.transmitParams) {
				try {
					const rawData = decodeURIComponent(options.transmitParams);
					this.saleReturnOrderMessage = JSON.parse(rawData);
					this.getSaleReturnEvent(Number(this.saleReturnOrderMessage.id))
				} catch (e) {
					console.error('参数解析失败', e);
				}
			}
		},
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 取消事件
			cancelEvent () {},
			
			// 查询出库单详情
			getSaleReturnEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '加载中···';
				this.saleReturnOrderDetailsList = [];
				getSaleReturn(data).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if ( res && res.data.code == 0) {
						this.saleReturnOrderDetailsList = res.data.data;
						this.saleReturnOrderDetailsList['item'].forEach((item) => {
							item['alesReturnCount'] = 0;
							item['barterCount'] = 0;
						})
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
			
			// 提交退换货
			createSaleReturnEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '提交中···';
				createSaleReturn(data).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if ( res && res.data.code == 0) {
						if (res.data.data) {
							uni.navigateTo({
								url: '/materialApplicationPackage/pages/submitScuess/submitScuess'
							})
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
			},
			
			// 提交事件
			submitEvent () {
				let temporaryMessage = {
						returnTime: '', //退货时间
						orderId: Number(this.saleReturnOrderMessage.orderId), // 销售订单编号
						id: Number(this.saleReturnOrderMessage.id), // 编号
						items: [] // 退货清单列表
				};
				this.createSaleReturnEvent(temporaryMessage)
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
			padding: 0 0 20px 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			.delivery-number {
				padding: 10px 6px;
				box-sizing: border-box;
				>text {
					font-size: 14px;
					color: #101010;
					&:nth-child(1) {
						margin-right: 2px;
					}
				}
			};
			.delivery-table {
				width: 98%;
				margin: 0 auto;
				flex: 1;
				border-radius: 6px;
				background: #F0F2FE;
				height: 0;
				display: flex;
				flex-direction: column;
				.delivery-table-title {
					height: 30px;
					display: flex;
					flex-wrap: nowrap;
					background: #f5f5f5;
					border-bottom: 1px solid #d8d0d0;
					>view {
						display: flex;
						align-items: center;
						justify-content: center;
						flex: 1;
						height: 30px;
						@include no-wrap;
						>text {
							width: 100%;
							text-align: center;
							display: inline-block;
							@include no-wrap;
							font-size: 12px;
							color: #101010;
						}
					};
					.specification-cell {
						width: 70px !important;
						flex: none !important;
					}
				};
				.delivery-list-box {
					flex: 1;
					overflow: auto;
					.delivery-list {
						height: 30px;
						display: flex;
						flex-wrap: nowrap;
						border-bottom: 1px solid #d8d0d0;
						>view {
							display: flex;
							align-items: center;
							justify-content: center;
							flex: 1;
							height: 30px;
							@include no-wrap;
							>text {
								width: 100%;
								text-align: center;
								display: inline-block;
								@include no-wrap;
								font-size: 12px;
								color: #101010;
							}
						};
						.product-content {
							>text {
								font-weight: bold;
							}
						};
						.specification-content {
							width: 70px !important;
							flex: none !important;
						};
						.sales-return-content {
							::v-deep .u-input {
								width: 70%;
								background: #fff !important;
								flex: none !important;
								.u-input__content__field-wrapper__field {
									text-align: center !important;
								}
							}
						};
						.barter-content {
							::v-deep .u-input {
								width: 70%;
								background: #fff !important;
								flex: none !important;
								.u-input__content__field-wrapper__field {
									text-align: center !important;
								}
							}
						}
					}
				}
			};
			.exchange-reason {
					width: 98%;
					margin: 0 auto;
					background: #fff;
					display: flex;
					flex-direction: column;
					margin-top: 6px;
					font-size: 14px;
					.exchange-reason-left {
						margin-bottom: 6px;
						>text {
							&:nth-child(1) {
								color: red;
							}
							&:nth-child(2) {
								color: #101010;
							}
						}
					};
					.exchange-reason-right {
						width: 96%;
						margin: 0 auto;
						display: flex;
						flex-wrap: wrap;
						/deep/ .u-textarea {
							flex: 1;
							padding:10px 6px 10px 6px;
							color: #101010;
							border: 1px solid #888888;
						}
					}
			}
		};
		.bottom-btn {
			height: 60px;
			width: 94%;
			margin: 0 auto;
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			.cancel-box {
				 width: 45%;
				 height: 32px;
				 border: 1px solid #11D183;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 >text {
					font-size: 12px;
					color: #11D183;
				 }
			};
			.submit-box {
			 width: 45%;
			 height: 32px;
			 display: flex;
			 align-items: center;
			 justify-content: center;
			 border-radius: 4px;
			 background: #11D183;
				>text {
					font-size: 12px;
					color: #fff;
				}
			}
		}
	}
</style>
