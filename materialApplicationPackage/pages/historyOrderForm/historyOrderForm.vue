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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="历史订单" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="status-date-box">
				<view class="data-box">
					<view class="date-text">
						<text>日期:</text>
					</view>
					<view class="date-choose" @click="showCalendar = true">
						<text>{{ startDate }}</text>
						<u-icon name="arrow-rightward" color="#CACACA" size="18" /></u-icon>
						<text>{{ endDate }}</text>
						<u-icon name="calendar" color="#CACACA" size="20" /></u-icon>
					</view>
				</view>
			</view>
			<view class="order-list-box">
				<u-empty text="您还没有相关订单" mode="list" v-if="isShowNoData"></u-empty>
				<scroll-view class="scroll-view" scroll-y="true"  @scrolltolower="scrolltolower">
					<view class="order-list" v-for="(item,index) in fullOrderList" :key="index" @click="enterOrderDetailsEvent(item,index)">
						<view class="order-list-top">
							<view class="order-type">
								<text>{{ item.orderTypeName }}</text>
								<text>{{ item.no }}</text>
							</view>
							<view class="order-status">
								<text>{{ stateTransfer(item.status) }}</text>
							</view>
						</view>
						<view class="order-list-center">
							<view class="product-list">
								<text>产品清单:</text>
								<text>{{ extractProductInventoryMessage(item['items']) }}</text>
							</view>
							<view class="create-delivery-date">
								<view class="create-delivery-date-left">
									<text>创建时间:</text>
									<text>{{ item.createTime }}</text>
								</view>
								<view class="create-delivery-date-right">
									<text>交货日期:</text>
									<text>{{ item.orderTime }}</text>
								</view>
							</view>
							<view class="delivery-address">
								<text>送货地址:</text>
								<text>{{ item.address }}</text>
							</view>
							<view class="remark-box">
								<text>备注:</text>
								<text>{{ item.remark ? item.remark : '无' }}</text>
							</view>
						</view>
						<view class="order-list-bottom">
							<view class="order-list-btn">
								<view class="edit-right" @click.stop="evaluateEvent(item,index)">
									<text>{{ item.evaluate ? '查看评价' : '评价'}}</text>
								</view>
							</view>
						</view>
					</view>
					<u-loadmore :status="status" v-if="fullOrderList.length > 0" />
				</scroll-view>
			</view>
		</view>
		<!-- 评价弹框	 -->
		<view class="evaluate-modal">
			<u-modal :show="evaluateModalShow" :showConfirmButton="false">
				<view class="evaluate-model-content">
					<view class="evaluate-modal-top">
						<text>评价</text>
						<u-icon name="close" color="#101010" size="20" @click="evaluateModalShow = false"></u-icon>
					</view>
					<view class="evaluate-modal-center">
						<view class="score-box">
							<view class="score-text">
								<text>评分:</text>
							</view>
							<view class="score-content">
								<u-rate v-if="evaluateModalShow" gutter="10" :count="scoreCount" size="26" active-color="#F2A15F" v-model="scoreValue"></u-rate>
							</view>
						</view>
						<view class="evaluate-box">
							<view class="evaluate-text">
								<text>评价:</text>
							</view>
							<view class="evaluate-content">
								<u--textarea v-model="evaluateValue" placeholder="请输入" ></u--textarea>
							</view>
						</view>
					</view>
					<view class="evaluate-modal-bottom">
						<view class="evaluate-modal-btn">
							<view class="cancel-left" @click.stop="evaluateModalCancelEvent">
								<text>取消</text>
							</view>
							<view class="submit-right" @click.stop="evaluateModalSubmitEvent">
								<text>提交</text>
							</view>
						</view>
					</view>
				</view>
			</u-modal>
		</view>
		<!-- 查看评价弹框	 -->
		<view class="evaluate-modal view-evaluate-modal">
			<u-modal :show="viewEvaluateModalShow" :showConfirmButton="false">
				<view class="evaluate-model-content">
					<view class="evaluate-modal-top">
						<text>评价</text>
						<u-icon name="close" color="#101010" size="20" @click="viewEvaluateModalShow = false"></u-icon>
					</view>
					<view class="evaluate-modal-center">
						<view class="score-box">
							<view class="score-text">
								<text>评分:</text>
							</view>
							<view class="score-content">
								<u-rate v-if="viewEvaluateModalShow" gutter="10" :count="viewScoreCount" size="26" readonly active-color="#F2A15F" v-model="viewScoreCount"></u-rate>
							</view>
						</view>
						<view class="evaluate-box">
							<view class="evaluate-text">
								<text>评价:</text>
							</view>
							<view class="evaluate-content">
								{{ viewScoreValue }}
							</view>
						</view>
					</view>
					<view class="evaluate-modal-bottom">
						<view class="evaluate-modal-btn">
							<view class="close-center" @click.stop="viewEvaluateModalShow = false">
								<text>关闭</text>
							</view>
						</view>
					</view>
				</view>
			</u-modal>
		</view>
		<!-- 日历 -->
		<u-calendar color="#11D183" monthNum="12" minDate="2026-01-01" maxDate="2028-01-01" :show="showCalendar" :defaultDate="defaultDateArr" mode="range" @confirm="calendarConfirm" @close="showCalendar = false"></u-calendar>
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
		getDate
	} from '@/common/js/utils'
	import store from '@/store'
	import SOtime from '@/common/js/utils/SOtime.js';
	import { getPlanOrderPage, createOrderEvaluate, getOrderEvaluate } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
				isShowNoData: false,
				currentPageNum: 1,
				pageSize: 20,
				totalCount: 0,
				status: 'nomore',
				showCalendar: false,
				currentOrderId: '',
				currentOrderNo: '',
				currentOrderIndex: 0,
				evaluateModalShow: false,
				viewEvaluateModalShow: false,
				viewScoreCount: 0,
				viewScoreValue: 0,
				scoreCount: 5,
				scoreValue: 0,
				evaluateValue: '',
				defaultDateArr: [],
				startDate: '',
				endDate: '',
				orderList: [],
				fullOrderList: []
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
		
		onLoad () {
			this.resetStatus();
			this.getDateRange();
			this.getPlanOrderPageEvent({
				pageNo: this.currentPageNum,
				pageSize: this.pageSize,
			  status: 50,
				orderTime: [`${this.startDate}`,`${this.endDate}`],
				creator: '' // this.userAccount
			},true)
		},
		methods: {
			...mapMutations([
			]),
			
			// 重置状态
			resetStatus () {
				this.currentPageNum = 1
			},
			
			// 上拉加载数据
			scrolltolower () {
				let totalPage = Math.ceil(this.totalCount/this.pageSize);
				if (this.currentPageNum >= totalPage) {
					this.status = 'nomore'
				} else {
					this.status = 'loadmore';
					this.currentPageNum = this.currentPageNum + 1;
					this.getPlanOrderPageEvent({
						pageNo: this.currentPageNum,
						pageSize: this.pageSize,
						status: this.currentStatusValue,
						orderTime: [`${this.startDate}`,`${this.endDate}`],
						creator: '' // this.userAccount
					},false)
				}
			},
			
			
			// 查询订单列表
			getPlanOrderPageEvent(data,flag) {
				this.orderList = [];
				this.isShowNoData = false;
				if (flag) {
					this.fullOrderList = [];
					this.showLoadingHint = true;
					this.infoText = '加载中···';
				} else {
					this.showLoadingHint = false;
					this.infoText = '';
					this.status = 'loading';
				};
				getPlanOrderPage(data).then((res) => {
					if ( res && res.data.code == 0) {
						this.orderList = res.data.data.list;
						this.totalCount = res.data.data.total;
						this.orderList.forEach((item)=>{
							item.createTime = item.createTime ? SOtime.time3(item.createTime) : '';
							item.orderTime = item.orderTime ? SOtime.time8(item.orderTime) : '';
						});
						this.fullOrderList = this.fullOrderList.concat(this.orderList);
						if (this.fullOrderList.length == 0) {
							this.isShowNoData = true
						} else {
							this.isShowNoData = false
						};
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'bottom'
						})
					};
					if (flag) {
						this.infoText = '';
						this.showLoadingHint = false;
					} else {
						let totalPage = Math.ceil(this.totalCount/this.pageSize);
						if (this.currentPage >= totalPage) {
							this.status = 'nomore'
						} else {
							this.status = 'loadmore';
						}	
					}
				})
				.catch((err) => {
					if (flag) {
						this.infoText = '';
						this.showLoadingHint = false;
					} else {
						this.status = 'loadmore'
					};
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'bottom'
					})
				})
			},
			
			// 评价弹框取消事件
			evaluateModalCancelEvent() {
				this.evaluateModalShow = false;
			},
			
			// 评价弹框提交事件
			evaluateModalSubmitEvent() {
				this.evaluateModalShow = false;
				this.createOrderEvaluateEvent({
					orderId: this.currentOrderId, //销售订单编号
					content: this.evaluateValue, // 评分内容
					score: this.scoreValue // 评分
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
						case 50:
								return '已完成'
								break;
				} 
			},
			
			// 提取产品清单信息
			extractProductInventoryMessage (items) {
				if (items.length == 0) {
					return ''
				};
				let temporaryArray = [];
				for (let item of items) {
					temporaryArray.push(item.productName);
				};
				return temporaryArray.join("、")
			},
			
			// 日历日期选择确认事件
			calendarConfirm(e) {
				this.showCalendar = false;
				this.startDate = e[0];
				this.endDate = e[e.length - 1];
				this.currentPageNum = 1;
				this.getPlanOrderPageEvent({
					pageNo: this.currentPageNum,
					pageSize: this.pageSize,
				  status: 50,
					orderTime: [`${this.startDate}`,`${this.endDate}`],
					creator: '' // this.userAccount
				},true)
			},
			
			// 将时间戳转换为当天的 00:00:00
			normalizeTimestamp () {
			  const date = new Date();
			  date.setHours(0, 0, 0, 0);
			  return Number(date)
			},
	    
			// 获取开始和结束日期(中间相隔一个月)
		  getDateRange() {
				this.defaultDateArr = [];
				const end = new Date(); 
				const start = new Date(end);
				start.setMonth(end.getMonth() - 1);
				start.setHours(23, 59, 59, 999);
				this.startDate = this.formatDate(start);
				this.endDate = this.formatDate(end);
				this.defaultDateArr.push(this.startDate);
				this.defaultDateArr.push(this.endDate)
			},
			
			formatDate(date) {
			  const y = date.getFullYear();
			  const m = String(date.getMonth() + 1).padStart(2, '0');
			  const d = String(date.getDate()).padStart(2, '0');
			  return `${y}-${m}-${d}`;
			},
			
			//进入历史订单详情事件
			enterOrderDetailsEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/orderDetails/orderDetails?id=${item.id}`
				})
			},
			
			// 订单评价事件
			evaluateEvent(item,index) {
				this.currentOrderIndex = index;
				this.currentOrderId = item['id'];
				this.currentOrderNo = item['no'];
				if (!item.evaluate) {
					this.scoreValue = '';
					this.evaluateModalShow = true;
				} else {
					this.viewEvaluateEvent()
				}
			},
			
			// 查看评价事件
			viewEvaluateEvent() {
				this.getOrderEvaluateEvent({
					orderId: this.currentOrderId, //销售订单编号
					id: ''
				})
			},
			
			// 创建订单评价
			createOrderEvaluateEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '提交中···';
				createOrderEvaluate(data).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if ( res && res.data.code == 0) {
						this.fullOrderList.forEach((item,index)=>{
							if (this.currentOrderIndex == index) {
								item['evaluate'] = true;
							}
						});
						this.$refs.uToast.show({
							message: '评价成功!',
							type: 'success',
							position: 'bottom'
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
			
			// 获取订单评价信息
			getOrderEvaluateEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '加载中···';
				getOrderEvaluate(data).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 0) {
						this.viewScoreValue = res.data.data['content'];
						this.viewScoreCount = res.data.data['score'];
						this.viewEvaluateModalShow = true;
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
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
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
		.evaluate-modal {
			::v-deep .u-modal {
				.u-modal__content {
					padding: 0 !important;
					.evaluate-model-content {
						width: 100%;
						.evaluate-modal-top {
							height: 37px;
							display: flex;
							align-items: center;
							justify-content: space-between;
							padding: 0 10px;
							box-sizing: border-box;
							background: #F6F9FB;
							>text {
								font-size: #101010;
								color: 14px;
							}
						};
						.evaluate-modal-center {
							padding: 10px 40px;
							box-sizing: border-box;
							.score-box {
								display: flex;
								margin-bottom: 20px;
								.score-text {
									margin-right: 10px;
									>text {
										font-size: #101010;
										color: 14px;
									}
								};
								.score-content {
									.u-rate {
										.u-rate__content {
										}
									}
								}
							};
							.evaluate-box {
								display: flex;
								justify-content: space-between;
								.evaluate-text {
									margin-right: 10px;
									>text {
										font-size: #101010;
										color: 14px;
									}
								};
								.evaluate-content {
									flex: 1;
								}
							}
						};
						.evaluate-modal-bottom {
							padding: 15px 70px;
							box-sizing: border-box;
							display: flex;
							align-items: center;
							.evaluate-modal-btn {
							 width: 100%;
							 display: flex;
							 align-items: center;
							 justify-content: space-between;
								.cancel-left {
									 width: 74px;
									 height: 28px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 border: 1px solid #BBBBBB;
									 box-sizing: border-box;
									 border-radius: 5px;
									 >text {
										 font-size: 12px;
										 color: #BBBBBB;
									 }
								};
								.submit-right {
									 width: 74px;
									 height: 28px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 background: #11D183;
									 border-radius: 5px;
									 >text {
										 font-size: 12px;
										 color: #fff
									 }
								}
							}
						}
					}
				}
			}
		};
		.view-evaluate-modal {
			.evaluate-modal-btn {
			 justify-content: center !important;
				.close-center {
					 width: 74px;
					 height: 28px;
					 display: flex;
					 align-items: center;
					 justify-content: center;
					 border: 1px solid #BBBBBB;
					 box-sizing: border-box;
					 border-radius: 5px;
					 >text {
						 font-size: 12px;
						 color: #BBBBBB;
					 }
				}
			}
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
			 flex: 1;
			 height: 0;
			 overflow: auto;
			 padding: 0px 10px 10px 10px;
			 box-sizing: border-box;
			 position: relative;
			 background: #fff;
			 display: flex;
			 flex-direction: column;
			 .status-date-box {
				 display: flex;
				 align-items: center;
				 margin-top: 10px;
				 .data-box {
					 width: 70%;
					 display: flex;
					 align-items: center;
					 .date-text {
						 font-size: 12px;
						 color: #101010;
						 margin-right: 4px;
					 };
					 .date-choose {
						 flex: 1;
						 display: flex;
						 align-items: center;
						 justify-content: space-between;
						 padding: 0 4px;
						 box-sizing: border-box;
						 height: 24px;
						 border: 1px solid #BBBBBB;
						 border-radius: 3px;
						 font-size: 12px;
						 color: #101010;
					 }
				 }
			 };
			 .order-list-box {
				 flex: 1;
				 overflow: auto;
				 padding-bottom: 10px;
				 box-sizing: border-box;
				 position: relative;
				 ::v-deep .u-empty {
				 	position: absolute;
				 	top: 50%;
				 	left: 50%;
				 	transform: translate(-50%,-50%)
				 };
				 .scroll-view {
				 		height: 100%
				 };
				 .order-list {
					 padding: 0 6px 20px 6px;
					 box-sizing: border-box;
					 background-color: rgba(255,255,255,1);
					 box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.23);
					 border-radius: 7px;
					 margin-bottom: 10px;
					 &:nth-child(1) {
							margin-top: 10px;
					 };
					 .order-list-top {
						 display: flex;
						 height: 50px;
						 align-items: center;
						 justify-content: space-between;
						 padding: 0 6px;
						 box-sizing: border-box;
						 border-bottom: 1px solid rgba(0,0,0,0.23);
						 .order-type {
							 flex: 1;
							 margin-right: 10px;
							 @include no-wrap;
							 >text {
								 font-size: 16px;
								 color: #289E8E
							 }
						 };
						 .order-status {
							 display: flex;
							 height: 40px;
							 align-items: center;
							 justify-content: center;
							 width: 67px;
							 height: 25px;
							 background: rgba(154,154,151,0.16);
							 border-radius: 4px;
							 >text {
								 font-size: 14px;
								 color: #101010;
							 }
						 }
					 };
					 .order-list-center {
						 margin: 10px 0;
						 padding: 0 6px;
						 box-sizing: border-box;
						 .product-list {
							 display: flex;
							 >text {
								 display: inline-block;
								 font-size: 14px;
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
						 .create-delivery-date {
							 display: flex;
							 margin-top: 10px;
							 .create-delivery-date-left {
								 flex: 1;
								 width: 0;
								 display: flex;
								 margin-right: 6px;
								 >text {
									 display: inline-block;
									 font-size: 14px;
									 &:nth-child(1) {
										 color: #9E9E9A;
										 margin-right: 6px;
									 };
									 &:nth-child(2) {
										 word-break: break-all;
										 flex: 1;
										 color: #101010;
									 }
								 }
							 };
							 .create-delivery-date-right {
								 flex: 1;
								 width: 0;
								 display: flex;
								 >text {
									 display: inline-block;
									 font-size: 14px;
									 &:nth-child(1) {
										 color: #9E9E9A;
										 margin-right: 6px;
									 };
									 &:nth-child(2) {
										 word-break: break-all;
										 flex: 1;
										 color: #101010;
									 }
								 }
							 }
						 };
						 .delivery-address {
							 display: flex;
							 margin-top: 10px;
							 >text {
								 display: inline-block;
								 font-size: 14px;
								 &:nth-child(1) {
										 color: #9E9E9A;
										 margin-right: 6px;
								 };
								 &:nth-child(2) {
										 flex: 1;
										 word-break: break-all;
										 color: #101010;
								 }
							 }
						 };
						 .remark-box {
								 display: flex;
								 margin-top: 10px;
								 >text {
										 display: inline-block;
										 font-size: 14px;
										 &:nth-child(1) {
												 color: #9E9E9A;
												 margin-right: 6px;
										 };
										 &:nth-child(2) {
												 flex: 1;
												 word-break: break-all;
												 color: #9E9E9A;
										 }
								 }
						 }
					 };
					 .order-list-bottom {
						 display: flex;
						 align-items: center;
						 justify-content: flex-end;
						 .order-list-btn {
							 display: flex;
							 align-items: center;
								.edit-right {
									 width: 65px;
									 height: 28px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 background: #11D183;
									 border-radius: 4px;
									 margin-right: 10px;
									 >text {
										 font-size: 12px;
										 color: #fff
									 }
								}
						 }
					 }
				 }
			 }
		}
	}
</style>
