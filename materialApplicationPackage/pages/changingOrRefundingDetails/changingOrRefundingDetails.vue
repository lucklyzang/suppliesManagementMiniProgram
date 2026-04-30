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
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="退换货" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="delivery-number">
				<text>送货单号:</text>
				<text>{{ saleReturnOrderDetailsList.no }}</text>
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
							<text>{{ item.productStandard ? item.productStandard : '' }}</text>
						</view>
						<view class="deliver-number-content">
							<text>{{ item.count }}</text>
						</view>
						<view class="sales-return-content">
							 <u--input
							 :disabled="saleReturnOrderMessage.status != 21"
							  border="none"
								type="number"
								@input="salesReturnInput(item, index, $event)"
							  v-model="item.returnCount"
							  ></u--input>
						</view>
						<view class="barter-content">
							 <u--input
							 :disabled="saleReturnOrderMessage.status != 21"
							  border="none"
								type="number"
								@input="barterInput(item, index, $event)"
							  v-model="item.exchangeCount"
							  ></u--input>
						</view>
						<view class="unit-content">
							<text>{{ item.productUnitName }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="exchange-reason" v-if="saleReturnOrderMessage.status == 21">
				<view class="exchange-reason-left">
					<text class="exchange-reason-text-one" v-if="isExceedStockQuantity">*</text>
					<text class="exchange-reason-text-two">退换原因:</text>
				</view>
				<view class="exchange-reason-right">
					<u--textarea v-model="exchangeReason" placeholder="请输入退换原因" border="none"></u--textarea>
				</view>
			</view>
		</view>
		<view class="bottom-btn" v-if="saleReturnOrderMessage.status == 21">
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
	import SOtime from '@/common/js/utils/SOtime.js';
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
				isExceedStockQuantity: false,
				exchangeReason: '',
				saleReturnOrderDetailsList: {
					items: []
				},
				saleReturnOrderMessage: {}
			}
		},
		watch: { 
		    'saleReturnOrderDetailsList.items': {
					handler(newVal, oldVal) {
						if (newVal.length > 0) {
							if (Number(newVal[0]['returnCount']) > 0 || Number(newVal[0]['exchangeCount']) > 0) {
								this.isExceedStockQuantity = true;
							} else {
								this.isExceedStockQuantity = false;
							}
						}	
					},
					deep: true,
					immediate: true
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
			
			extractNeedArr (notNeedKey,targetArray) {
				let needArr = [];
				// const newUsers = targetArray.map(({ notNeedKey, ...rest }) => rest );
				const newArray = targetArray.map(obj =>
				  Object.fromEntries(
				    Object.entries(obj).filter(([key]) => key !== notNeedKey)
				  )
				);
				for (let item of newArray) {
					needArr.push({
						count: item.hasOwnProperty('exchangeCount') ? Number(item.exchangeCount) : Number(item.returnCount),
						outItemId: item.id,
						orderItemId: item.orderItemId,
						productId: item.productId,
						productPrice: item.productPrice,
						productUnitId: item.productUnitId,
						remark: item.remark,
						taxPercent: item.taxPercent,
						warehouseId: item.warehouseId
					})
				};
				return needArr;
			},
			
			// 取消事件
			cancelEvent () {},
			
			// 退货input框值变化事件
			salesReturnInput(item,index,val) {
				// 退货货总数不能大于发货数
				if (Number(val) + Number(item.exchangeCount) > Number(item.count)) {
					this.$set(this.saleReturnOrderDetailsList['items'][index],'returnCount',Number(item.count) - Number(item.exchangeCount));
				} else {
					this.$set(this.saleReturnOrderDetailsList['items'][index],'returnCount',val)
				}
			},
			
			// 换货input框值变化事件
			barterInput(item, index,val) {
				// 退货货总数不能大于发货数
				if (Number(val) + Number(item.returnCount) > Number(item.count)) {
					this.$set(this.saleReturnOrderDetailsList['items'][index],'exchangeCount',Number(item.count) - Number(item.returnCount));
				} else {
					this.$set(this.saleReturnOrderDetailsList['items'][index],'exchangeCount',val);
				}
			},
			
			// 查询出库单详情
			getSaleReturnEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '加载中···';
				this.saleReturnOrderDetailsList = {
					items: []
				};
				getSaleReturn(data).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if ( res && res.data.code == 0) {
						this.saleReturnOrderDetailsList = res.data.data;
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
				return new Promise((resolve,reject) => {
					createSaleReturn(data).then((res) => {
						this.loadingText = '';
						this.showLoadingHint = false;
						if ( res && res.data.code == 0) {
							if (res.data.data) {
								resolve(res.data.data);
							} else {
								reject(res.data.msg)
							}
						} else {
							reject(res.data.msg)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
			
			// 提交事件
			submitEvent () {
				let	isAllSaleReturnZero,isAllBarterOrderZero;
				let questArr = [];
				isAllSaleReturnZero = this.saleReturnOrderDetailsList['items'].every((item) => { return item.returnCount == 0});
				isAllBarterOrderZero = this.saleReturnOrderDetailsList['items'].every((item) => { return item.exchangeCount == 0});
				if (isAllSaleReturnZero && isAllBarterOrderZero) {
					this.$refs.uToast.show({
						message: '退换货不能全部为0!',
						type: 'error'
					});
					return
				};
				if (this.isExceedStockQuantity) {
					if (this.exchangeReason === '') {
						this.$refs.uToast.show({
							message: '退换货理由不能为空',
							type: 'error'
						});
						return
					}
				};
				let baseMessage = {
					returnTime: new Date().getTime(), //退换货时间
					remark: this.exchangeReason, //退换货原因
					orderId: Number(this.saleReturnOrderMessage.id), // 运送单编号
					id: ''
				};
				// 退货清单列表
				let saleReturnOrderList = this.saleReturnOrderDetailsList['items'].filter((item) => { return Number(item.returnCount) > 0});
				let alesReturnMessage = Object.assign({},baseMessage,{
					type: 0,
					items: this.extractNeedArr('exchangeCount',saleReturnOrderList)
				});
				// 换货清单列表
				let barterOrderList = this.saleReturnOrderDetailsList['items'].filter((item) => { return Number(item.exchangeCount) > 0});
				let barterMessage = Object.assign({},baseMessage,{
					type: 1,
					items: this.extractNeedArr('returnCount',barterOrderList)
				});
				if (!isAllSaleReturnZero) {
					questArr.push(this.createSaleReturnEvent(alesReturnMessage))
				};
				if (!isAllBarterOrderZero) {
					questArr.push(this.createSaleReturnEvent(barterMessage))
				};
				this.showLoadingHint = true;
				this.infoText = '提交中···';
				Promise.all(questArr)
				.then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if (res && res.length > 0) {
						if (!isAllSaleReturnZero && !isAllBarterOrderZero) { 
							let [item1,item2] = res;
							if (item1 && item2) {
								uni.navigateTo({
									url: '/materialApplicationPackage/pages/submitScuess/submitScuess'
								})
							}
						} else if (!isAllSaleReturnZero || !isAllBarterOrderZero) {
							let [item1] = res;
							if (item1) {
								uni.navigateTo({
									url: '/materialApplicationPackage/pages/submitScuess/submitScuess'
								})
							}
						}
					}
				})
				.catch((err) => {
					this.showLoadingHint = false;
					this.infoText = '';
					this.$refs.uToast.show({
						message: err,
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
				display: flex;
				>text {
					font-size: 14px;
					color: #101010;
					&:nth-child(1) {
						margin-right: 2px;
					};
					&:nth-child(2) {
						flex: 1;
						word-break: break-all;
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
									font-size: 12px !important;
									color: #101010 !important;
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
									font-size: 12px !important;
									color: #101010 !important;
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
						.exchange-reason-text-one {
							color: red;
						};
						.exchange-reason-text-two {
							color: #101010;
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
