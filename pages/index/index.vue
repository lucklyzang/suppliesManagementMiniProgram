<template>
	<view class="content" :style="{ 'padding-top': statusBarHeight + 'px' }">
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 20 + 'px' }"></view>
		<u-toast ref="uToast" />
    <!-- 顶部标题 -->
    <view class="topTabbar" :style="{ 'height': navigationBarHeight + 20 + 'px', 'paddingRight': capsuleMessage.width + 10 + 'px' }">
			 <view class="user-photo">
					<image :src="avatar ? avatar : '/static/img/default-person-photo.png'" mode="widthFix"></image>
				</view>
				<view class="user-message">
						<view class="user-name">
							<text>{{ userName }}</text>
							<text>{{`(${userInfo.deptName})`}}</text>
						</view>
						<view class="account-name">
								{{ loginDate }}
						</view>
				</view>
    </view>
		<view class="content-box">
			 <view class="task-board">
					<h2>待办事项</h2>
					<view class="subproject-list-box">
							<view class="subproject-list" v-for="(item,index) in backlogList" 
									:key="index"
									@click="backlogMatterEvent(item,index)"
							>
									<text>{{ item.name }}</text>
									<view class="message-number" v-if="item.count !== null && item.count !== ''">
											<text>{{ item.count }}</text>
									</view>
							</view> 
					</view>
			</view>
			<view class="functional-zone">
					<view class="service-list" v-for="(item,index) in functionalZoneList" :key="index" @click="functionalZoneEvent(item,index)">
							<view class="list-top">
									<image :src="item.url" mode="widthFix"></image>
							</view>
							<view class="list-bottom">{{ item.text }}</view>
					</view>
			</view>
			<view class="bottom-message">
				<view class="project-name">
					<image src="/static/img/home-location-icon.png" mode="widthFix"></image>
					<text>{{ userInfo.deptName }}</text>
				</view>
				<view class="department-box">
					<text>
						{{ departmentName }}
					</text>
					<text v-if="departmentName != '' && departmentCode != ''">
						-
					</text>
					<text>
						{{ departmentCode }}
					</text>
				</view>
			</view>
		</view>
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" text="加载中···" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
	</view>
