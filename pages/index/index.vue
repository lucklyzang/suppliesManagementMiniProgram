<template>
	<view class="content" :style="{ 'padding-top': statusBarHeight + 'px' }">
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 20 + 'px' }"></view>
		<u-toast ref="uToast" />
    <!-- 顶部标题 -->
    <view class="topTabbar" :style="{ 'height': navigationBarHeight + 20 + 'px', 'paddingRight': capsuleMessage.width + 10 + 'px' }">
			 <view class="user-photo">
					<image src="/static/img/home-icon.png" mode="widthFix"></image>
				</view>
				<view class="user-message">
						<view class="user-name">
								回家飒飒
						</view>
						<view class="account-name">
								蝴蝶卡
						</view>
				</view>
    </view>
		<view class="content-box">
			 <view class="task-board">
					<h2>待办事项</h2>
					<view class="subproject-list-box">
							<view class="subproject-list" v-for="(item,index) in cleaningManagementList" 
									:key="index"
									@click="backlogMatterEvent(item,index)"
							>
									<text>{{ item.name }}</text>
									<view>
											<text class="message-number">2</text>
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
					<text>四川省华西医院</text>
				</view>
				<view class="department-box">
					<text>
						{{ depName }}
					</text>
					<text v-if="depName != '' && depNum != ''">
						-
					</text>
					<text>
						{{ depNum }}
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
	let windowTimer;
	export default{
		data() {
			return {
				showLoadingHint: false,
				triangleRectListInfoShow: false,
				infoText: '加载中···',
				loadingText: '加载中···',
				isTimeoutContinue: true,
				cleaningManagementList: [
						{
								name: '待审核',
								value: 1
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
				'socketOpen',
				'statusBarHeight',
				'navigationBarHeight',
				'capsuleMessage',
				'chooseHospitalArea',
				'suppliesHomeGlobalTimer',
			]),
			userName() {
				return this.userInfo['name']
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
			},
			depNum() {
				if (this.userInfo.hasOwnProperty('depNum')) {
					return this.userInfo['depNum'] === null ? '' : this.userInfo['depNum']
				} else {
					return ''
				}
			}
		},
		
		onUnload () {
			if (this.suppliesHomeGlobalTimer) {
				clearTimeout(this.suppliesHomeGlobalTimer);
				windowTimer = null;
				this.changeSuppliesHomeGlobalTimer(null)
			}
		},
		
		onShow() {
			// 获取任务数量
			// if (!this.suppliesHomeGlobalTimer) {
			//     windowTimer = window.setInterval(() => {
			//     if (this.isTimeoutContinue) {
			//         setTimeout(this.getTaskCount(this.proId,this.workerId), 0);
			//         this.changeSuppliesHomeGlobalTimer(windowTimer)
			//     } else {
			//         this.changeSuppliesHomeGlobalTimer(null)
			//     }
			//     }, 3000)
			// }
		},
		
		methods: {
			...mapMutations([
				'changeSocketOpen',
				'storeCurrentIndex',
				'storeLocationMessage',
				'changeSuppliesHomeGlobalTimer'
			]),
			
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
			
			// 查询任务数量
			getTaskCount (proId,workerId) {
					queryTaskCount(proId,workerId).then((res) => {
							if (res && res.data.code == 200) {
									const {bxTask, sxTask, kxTask} = res.data.data;
									this.repairsWorkerOrderCount = bxTask;
									this.deviceServiceCount = sxTask;
									this.departmentServieCount = kxTask
							}
					})
					.catch((err) => {
					this.$dialog.alert({
							message: `${err.message}`,
							closeOnPopstate: true
					}).then(() => {
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
			
			// 待办事项点击事件
			backlogMatterEvent () {
				if (item.name == '待审核') {
					uni.navigateTo({
						url: '/orderFormAuditPackage/pages/myAuditOrderForm/myAuditOrderForm'
					})
				}
			},
			
			// 功能区点击事件
			functionalZoneEvent (item, index) {
				if (item.text == '临时申领') {
					uni.navigateTo({
						url: '/materialApplicationPackage/pages/materialApplication/materialApplication'
					})
				} else if (item.text == '计划申领') {
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
			padding: 0 0 0 16px;
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
				background: #E5E5E5;
				image {
					vertical-align: middle;
					width: 40px;
					height: 40px;
				}
			};
			.user-message {
				display: flex;
				flex-direction: column;
				justify-content: center;
				z-index: 100;
				color: #fff;
				height: 60px;
				flex: 1;
				font-size: 13px;
				.user-name {
					width: 98%;
					word-break: break-all;
				}
				.account-name {
					width: 98%;
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
				padding: 0 16px 10px 16px;
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
							&:nth-child(2){
								margin-top: 14px;
								font-size: 16px;
								color: #101010;
								text-align: center
							}
						};
						>view {
							position: absolute;
							width: 17px;
							height: 17px;
							display: flex;
							justify-content: center;
							align-items: center;
							background: #E86F50;
							border-radius: 50%;
							top: -10px;
							right: 0;
							text {
								@include no-wrap();
								font-size: 12px;
								color: #fff;
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
				margin-top: 20px;
				.service-list {
					width: 25%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
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
				padding: 0 16px;
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