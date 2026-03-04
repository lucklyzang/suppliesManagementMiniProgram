<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<!-- 日期选择弹框 -->
		<view>
			<u-datetime-picker mode="date" :show="dateStartShow" v-model="dateStartValue" @cancel="dateStartShow = false" @confirm="startDateSure"></u-datetime-picker>
		</view>
		<view>
			<u-datetime-picker mode="date" :show="dateEndShow" v-model="dateEndValue" @cancel="dateEndShow = false" @confirm="endDateSure"></u-datetime-picker>
		</view>
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" :isHomeText="true" backState='3000' fontColor="#FFF" bgColor="none" title="工程维修" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="task-tail-title">
				<u-tabs 
				  :list="list"
					:scrollable="false" 
					lineColor="#fff"
					:activeStyle="{
						color: '#2c9af1',
						fontSize: '14px'
					}"
				 :inactiveStyle="{
						color: '#606060',
						fontSize: '14px'
				 }"
					lineWidth="0" 
					lineHeight="0"
					:current="current" 
					@change="tabChange"
				>
				</u-tabs>
				<view class="tab-line" :class="{'tab-left':current == 0,'tab-right':current == 1}"></view>
			</view>
			<view class="filtrate-area">
				<view class="calendar-box">
					<u-icon name="calendar" color="#101010" size="30"></u-icon>
				</view>
				<view class="date-input-box">
					<view @click="dateStartShow = true">
						<u--input
							:readonly="true"
							type="number"
							color="#101010"
							fontSize="12px"
							border="surround"
							v-model="dateStart"
						></u--input>
					</view>
					<view>至</view>
					<view @click="dateEndShow = true">
						<u--input
						  :readonly="true"
							type="number"
							color="#101010"
							fontSize="12px"
							border="surround"
							v-model="dateEnd"
						></u--input>
					</view>
				</view>
				<view class="filtrate-btn" @click="filtrateEvent">
					<text>筛选</text>
				</view>
			</view>
			<view class="empty-info" v-if="noDataShow">
				<u-empty text="数据为空" mode="list"></u-empty>
			</view>
			<view class="task-tail-content" v-if="current == 0">
				<view class="task-tail-content-item" v-for="(item,index) in stateCompleteList" @click="enterTaskMessage(item)" :key="index">
					<view class="item-title">
						<view class="item-top-one">
							<view class="number">
								<text>编号: {{item.number}}</text>
								<text>{{item.createTime}}</text>
							</view>
						  <view class="priority"
								:class="{
									'noAllocation':item.state == 0,
									'waitSureStyle':item.state == 1,
									'waitFinishStyle': item.state == 2,
									'underwayStyle':item.state == 3,
									'waitSignatureStyle':item.state == 4,
									'completeStyle':item.state == 5,
									'cancelStyle':item.state == 6,
									'delayStyle':item.state == 7,
									'waitCheckStyle':item.state == 8
								}"
							>
						  	<text>{{stateTransfer(item.state)}}</text>
						  </view>
						</view>
					</view>
					<view class="item-top">
						<view class="item-top-two">
						  <view class="start-point">
								<text>优先级:</text>
						  	<text>{{priorityTransfer(item.priority)}}</text>
						  </view>
							<view class="destination-point">
								<text>任务类型:</text>
								<text>{{item.taskTypeName}}</text>
							</view>
						</view>
						<view class="item-top-three">
							<view class="transport-type">
								<text>目的地:</text>
								<text>{{!item.destinationName ? '无' : item.destinationName}}</text>
							</view>
							<view class="transport-people">
								<text>维修员:</text>
								<text>{{!item.workerName ? '无' : item.workerName}}</text>
							</view>
						</view>
						<view class="item-top-three">
							<view class="start-point">
								<text>任务描述:</text>
								<text>{{item.taskDesc}}</text>
							</view>
							<view class="bed-number">
								<text>耗时:</text>
								<text>{{consueTime(item.createTime,item.finalFinishTime)}}</text>
							</view>
						</view>
						<view class="item-top-four">
						  <view class="bed-number">
						  	<text>开始时间: </text>
						  	<text class="destina-list">{{ item.createTime }}</text>
						  </view>
						  <view class="bed-number">
						  	<text>完成时间: </text>
						  	<text class="destina-list">{{ item.finishTime }}</text>
						  </view>
						</view>
					</view>
				</view>
			</view>
			<view class="task-tail-content task-tail-content-going" v-if="current == 1">
				<view class="task-tail-content-item" v-for="(item,index) in stateCompleteList" @click="enterTaskMessage(item)" :key="index">
					<view class="item-title">
						<view class="item-top-one">
							<view class="number">
								<text>编号: {{item.number}}</text>
								<text>{{item.createTime}}</text>
							</view>
						  <view class="priority"
								:class="{
									'noAllocation':item.state == 0,
									'waitSureStyle':item.state == 1,
									'waitFinishStyle': item.state == 2,
									'underwayStyle':item.state == 3,
									'waitSignatureStyle':item.state == 4,
									'completeStyle':item.state == 5,
									'cancelStyle':item.state == 6,
									'delayStyle':item.state == 7,
									'waitCheckStyle':item.state == 8
								}"
							>
						  	<text>{{stateTransfer(item.state)}}</text>
						  </view>
						</view>
					</view>
					<view class="item-top">
						<view class="item-top-two">
						  <view class="start-point">
								<text>优先级:</text>
						  	<text>{{priorityTransfer(item.priority)}}</text>
						  </view>
							<view class="destination-point">
								<text>任务类型:</text>
								<text>{{item.taskTypeName}}</text>
							</view>
						</view>
						<view class="item-top-three">
							<view class="transport-type">
								<text>目的地:</text>
								<text>{{!item.destinationName ? '无' : item.destinationName}}</text>
							</view>
							<view class="transport-people">
								<text>维修员:</text>
								<text>{{!item.workerName ? '无' : item.workerName}}</text>
							</view>
						</view>
						<view class="item-top-three">
							<view class="start-point">
								<text>任务描述:</text>
								<text>{{item.taskDesc}}</text>
							</view>
							<view class="bed-number">
								<text>取消原因:</text>
								<text>{{ item.cancelReason }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="tab-bar">
			<u-tabbar
			  :value="valueName"
			  @change="tabBarEvent"
			  :placeholder="false"
				activeColor="#3890EE"
				:fixed="true"
			  :safeAreaInsetBottom="true"
			>
			  <u-tabbar-item text="呼叫">
			    <image
			  	  class="u-page__item__slot-icon"
			  		style="width:19px;height:18px"
			      slot="active-icon"
			      src="/static/img/call-active-icon.png"
			    ></image>
			    <image
			  	  class="u-page__item__slot-icon"
			      slot="inactive-icon"
			  		style="width:19px;height:18px"
			      src="/static/img/call-inactive-icon.png"
			    ></image>
			  </u-tabbar-item>
			  <u-tabbar-item text="实时任务">
			    <image
			  	  class="u-page__item__slot-icon"
			  		style="width:19px;height:18px"
			      slot="active-icon"
			      src="/static/img/real-timetask-active-icon.png"
			    ></image>
			    <image
			  	  class="u-page__item__slot-icon"
			  		style="width:19px;height:18px"
			      slot="inactive-icon"
			      src="/static/img/real-timetask-inactive-icon.png"
			    ></image>
			  </u-tabbar-item>
			  <u-tabbar-item text="历史任务">
			    <image
			  	  class="u-page__item__slot-icon"
			  		style="width:19px;height:18px"
			      slot="active-icon"
			      src="/static/img/historical-task-active-icon.png"
			    ></image>
			    <image
			  	  class="u-page__item__slot-icon"
			  		style="width:19px;height:18px"
			      slot="inactive-icon"
			      src="/static/img/historical-task-inactive-icon.png"
			    ></image>
			  </u-tabbar-item>
			</u-tabbar>
		</view>
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
	import {getMaintainTask} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	import SOtime from '@/common/js/utils/SOtime.js'
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				valueName: 2,
				noDataShow: false,
				list: [{name: '已完成'}, {name: '已取消'}],
				current: 0,
				dateStart:  getDate(),
				dateEnd:  getDate(),
				dateStartValue: this.normalizeTimestamp(),
				dateEndValue: this.normalizeTimestamp(),
				dateEndShow: false,
				dateStartShow: false,
				stateCompleteList: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'templateType',
				'chooseHospitalArea'
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
			userAccount() {
				return this.userInfo['userName']
			}
		},
		onLoad() {
			this.queryCompleteDispatchTask(
				{
				   proId:this.proId, createId:this.workerId,state:5,
				   startDate: this.dateStart, endDate: this.dateEnd
				}
			)
		},
		methods: {
			...mapMutations([
				'changeProjectTaskMessage'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			
			// 将时间戳转换为当天的 00:00:00
			normalizeTimestamp () {
			  const date = new Date();
			  date.setHours(0, 0, 0, 0);
			  return Number(date)
			},
			
			
			// 开始日期弹框显示事件
			showActionStart () {
				this.dateStartShow = true
			},
			
			// 耗时
			consueTime (t1,t2) {
			  if (t1 && t2) {
			    return SOtime.time5(t1,t2)
			  }
			},
			
			// tab切换改变事件
			tabChange (index) {
				if (this.dateEndValue < this.dateStartValue) {
					this.$refs.uToast.show({
					  message: `结束日期不能小于开始日期`,
					  type: 'warning'
					});
					return
				};
				this.current = index['index'];
				if (this.current == 0) {
				  this.queryCompleteDispatchTask(
					{
					   proId:this.proId, createId:this.workerId,state:5,
						 startDate: this.dateStart, endDate: this.dateEnd
					}
				  )
				} else {
				  this.queryCompleteDispatchTask(
					{
					   proId:this.proId, createId:this.workerId,state:6,
						 startDate: this.dateStart, endDate: this.dateEnd
					}
				  )
				}
			},
			
			// 开始时间确定
			startDateSure(e) {
				this.dateStartShow = false;
				this.dateStart = SOtime.time8(e.value);
				this.dateStartValue = e.value;
				if (this.dateEndValue < this.dateStartValue){
					this.$refs.uToast.show({
					  message: `结束日期不能小于开始日期`,
					  type: 'warning'
					});
					return
				}
			},
			
			// 结束日期确定
			endDateSure(e) {
				this.dateEndShow = false;
				this.dateEnd = SOtime.time8(e.value);
				this.dateEndValue = e.value;
				if (this.dateEndValue < this.dateStartValue) {
					this.$refs.uToast.show({
					  message: `结束日期不能小于开始日期`,
					  type: 'warning'
					});
					return
				}
			},
			
			// 进入订单详情事件
			enterTaskMessage (item) {
				this.changeProjectTaskMessage(item);
				uni.navigateTo({
					url: '/projectManagementPackage/pages/projectWorkerOrderMessage/projectWorkerOrderMessage'
				})
			},
				
			// 任务优先级转换
			  priorityTransfer (index) {
				switch(index) {
				  case 1 :
					return '正常'
					break;
				  case 2 :
					return '重要'
					break;
				  case 3 :
					return '紧急'
					break;
				  case 4 :
					return '紧急重要'
					break;
				}
			  },
			
			// 任务状态转换
			stateTransfer (state) {
				switch(state) {
					case 0 :
						return '未分配'
						break;
					case 1 :
						return '待确认'
						break;
					case 2 :
						return '待完成'
						break;
					case 3 :
						return '进行中'
						break;
					case 4 :
						return '待签字'
						break;
					case 5 :
						return '已完成'
						break;
					case 6 :
						return '已取消'
						break;
					case 7 :
						return '已延迟'
						break;
					 case 8 :
						return '待审核'
						break;
				}	
			},
			
			// 筛选事件
			filtrateEvent () {
				if (this.dateEndValue < this.dateStartValue) {
					this.$refs.uToast.show({
					  message: `结束日期不能小于开始日期`,
					  type: 'warning'
					});
					return
				};
				if (this.current == 0) {
				  this.queryCompleteDispatchTask(
						{
							 proId:this.proId, createId:this.workerId,state:5,
							 startDate: this.dateStart, endDate: this.dateEnd
						}
				  )
				} else {
				  this.queryCompleteDispatchTask(
						{
							 proId:this.proId, createId:this.workerId,state:6,
							 startDate: this.dateStart, endDate: this.dateEnd
						}
				  )
				}
			},
			
			// 查询工程任务
			queryCompleteDispatchTask (data) {
			  this.noDataShow = false;
			  this.showLoadingHint = true;
				this.infoText = '查询中···';
				this.stateCompleteList = [];
				let temporaryDataList = [];
			  getMaintainTask(data).then((res) => {
				this.showLoadingHint = false;
				if (res && res.data.code == 200) {
				  if (res.data.data.length > 0) {
						temporaryDataList = res.data.data;
						if (temporaryDataList.length > 0) {
							this.noDataShow = false;
						} else {
							this.noDataShow = true;
						};
						for (let item of temporaryDataList) {
							this.stateCompleteList.push({
								createTime: item.createTime,
								startTime: item.startTime,
								planStartTime: item.planStartTime,
								finalFinishTime: item.finalFinishTime,
								finishTime: item.finishTime,
								state: item.state,
								destinationName: item.depName,
								taskTypeName: item.typeName,
								priority: item.priority,
								number: item.taskNumber,
								id: item.id,
								taskDesc: item.taskDesc,
								cancelReason: item.cancelReason,
								workerName: item.workerName
							})
						}
				  } else {
						this.noDataShow = true
				  }
				} else {
						this.$refs.uToast.show({
							message: `${res.data.msg}`,
							type: 'error'
						})
					}
			  })
			  .catch((err) => {
				this.$refs.uToast.show({
					message: `${err.message}`,
					type: 'error'
				});
				this.showLoadingHint = false;
				this.noDataShow = true;
			  })
			},
			
			// tabBar点击事件
			tabBarEvent (index) {
				this.valueName = index;
				if (this.valueName == 0) {
					 uni.redirectTo({
						url: '/projectManagementPackage/pages/callTask/callTask'
					 })
				} else if (this.valueName == 1) {
					 uni.redirectTo({
						url: '/projectManagementPackage/pages/realtimeTask/realtimeTask'
					 })
				} else if (this.valueName == 2) {
					 uni.redirectTo({
						url: '/projectManagementPackage/pages/historicalTask/historicalTask'
					 })
				}
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
			background: #3890EE;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.nav {
			width: 100%;
		};
		.tab-bar {
			height: 85px;
			::v-deep {
				.u-tabbar {
					height: 100%;
					.u-tabbar__content {
						background: #F8F8F8;
					}
				}
			}
		};
		.content {
			 flex: 1;
			 overflow: auto;
			 padding: 6px 4px;
			 box-sizing: border-box;
			 position: relative;
			 background: #F8F8F8;
			 display: flex;
			 flex-direction: column;
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
			 .task-tail-title {
				 width: 85%;
				 margin: 0 auto;
				 position: relative;
				 .tab-line {
					 width: 96px;
					 height: 2px;
					 background: #2c9af1;
					 position: absolute;
					 bottom: -1px;
				 };
				 .tab-left {
						left: 0
				 };
				 .tab-right {
					 right: 0
				 };
				 border-bottom: 1px solid #bbbbbb;
				 ::v-deep .u-tabs {
					 .u-tabs__wrapper {
						 .u-tabs__wrapper__nav {
								.u-tabs__wrapper__nav__item {
									padding: 0 20px;
									box-sizing: border-box;
								 &:nth-child(1) {
										justify-content: flex-start !important;
								 };
								 &:nth-child(2) {
										justify-content: flex-end !important;
								 }
								};
								.u-tabs__wrapper__nav__line {
									margin-bottom: -3px;
								}
						 }
					 }
				 }
			 };
			 .filtrate-area {
				 display: flex;
				 align-items: center;
				 width: 85%;
				 margin: 10px 0;
				 margin-left: 6%;
				 .calendar-box {
					 margin-right: 4px;
				 };
				 .date-input-box {
					display: flex;
					align-items: center;
					::v-deep .u-input {
						 padding: 0 9px !important;
						 width: 73px;
						 height: 22px;
						 border-radius: 0 !important;
					};
					::v-deep .u-border {
						border-color: #bbbbbb !important;
					};
					>view {
					 &:nth-child(2) {
						margin: 0 8px;
						color: #101010;
						font-size: 12px;
					 }
					}
				 };
				 .filtrate-btn {
					 margin-left: 10px;
					 width: 54px;
					 height: 22px;
					 display: flex;
					 align-items: center;
					 justify-content: center;
					 border-radius: 6px;
					 background: linear-gradient(to right, #6ED3F7, #218FFF);
					 >text {
						 color: #fff;
						 font-size: 12px;
					 }
				 }
			 };
			 .task-tail-content {
			 	flex: 1;
			 	overflow: auto;
			 	-webkit-overflow-scrolling: touch;
			 	background: #f7f7f7;
			 	.task-tail-content-item {
			 		width: 98%;
			 		margin: 0 auto;
			 		margin-bottom: 6px;
			 		border-radius: 4px;
			 		background: #FFFFFF;
					.item-title {
						box-sizing: border-box;
						padding: 0 12px;
						.item-top-one {
							height: 40px;
							display: flex;
							align-items: center;
							border-bottom: 1px solid #BBBBBB;
						  > view {
						    word-break: break-all;
						    font-size: 12px;
						    text {
						      color: #ACADAF;
						    };
						    &:first-child {
						      flex: 1;
						      display: flex;
						      align-items: center;
						      >text {
						      	display: inline-block;
						    		&:first-child {
						    			width: 160px;
						    			height: 16px;
						    			overflow: auto;
						    		};
						      	&:last-child {
						      		margin: 0 4px;
						      		flex: 1
						      	}
						      }
						    };
								&:nth-child(2) {
									width: 60px;
									display: flex;
									align-items: center;
									justify-content: center;
									>image {
										width: 22px;
										height: 22px
									}
								};
						    &:last-child {
						      padding: 0 6px;
									box-sizing: border-box;
						      display: flex;
						      justify-content: flex-end;
						      align-items: center;
									height: 21px;
									background: #E86F50;
									border-radius: 3px;
									>text {
										color: #fff;
										font-size: 14px;
									}
						    }
						  };
							.noAllocation {
								background: #E86F50 !important;
							};
							.waitSureStyle {
								background: #FF0000 !important;
							};
							.underwayStyle {
								background: #289E8E !important;
							};
							.waitFinishStyle {
								background: #298CF8 !important;
							};
							.waitSignatureStyle {
								background: #06e606 !important;
							};
							.waitCheckStyle {
								background: #F2A15F !important;
							};
							.delayStyle {
								background: #be4330 !important;
							};
							.cancelStyle {
								background: #E8CB51 !important;
							};
							.completeStyle {
								background: #101010 !important
							}
						}
					};
			 		.item-top {
			 			width: 100%;
			 			font-size: 16px;
			 			display: inline-block;
			 			color: black;
			 		  > view {
			 		    padding: 6px 0;
			 		    display: flex;
			 		    box-sizing: border-box;
			 		    flex-flow: row nowrap;
			 		    > view {
			 		      width: 50%;
			 		      > text {
			 		        &:last-child {
			 		          padding-left: 0;
			 		        }
			 		      }
			 		    }
			 		  };
			 			.item-top-two {
							box-sizing: border-box;
							padding: 10px 12px;
			 				> view {
								display: flex;
								word-break: break-all;
			 				  &:first-child {
			 				    width: 60%;
									padding-right: 6px;
									box-sizing: border-box;
			 						text {
										font-size: 12px;
										color: #101010;
			 							&:first-child {
			 								margin-right: 4px
			 							};
										&:last-child {
											flex: 1;
										}
			 						}
			 				  };
			 				  &:last-child {
			 						width: 40%;
			 						text {
										font-size: 12px;
										color: #101010;
										&:first-child {
											margin-right: 4px
										};
										&:last-child {
											flex: 1;
										}
									}
			 					}
			 				}
			 			};
			 		  .item-top-three {
							 box-sizing: border-box;
							 padding: 10px 12px;
			 		    > view {
								display: flex;
								word-break: break-all;
			 		      &:first-child {
			 		        width: 60%;
									padding-right: 6px;
									box-sizing: border-box;
									display: flex;
									text {
										font-size: 12px;
										color: #101010;
										&:first-child {
											margin-right: 4px
										};
										&:last-child {
											flex: 1;
										}
									}
			 		      };
			 		      &:last-child {
			 						width: 40%;
			 		    		text {
			 		    			font-size: 12px;
			 		    			color: #101010;
			 		    			&:first-child {
			 		    				margin-right: 4px
			 		    			};
										&:last-child {
											flex: 1;
										}
			 		    		}
			 		    	}
			 		    }
			 		  };
			 		  .item-top-four {
							 box-sizing: border-box;
							 padding: 10px 12px;
							 font-size: 12px;
							 display: flex;
							 width: 100%;
							 word-break: break-all;
							 >text {
							 	display: inline-block;
							 	&:first-child {
							 		color: #101010;
							 		margin-right: 4px
							 	};
							 	&:last-child {
							 		max-height: 100px;
							 		overflow: auto;
							 		flex: 1;
							 	}
							}
			 		  }
			 		}
			 	}
			 }
		}
	}
</style>