</template>
<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import store from '@/store'
	import SOtime from '@/common/js/utils/SOtime.js'
	import { getSaleStatisticsPendingReview } from '@/api/suppliesManagement/orderFormAudit.js'
	let windowTimer;
	export default{
		data() {
			return {
				showLoadingHint: false,
				triangleRectListInfoShow: false,
				infoText: '加载中···',
				loadingText: '加载中···',
				isTimeoutContinue: true,
				startDate: '',
				endDate: '',
				departmentName: '',
				departmentCode: '',
				backlogList: [
						{
								name: '待审核',
								value: 'pendingReview',
								count: 0
						}
				],
				functionalZoneList: [
					{
						text: '临时申领',
						url: require('@/static/img/home-apply-icon.png')
					},
					{
						text: '计划申领',
						url: require('@/static/img/home-apply-icon.png')
					},
					{
						text: '我的订单',
						url: require('@/static/img/home-order-icon.png')
					},
					{
						text: '审核',
						url: require('@/static/img/home-check-icon.png')
					}
				]
			}
		},
		updated() {},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'capsuleMessage',
				'chooseHospitalArea',
				'suppliesHomeGlobalTimer',
				'departmentInfo'
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
			avatar () {
					return this.userInfo['avatar']
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
			},
			loginDate() {
					return SOtime.time8(this.userInfo['loginDate'])
			}
	},
		
		onUnload () {
			this.clearGlobalTimer()
		},
		
		onHide () {
			this.clearGlobalTimer()
		},
		
		onShow() {
			this.getDepartmentNameById(this.depId);
			this.getDateRange();
			// 获取任务数量
			if (!this.suppliesHomeGlobalTimer) {
			    windowTimer = setInterval(() => {
						if (this.isTimeoutContinue) {
							setTimeout(() => {
								this.getSaleStatisticsPendingReviewEvent()
							}, 0);
							this.changeSuppliesHomeGlobalTimer(windowTimer)
						} else {
							this.changeSuppliesHomeGlobalTimer(null)
						}
			    }, 2000)
			}
		},
		
		methods: {
			...mapMutations([
				'changeSocketOpen',
				'storeCurrentIndex',
				'storeLocationMessage',
				'changeSuppliesHomeGlobalTimer',
				'changeMaterialApplicationOrderType'
			]),
			
			clearGlobalTimer() {
			  if (this.suppliesHomeGlobalTimer) {
			  	clearTimeout(this.suppliesHomeGlobalTimer);
			  	windowTimer = null;
			  	this.changeSuppliesHomeGlobalTimer(null)
			  }
			},
			
			// 控制服务管理模块显示隐藏
			controlServiceManageModuleShowEvent () {
				this.hasAuthSystemsList = [];
				if (this.userInfo['extendData'].hasOwnProperty('systems')) {
					this.serviceList.map((value,index,arr) => {
						if (this.userInfo['extendData']['systems'].indexOf(value['value']) != -1) {
							this.hasAuthSystemsList.push(value)
						}
					})
				}
			},
			
			// 获取开始和结束日期(中间相隔一个月)
			getDateRange() {
				const end = new Date(); 
				const start = new Date(end);
				start.setMonth(end.getMonth() - 1);
				start.setHours(23, 59, 59, 999);
				this.startDate = this.formatDate(start);
				this.endDate = this.formatDate(end);
			},
			
			formatDate(date) {
			  const y = date.getFullYear();
			  const m = String(date.getMonth() + 1).padStart(2, '0');
			  const d = String(date.getDate()).padStart(2, '0');
			  return `${y}-${m}-${d}`;
			},
			
			// 查询待审核任务数量
			getSaleStatisticsPendingReviewEvent () {
					this.isTimeoutContinue = false;
					getSaleStatisticsPendingReview().then((res) => {
							if (res && res.data.code == 0) {
									this.isTimeoutContinue = true;
									this.backlogList.forEach((item,index) => {
										if (item.value == 'pendingReview') {
											item.count = res.data.data;
										}
									})
							} else {
								this.$refs.uToast.show({
									message: res.data.msg,
									type: 'error'
								})
							}
					})
					.catch((err) => {
						this.$refs.uToast.show({
							message: err,
							type: 'error'
						})
					})
			},
			
			// 格式化时间
			getNowFormatDate(currentDate,type) {
				// type:1(只显示小时分钟秒),2(只显示年月日)3(只显示年月)4(显示年月日小时分钟秒)5(显示月日)
				let currentdate;
				let strDate = currentDate.getDate();
				let seperator1 = "-";
				let seperator2 = ":";
				let seperator3 = " ";
				let month = currentDate.getMonth() + 1;
				let hour = currentDate.getHours();
				let minutes = currentDate.getMinutes();
				let seconds = currentDate.getSeconds();
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				};
				if (hour >= 0 && hour <= 9) {
					hour = "0" + hour;
				};
				if (minutes >= 0 && minutes <= 9) {
					minutes = "0" + minutes;
				};
				if (seconds >= 0 && seconds <= 9) {
					seconds = "0" + seconds;
				};
				if (strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				};
				if (type == 1) {
					currentdate = hour + seperator2 + minutes + seperator2 + seconds
				};
				if (type == 2) {
					currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate
				};
				if (type == 3) {
					currentdate = currentDate.getFullYear() + seperator1 + month
				};
				if (type == 4) {
					currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate + seperator3 + hour + seperator2 + minutes + seperator2 + seconds
				};
				if (type == 5) {
					currentdate = month + seperator1 + strDate
				};
				return currentdate
			},
			
			// px转换成rpx
			rpxTopx(px){
				let deviceWidth = uni.getSystemInfoSync().windowWidth;
				let rpx = ( 750 / deviceWidth ) * Number(px);
				return Math.floor(rpx)
			},
			
			// 根据科室id获取科室名称	
			getDepartmentNameById(value) {
				if (this.departmentInfo.length > 0) {
					let temporaryList = this.departmentInfo.filter((item) => {return item['id'] == value });
					if (temporaryList.length > 0) {
						this.departmentName = temporaryList[0]['name']
						this.departmentCode = temporaryList[0]['code']
					}
				}
			},
						
			// 待办事项点击事件
			backlogMatterEvent (item,index) {
				if (item.name == '待审核') {
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/myAuditOrderForm/myAuditOrderForm'
					})
				}
			},
			
			// 功能区点击事件
			functionalZoneEvent (item, index) {
				if (item.text == '临时申领') {
					this.changeMaterialApplicationOrderType(1);
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/materialApplication/materialApplication'
					})
				} else if (item.text == '计划申领') {
					this.changeMaterialApplicationOrderType(0);
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/materialApplication/materialApplication'
					})
				} else if (item.text == '我的订单') {
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/myOrderForm/myOrderForm'
					})
				} else if (item.text == '审核') {
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/myAuditOrderForm/myAuditOrderForm'
					})
				}
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import "~@/common/stylus/variable.scss";
	page {
		width: 100%;
		height: 100%;
	};
	$chatContentbgc: #1E86FD;
	$sendBtnbgc: #4F7DF5;
	view,button,text,input,textarea {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	};
	.content {
		@include content-wrapper;
		height: 100vh !important;
		padding: 0 2px;
		box-sizing: border-box;
		position: relative;
		background: #F8F8F8;
		::v-deep .u-popup {
			flex: none !important
		};
		.top-background-area {
			width: 100%;
			position: absolute;
			background: #44CC72;
			top: 0;
			left: 0
		};
    .topTabbar {
			width: 100%;
			padding: 0 0 0 10px;
			box-sizing: border-box;
			overflow: auto;
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			z-index: 10;
			.user-photo {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 45px;
				height: 45px;
				margin-right: 10px;
				border-radius: 50%;
				image {
					vertical-align: middle;
					width: 45px;
					height: 45px;
				}
			};
			.user-message {
				display: flex;
				flex-direction: column;
				justify-content: center;
				z-index: 100;
				height: 60px;
				flex: 1;
				.user-name {
					word-break: break-all;
					>text {
						color: #fff;
						font-size: 13px;
						&:first-child {
							margin-right: 4px;
						}
					}
				}
				.account-name {
					color: #fff;
					word-break: break-all;
					font-size: 12px;
					margin-top: 4px;
					line-height: 20px
				}
			}
		};
		.content-box {
			position: relative;
			flex: 1;
			height: 0;
			display: flex;
			flex-direction: column;
			margin-top: 6px;
			.task-board {
				width: 100%;
				padding: 0 16px 16px 10px;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				h2 {
					width: 100%;
					height: 40px;
					line-height: 40px;
					font-size: 12px;
					color: #101010;
				};
				.subproject-list-box {
					width: 100%;
					display: flex;
					flex-flow: row wrap;
					flex: 1;
					align-content: flex-start;
					.subproject-list {
						position: relative;
						width: 100px;
						height: 50px;
						margin-right: 20px;
						display: flex;
						background: #F0F2FE;
						border-radius: 6px;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						>text {
							&:nth-child(1){
								font-size: 12px;
								color: #101010;
								text-align: center
							}
						};
						 .message-number {
								position: absolute;
								top: -10px;
								right: 0;
								display: inline-flex;
								justify-content: center;
								align-items: center;
								vertical-align: middle;
								background-color: #E86F50;
								color: #ffffff;              
								font-size: 12px;              
								min-width: 17px;
								max-width: 24px;
								aspect-ratio: 1;
								border-radius: 50%;
								padding: 0 4px;
								box-sizing: border-box;
								>text {
										@include no-wrap();
								}                      
						}
					};
					>view:nth-child(5) {
						width: 35% !important
					}
				}
			};
			.functional-zone {
				display: flex;
				flex-wrap: wrap;
				width: 100%;
				margin-left: -10px;
				.service-list {
					width: 25%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					margin-bottom: 20px;
					.list-top {
						width: 50px;
						height: 50px;
						display: flex;
						align-items: center;
						justify-content: center;
						background: #44CC72;
						border-radius: 12px;
						>image {
							width: 25px;
							height: 25px;
						}
					};
					.list-bottom {
						margin-top: 14px;
						font-size: 12px;
						color: #101010;
					}
				}
			};
			.bottom-message {
				display: flex;
				width: 100%;
				padding: 0 10px;
				box-sizing: border-box;
				position: absolute;
				bottom: 20px;
				left: 0;
				.project-name {
					flex: 1;
					@include no-wrap;
					margin-right: 10px;
					image {
						vertical-align: middle;
						width: 24px;
						height: 24px;
						margin-right: 4px;
					};
					>text {
						font-size: 14px;
						color: #101010;
					}
				};
				.department-box {
					font-size: 14px;
					color: #101010;
					@include no-wrap;
				}
			}
		};
		.loading-box {
			height: 35px;
			display: flex;
			align-items: center;
			justify-content: center
		};
	}
</style>