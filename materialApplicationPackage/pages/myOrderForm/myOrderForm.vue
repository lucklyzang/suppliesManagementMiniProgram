<template>
	<view class="content-box" @click="handleOutsideClick">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<light-hint ref="alertToast"></light-hint>
		<u-toast ref="uToast" />
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="订单" @backClick="backTo">
				<view slot="right" @click="enterHistoryOrderEvent">
					<text>历史订单</text>
				</view>
			</nav-bar> 
		</view>
		<view class="content">
			<view class="status-date-box">
				<view class="status-box" @click.stop="handleInsideClick">
					<view class="status-text" @click="orderStatusListShow = !orderStatusListShow">
						<text>{{ currentStatusText }}</text>
						<u-icon :name="orderStatusListShow ? 'arrow-down' : 'arrow-up'" color="#101010" size="16" /></u-icon>
					</view>
					<view class="status-list-box" v-if="orderStatusListShow">
						<view class="status-list" v-for="(item,index) in orderStatusList" @click="statusListEvent(item,index)" :key="index">
							<text :class="{'statusTextStyle': index == currentStatusIndex }">{{ item.text }}</text>
						</view>
					</view>
				</view>
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
								<text>计划订单</text>
								<text>{{ item.no }}</text>
							</view>
							<view class="order-status"
							:class="{
								'noPassStyle ' : item.status == 21,
								'stayAuditStyle' : item.status == 10,
								'stayConfirmedStyle' : item.status == 20,
								'alreadyRefuseStyle' : item.status == 31,
								'stayDeliverStyle' : item.status == 30,
								'alreadyDeliverStyle' : item.status == 40,
								'afterSaleIngStyle' : item.status == 41
								}"
							>
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
									<text>{{ item.deliveryDate }}</text>
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
								<view class="delete-left" v-if="item.status == 10 || item.status == 21 || item.status == 31" @click.stop="deleteEvent(item,index)">
									<text>删除</text>
								</view>
								<view class="delete-left" v-if="item.status == 40" @click.stop="changingOrRefundingEvent(item,index)">
									<text>退换货</text>
								</view>
								<view class="edit-right" v-if="item.status == 10 || item.status == 21 || item.status == 31" @click.stop="editEvent(item,index)">
									<text>编辑</text>
								</view>
								<view class="edit-right" v-if="item.status == 40" @click.stop="sureReceivingEvent(item,index)">
									<text>确认收货</text>
								</view>
							</view>
						</view>
					</view>
					<u-loadmore :status="status" v-if="fullOrderList.length > 0" />
				</scroll-view>
			</view>
		</view>
		<!-- 删除提示弹框	 -->
		<view class="evaluate-modal">
			<u-modal :show="deleteShow" :showConfirmButton="false">
				<view class="evaluate-model-content">
					<view class="evaluate-modal-top">
					</view>
					<view class="evaluate-modal-center">
						<view class="evaluate-box">
							<image src="/static/img/delete-info.png" mode="widthFix"></image>
							<text>确定要删除该订单吗?</text>
						</view>
					</view>
					<view class="evaluate-modal-bottom">
						<view class="evaluate-modal-btn">
							<view class="cancel-left" @click.stop="deleteModalCancelEvent">
								<text>取消</text>
							</view>
							<view class="submit-right" @click.stop="deleteModalSureEvent">
								<text>确定</text>
							</view>
						</view>
					</view>
				</view>
			</u-modal>
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
	import { getPlanOrderPage, deletePlanOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
	import navBar from "@/components/zhouWei-navBar"
	import LightHint from "@/components/light-hint/light-hint.vue"
	export default {
		components: {
			navBar,
			LightHint
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				isShowNoData: false,
				currentPageNum: 1,
				pageSize: 20,
				totalCount: 0,
				status: 'nomore',
				currentOrderId: '',
				currentOrderIndex: 0,
				showCalendar: false,
				deleteShow: false,
				defaultDateArr: [],
				startDate: '',
				endDate: '',
				currentStatusText: '全部状态',
				currentStatusValue: '',
				currentStatusIndex: 0,
				orderStatusListShow: false,
				orderStatusList: [
					{
						value: '',
						text: '全部状态'
					},
					{
						value: 10,
						text: '待审核'
					},
					{
						value: 21,
						text: '未通过'
					},
					{
						value: 20,
						text: '待确认'
					},
					{
						value: 31,
						text: '已拒绝'
					},
					{
						value: 30,
						text: '待发货'
					},
					{
						value: 40,
						text: '已发货'
					},
					{
						value: 41,
						text: '售后中'
					}
				],
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
			this.getDateRange();
			this.getPlanOrderPageEvent({
				pageNo: this.currentPageNum,
				pageSize: this.pageSize,
			  status: this.currentStatusValue,
				orderTime: [`${this.startDate}`,`${this.endDate}`],
				creator: ''
			},true)
		},
		methods: {
			...mapMutations([
			]),
			
			// 状态栏以外区域点击
			handleOutsideClick() {
				if (this.orderStatusListShow) {
					this.orderStatusListShow = false;
				}
			},
			
			// 状态栏区域点击
			handleInsideClick() {
			},
			
			// 删除弹框取消事件
			deleteModalCancelEvent () {
				this.deleteShow = false;
			},
			
			// 删除弹框确定事件
			deleteModalSureEvent () {
				this.deleteShow = false;
				this.deletePlanOrderEvent([this.currentOrderId]);
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
						creator: ''
					},false)
				}
			},
			
			// 删除订单
			deletePlanOrderEvent(data) {
				this.showLoadingHint = true;
				this.infoText = '删除中···';
				deletePlanOrder(data).then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if ( res && res.data.code == 0) {
						if (res.data.data) {
							this.fullOrderList.splice(this.currentOrderIndex,1);
							this.$refs.uToast.show({
								message: '删除成功!',
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
						// 不显示已完成的订单
						this.orderList = res.data.data.list.filter((item) => { return item.status != 50});
						// 已完成订单列表(重新计算总条数)
						let completeOrderList = res.data.data.list.filter((item) => { return item.status == 50});
						this.totalCount = res.data.data.total;
						// this.totalCount = this.totalCount - completeOrderList.length;
						this.orderList.forEach((item)=>{
							item.createTime = SOtime.time3(item.createTime)
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
			
			// 进入历史订单事件
			enterHistoryOrderEvent () {
				uni.navigateTo({
					url: '/materialApplicationPackage/pages/historyOrderForm/historyOrderForm'
				})
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
				  status: this.currentStatusValue,
					orderTime: [`${this.startDate}`,`${this.endDate}`],
					creator: ''
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
			
			// 订单列表点击事件
			statusListEvent(item,index) {
				this.currentStatusText = item.text;
				this.currentStatusValue = item.value,
				this.currentStatusIndex = index;
				this.orderStatusListShow = false;
				this.currentPageNum = 1;
				this.getPlanOrderPageEvent({
					pageNo: this.currentPageNum,
					pageSize: this.pageSize,
					status: this.currentStatusValue,
					orderTime: [`${this.startDate}`,`${this.endDate}`],
					creator: ''
				},true)
			},
			
			//进入订单详情事件
			enterOrderDetailsEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/orderDetails/orderDetails?id=${item.id}`
				})
			},
			
			// 订单删除事件
			deleteEvent(item,index) {
				this.deleteShow = true;
				this.currentOrderIndex = index;
				this.currentOrderId = item['id']
			},
			
			// 订单编辑事件
			editEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/materialApplication/materialApplication?id=${item.id}`
				})
			},
			
			// 订单退换货事件
			changingOrRefundingEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/changingOrRefunding/changingOrRefunding?id=${item.id}`
				})
			},
			
			// 订单确认收货事件
			sureReceivingEvent(item,index) {
				uni.navigateTo({
					url: `/materialApplicationPackage/pages/confirmReceipt/confirmReceipt?id=${item.id}`
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
						};
						.evaluate-modal-center {
							padding: 0 40px;
							box-sizing: border-box;
							.evaluate-box {
								display: flex;
								flex-direction: column;
								justify-content: center;
								align-items: center;
								>image {
									width: 50px;
									height: 50px;
									margin-bottom: 15px;
								};
								>text {
									font-size: 14px;
									color: #101010;
								}
							}
						};
						.evaluate-modal-bottom {
							padding: 30px 45px;
							box-sizing: border-box;
							display: flex;
							align-items: center;
							.evaluate-modal-btn {
							 width: 100%;
							 display: flex;
							 align-items: center;
							 justify-content: space-between;
								.cancel-left {
									 width: 100px;
									 height: 35px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 border: 1px solid #11D183;
									 box-sizing: border-box;
									 border-radius: 4px;
									 >text {
										 font-size: 14px;
										 color: #11D183;
									 }
								};
								.submit-right {
									 width: 100px;
									 height: 35px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 background: #11D183;
									 border-radius: 4px;
									 >text {
										 font-size: 14px;
										 color: #fff
									 }
								}
							}
						}
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
			.header_fixed {
				.header_content {
					.header_right_info {
						color: #fff;
						font-size: 14px;
					}
				}
			}
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
				 justify-content: space-between;
				 margin-top: 10px;
				 .status-box {
					 width: 70px;
					 margin-right: 20px;
					 position: relative;
					 .status-text {
						 display: flex;
						 align-items: center;
						 justify-content: space-between;
							>text {
								margin-right: 4px;
								font-size: 12px;
								color: #101010
							}
					 };
					 .status-list-box {
						 width: 70px;
						 background: #fff;
						 position: absolute;
						 z-index: 100;
						 left: 0;
						 top: 20px;
						 max-height: 160px;
						 overflow: auto;
						 .status-list {
							 height: 30px;
							 width: 70px;
							 display: flex;
							 align-items: center;
							 >text {
								 font-size: 12px;
								 color: #101010
							 };
							 .statusTextStyle {
								 color: #7BE9A0 !important;
							 }
						 }
					 }
				 };
				 .data-box {
					 width: 0;
					 display: flex;
					 align-items: center;
					 flex: 1;
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
							 background: rgba(232,203,81,0.16);
							 border-radius: 4px;
							 >text {
								 font-size: 14px;
								 color: #E8CB51;
							 }
						 };
						 .stayAuditStyle {
								background: rgba(232,203,81,0.16) !important;
								>text {
								 color: #E8CB51 !important;
								}
						 };
						 .noPassStyle {
								background: rgba(241,74,51,0.16) !important;
								>text {
								 color: #F14A33 !important;
								}
						 };
						 .stayConfirmedStyle {
								background: rgba(109,122,223,0.21) !important;
								>text {
								 color: #6D7ADF !important;
								}
						 };
						 .alreadyRefuseStyle {
								background: rgba(241,74,51,0.16) !important;
								>text {
								 color: #F14A33 !important;
								}
						 };
						 .stayDeliverStyle {
								background: rgba(59,157,249,0.15) !important;
								>text {
								 color: #3B9DF9 !important;
								}
						 };
						 .alreadyDeliverStyle {
								background: rgba(40,158,142,0.21) !important;
								>text {
								 color: #289E8E !important;
								}
						 };
						 .afterSaleIngStyle {
								background: rgba(242,161,95,0.17) !important;
								>text {
								 color: #F2A15F !important;
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
								 display: flex;
								 align-items: center;
								 margin-right: 6px;
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
								.delete-left {
									 width: 65px;
									 height: 28px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 border: 1px solid #E86F50;
									 box-sizing: border-box;
									 border-radius: 4px;
									 margin-right: 10px;
									 >text {
										 font-size: 12px;
										 color: #E86F50
									 }
								};
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
