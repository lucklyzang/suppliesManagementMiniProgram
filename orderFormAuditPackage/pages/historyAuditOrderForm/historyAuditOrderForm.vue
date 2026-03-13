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
				<view class="order-list" v-for="(item,index) in orderList" :key="index" @click="enterOrderDetailsEvent(item,index)">
					<view class="order-list-top">
						<view class="order-type">
							<text>{{ item.orderType }}</text>
							<text>{{ item.orderNumber }}</text>
						</view>
						<view class="order-status"
						:class="{
							'noStartStyle ' : item.state == 1 || item.state == 2, 
							'underwayStyle' : item.state == 3,
							'waitReviewStyle' : item.state == 4,
							'completeStyle' : item.state == 5,
							'haveReviewStyle' : item.state == 6,
							'cancelStyle' : item.state == 7,
							'reviewStyle' : item.state == 8
							}"
						>
							<text>{{ stateTransfer(item.status) }}</text>
						</view>
					</view>
					<view class="order-list-center">
						<view class="product-list">
							<text>产品清单:</text>
							<text>{{ item.productList }}</text>
						</view>
						<view class="create-delivery-date">
							<view class="create-delivery-date-left">
								<text>创建时间:</text>
								<text>{{ item.createTime }}</text>
							</view>
							<view class="create-delivery-date-left">
								<text>交货日期:</text>
								<text>{{ item.deliveryDate }}</text>
							</view>
						</view>
						<view class="product-list delivery-address">
							<text>送货地址:</text>
							<text>{{ item.deliveryAddress }}</text>
						</view>
						<view class="product-list remark-box">
							<text>备注:</text>
							<text>{{ item.remark }}</text>
						</view>
					</view>
					<view class="order-list-bottom">
						<view class="order-list-btn">
							<view class="edit-right">
								<text>通过</text>
							</view>
						</view>
					</view>
				</view>
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
				showCalendar: false,
				defaultDateArr: [],
				startDate: '',
				endDate: '',
				orderList: [
					{
						orderType: '计划订单',
						orderNumber: '5552H5552',
						status: 0,
						productList: 'XXX、XXX、XXXX',
						createTime: '05-31 17:21',
						deliveryDate: '05-31',
						deliveryAddress: '检验科',
						remark: '一周一送'
					},
					{
						orderType: '计划订单',
						orderNumber: '5552H5552',
						status: 1,
						productList: 'XXX、XXX、XXXX',
						createTime: '05-31 17:21',
						deliveryDate: '05-31',
						deliveryAddress: '检验科',
						remark: '一周一送'
					},
					{
						orderType: '计划订单',
						orderNumber: '5552H5552',
						status: 2,
						productList: 'XXX、XXX、XXXX',
						createTime: '05-31 17:21',
						deliveryDate: '05-31',
						deliveryAddress: '检验科',
						remark: '一周一送'
					},
					{
						orderType: '计划订单',
						orderNumber: '5552H5552',
						status: 3,
						productList: 'XXX、XXX、XXXX',
						createTime: '05-31 17:21',
						deliveryDate: '05-31',
						deliveryAddress: '检验科',
						remark: '一周一送'
					}
				]
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
		
		onShow () {
			this.getDateRange();
		},
		methods: {
			...mapMutations([
			]),
			
			//任务状态转换
			stateTransfer (num) {
				switch(num) {
						case 0:
							return '未分配'
							break;
						case 1:
								return '未查阅'
								break;
						case 2:
								return '未开始'
								break;
						case 3:
								return '进行中'
								break;
						case 4:
								return '待复核'
								break;
						case 5:
								return '已完成'
								break;
						case 6:
								return '已复核'
								break;
						case 7:
								return '已取消'
								break
						case 8:
								return '复核中'
								break
				} 
			},
			
			// 日历日期选择确认事件
			calendarConfirm(e) {
				this.showCalendar = false;
				this.startDate = e[0];
				this.endDate = e[e.length - 1]
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
			  const start = new Date(); 
			  const end = new Date(start);
			  end.setMonth(start.getMonth() + 1);
			  end.setHours(23, 59, 59, 999);
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
			
			//进入订单详情事件
			enterOrderDetailsEvent(item,index) {
				uni.navigateTo({
					url: '/materialApplicationPackage/pages/orderDetails/orderDetails'
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
							 background: rgba(232,203,81,0.16);
							 border-radius: 4px;
							 >text {
								 font-size: 14px;
								 color: #E8CB51;
							 }
						 };
						 .noStartStyle {
						 	background: #BBBBBB !important
						 };
						 .underwayStyle {
						 	background: #289E8E !important
						 };
						 .completeStyle {
						 	background: #242424 !important
						 };
						 .reviewStyle {
						 	background: #F2A15F !important
						 };
						 .haveReviewStyle {
						 	background: #9B7D31 !important
						 };
						 .waitReviewStyle {
						 	background: orange !important
						 };
						 .cancelStyle {
						 	background: #E8CB51 !important
						 };
						 .completeStyle {
						 	background: #101010 !important
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
								 align-items: center;
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
							 .create-delivery-date-right {
								 flex: 1;
								 width: 0;
								 display: flex;
								 align-items: center;
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
