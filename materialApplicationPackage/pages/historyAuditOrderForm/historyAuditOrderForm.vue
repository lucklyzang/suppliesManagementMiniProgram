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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="历史" @backClick="backTo">
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
							<view class="product-list delivery-address">
								<text>送货地址:</text>
								<text>{{ item.address }}</text>
							</view>
							<view class="product-list remark-box">
								<text>备注:</text>
								<text>{{ item.remark ? item.remark : '无' }}</text>
							</view>
						</view>
						<view class="order-list-bottom">
							<view class="order-list-btn">
								<view class="edit-right">
									<text>{{ item.status == 20 ? '通过' : '不通过' }}</text>
								</view>
							</view>
						</view>
					</view>
					<u-loadmore :status="status" v-if="fullOrderList.length > 0" />
				</scroll-view>
			</view>
		</view>
		<!-- 日历 -->
		<u-calendar minDate="2026-03-01" :show="showCalendar" :defaultDate="defaultDateArr" mode="range" @confirm="calendarConfirm" @close="showCalendar = false"></u-calendar>
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
	import { modificationPassword } from '@/api/login.js'
	import { getPlanOrderPage } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
				currentStatusValue: '',
				currentPageNum: 1,
				pageSize: 20,
				totalCount: 0,
				status: 'nomore',
				currentOrderId: '',
				currentOrderIndex: 0,
				showCalendar: false,
				defaultDateArr: [],
				startDate: '',
				endDate: '',
				needQueryStatusList: [20,21],
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
		
		onShow () {
			this.resetStatus();
			this.getDateRange();
			this.getPlanOrderPageEvent({
				pageNo: this.currentPageNum,
				pageSize: this.pageSize,
				status: this.currentStatusValue,
				statusList: this.needQueryStatusList,
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
							item.createTime = SOtime.time3(item.createTime);
							item.orderTime = SOtime.time8(item.orderTime);
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
			
			//任务状态转换
			stateTransfer (num) {
				switch(num) {
						case 10:
							return '待审核'
							break;
						case 20:
								return '已审核'
								break;
						case 21:
								return '已审核'
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
						statusList: this.needQueryStatusList,
						orderTime: [`${this.startDate}`,`${this.endDate}`],
						creator: '' // this.userAccount
					},false)
				}
			},
			
			// 日历日期选择确认事件
			calendarConfirm(e) {
				this.showCalendar = false;
				this.startDate = e[0];
				this.endDate = e[e.length - 1];
				this.getPlanOrderPageEvent({
					pageNo: this.currentPageNum,
					pageSize: this.pageSize,
				  status: this.currentStatusValue,
					statusList: this.needQueryStatusList,
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
			
			//进入订单详情事件
			enterOrderDetailsEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/orderDetails/orderDetails?id=${item.id}`
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
				 box-sizing: border-box;
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
							 background: rgba(59,157,249,0.15);
							 border-radius: 4px;
							 >text {
								 font-size: 14px;
								 color: #3B9DF9;
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
									 word-break: break-all;
									 flex: 1;
									 color: #101010;
								 }
							 }
						 };
						 .create-delivery-date {
							 display: flex;
							 align-items: center;
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
							 margin-top: 10px;
						 };
						 .remark-box {
							 margin-top: 10px;
							 >text {
								 &:nth-child(2) {
									 color: #9E9E9A !important;
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
									 background: #9E9E9A;
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
