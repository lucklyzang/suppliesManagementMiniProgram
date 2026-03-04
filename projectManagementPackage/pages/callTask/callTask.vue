<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<light-hint ref="alertToast"></light-hint>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-modal :show="sureCancelShow" :content="content" title="确定删除此图片?" :show-cancel-button="true" @confirm="sureCancel"
		 @cancel="cancelSure">
		</u-modal>
		<u-toast ref="uToast"></u-toast>
		<!-- 目的科室 -->
		<view class="transport-rice-box" v-if="showGoalDepartment">
			<ScrollSelection v-model="showGoalDepartment" :pickerValues="goalDepartmentDefaultIndex" :columns="goalDepartmentOption" title="目的科室" @sure="goalDepartmentSureEvent" @cancel="goalDepartmentCancelEvent" @close="goalDepartmentCloseEvent" :isShowSearch="true" />
		</view>
		<!-- 目的房间 -->
		<view class="transport-rice-box" v-if="showGoalSpaces">
			<ScrollSelection v-model="showGoalSpaces" :pickerValues="goalSpacesDefaultIndex" :columns="goalSpacesOption" title="目的房间" :currentSelectData="currentGoalSpaces" @sure="goalSpacesSureEvent" @cancel="goalSpacesCancelEvent" @close="goalSpacesCloseEvent" :isShowSearch="true" />
		</view>
		<!-- 任务类型 -->
		<view class="transport-rice-box" v-if="showTaskType">
			<ScrollSelection v-model="showTaskType" :pickerValues="taskTypeDefaultIndex" :isShowSearch="true" :columns="taskTypeOption" title="任务类型" @sure="taskTypeSureEvent" @cancel="taskTypeCancelEvent" @close="taskTypeCloseEvent" />
		</view>
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" :isHomeText="true" backState='3000' fontColor="#FFF" bgColor="none" title="任务呼叫" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content-box-inner">
			<view class="message-box">
				<view class="message-one">
					<view class="message-one-left">
						优先级
					</view>
					<view class="message-one-right">
						<u-radio-group v-model="priorityRadioValue">
							<u-radio name="1" activeColor="#289E8E" labelColor="#289E8E" label="正常"></u-radio>
							<u-radio name="2" activeColor="#F2A15F" labelColor="#F2A15F" label="重要"></u-radio>
							<u-radio name="3" activeColor="#E8CB51" labelColor="#E8CB51" label="紧急"></u-radio>
							<u-radio name="4" activeColor="#E86F50" labelColor="#E86F50" label="紧急重要"></u-radio>
						</u-radio-group>
					</view>
				</view>
				<view class="select-box end-select-box">
					<view class="select-box-left">
						<text>科室选择</text>
					</view>
					<view class="select-box-right" @click="goalDepartmentClickEvent">
						<text>{{ currentGoalDepartment }}</text>
						<u-icon name="arrow-right" color="#989999" size="20" /></u-icon>
					</view>
				</view>
				<view class="select-box end-select-box">
					<view class="select-box-left">
						<text>目的房间</text>
					</view>
					<view class="select-box-right" @click="goalSpacesClickEvent">
						<text>{{ currentGoalSpaces }}</text>
						<u-icon name="arrow-right" color="#989999" size="20" /></u-icon>
					</view>
				</view>
				<view class="select-box">
					<view class="select-box-left">
						<text>*</text>
						<text>任务类型</text>
					</view>
					<view class="select-box-right" @click="showTaskType = true">
						<text>{{ currentTaskType }}</text>
						<u-icon name="arrow-right" color="#989999" size="20" /></u-icon>
					</view>
				</view>
				<view class="view-photoList">
					<view>
						<text>问题拍照</text>
					</view>
					<view>
						<view v-for="(item, index) in imgArr" :key='index'>
							<image :src="item"></image>
							<u-icon name="close" size="20" color="#000000" @click="photoDelete(item,index)"></u-icon>
						</view>
						<view>
							<image class="" mode="aspectFit" :lazy-load="true" src="/static/img/plus.png"  @click="getImg"/>
						</view>
					</view>
				</view>
				<view class="task-describe transport-type">
					<view class="transport-type-left">
						<text>任务描述</text>
					</view>
					<view class="transport-type-right">
						<u--textarea v-model="taskDescribe" placeholder="请输入任务描述" border="none"></u--textarea>
					</view>
				</view>
			</view>
		</view>
		<view class="btn-box">
			<text class="operate-one" @click="resetEvent">重置</text>
			<text class="operate-two" @click="sureEvent">提交</text>
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
	import {
		queryTaskType,
		queryAllDestination,
		departmentRoom,
		reportProblem,
		getRemarks,
		querySpace
	} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	import { setCache,removeAllLocalStorage } from '@/common/js/utils'
	import _ from 'lodash'
	import ScrollSelection from "@/components/scrollSelection/scrollSelection";
	import LightHint from "@/components/light-hint/light-hint.vue";
	export default {
		components: {
			navBar,
			ScrollSelection,
			LightHint
		},
		data() {
			return {
				showLoadingHint: false,
				infoText: '加载中···',
				valueName: 0,
				materialShow: false,
				deleteInfoPng: require('@/static/img/delete-info.png'),
				materialDeleteShow: false,
				deleteMaterialIndex: '',
				loadingShow: false,
				deleteMaterial: '',
				searchValue: '',
				problemOverview: '',
				taskDescribe: '',
				transportNumberValue: '',
				imgArr: [],
				imgIndex: '',
				sureCancelShow: false,
				
				goalDepartmentOption: [],
				goalDepartmentDefaultIndex: [0],
				showGoalDepartment: false,
				currentGoalDepartment: '请选择',
	
				goalSpacesOption: [],
				showGoalSpaces: false,
				goalSpacesDefaultIndex: [0],
				currentGoalSpaces: '请选择',
	
				taskTypeOption: [],
				taskTypeDefaultIndex: [0],
				showTaskType: false,
				currentTaskType: '请选择',
	
				priorityRadioValue: '1'
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				"templateType",
				'chooseHospitalArea',
				'isMedicalMan'
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
		onLoad () {
			this.parallelFunction();
			if (this.isMedicalMan) {
				this.currentGoalDepartment = this.depName == '' ? '请选择' :  this.depName;
				// 登陆人员为医务人员时，根据默认科室id查询目的房间列表
				if (this.depId) {
					this.getSpacesByDepartmentId(this.depId)
				}
			}
		},
		methods: {
			...mapMutations([
				'storeCurrentIndex'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			
			// 弹框确定按钮
			sureCancel() {
				this.sureCancelShow = false;
				this.imgArr.splice(this.imgIndex, 1)
			},
			// 弹框取消按钮
			cancelSure() {
				this.sureCancelShow = false;
			},
			
			// 图片删除事件
			photoDelete(item, index) {
				this.sureCancelShow = true;
				this.imgIndex = index
			},
			
			// 选择图片方法
			getImg() {
				var that = this
				uni.chooseImage({
					count: 3,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						uni.previewImage({
							urls: res.tempFilePaths
						});
						for (let imgI = 0, len = res.tempFilePaths.length; imgI < len; imgI++) {
							that.srcImage = res.tempFilePaths[imgI];
							uni.getFileSystemManager().readFile({
								filePath: that.srcImage,
								encoding: 'base64',
								success: res => {
									let base64 = 'data:image/jpeg;base64,' + res.data;
									that.imgArr.push(base64);
								}
							})
						}
					}
				});
			},
			
			// 查询科室
			getAllDestination() {
				return new Promise((resolve, reject) => {
					queryAllDestination(this.proId).then((res) => {
							if (res && res.data.code == 200) {
								resolve(res.data.data)
							} else {
								this.$refs.uToast.show({
									title: `${res.data.data.msg}`,
									type: 'warning'
								})
							}
						})
						.catch((err) => {
							reject(err.message)
						})
				})
			},
			
			// 查询运送类型
			getTaskType(data) {
				return new Promise((resolve, reject) => {
					queryTaskType(data)
						.then((res) => {
							if (res && res.data.code == 200) {
								resolve(res.data.data)
							} else {
								this.$refs.uToast.show({
									title: `${res.data.data.msg}`,
									type: 'warning'
								})
							}
						})
						.catch((err) => {
							reject(err.message)
						})
				})
			},
			
				// 格式化时间
				getNowFormatDate(currentDate) {
				let currentdate;
				let strDate = currentDate.getDate();
				let seperator1 = "-";
				let seperator2 = ":";
				let month = currentDate.getMonth() + 1;
				let hour = currentDate.getHours();
				let minutes = currentDate.getMinutes();
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				};
				if (hour >= 0 && hour <= 9) {
					hour = "0" + hour;
				};
				if (minutes >= 0 && minutes <= 9) {
					minutes = "0" + minutes;
				};
				if (strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				};
				currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + hour + seperator2 + minutes
				return currentdate
				},
				
				// 处理维修任务参与者
				disposeTaskPresent (item) {
					if (!item) { return '请选择'};
					if (item.length == 0) { return '请选择'};
					let temporaryArray = [];
					for (let innerItem of item) {
						temporaryArray.push(innerItem.text)
					};
					return temporaryArray.join('、')
				},

				// 根据科室查询房间信息
				getSpacesByDepartmentId (depId,flag) {
					this.showLoadingHint = true;
					this.goalSpacesOption = [];
					querySpace(this.proId,depId)
					.then((res) => {
						this.showLoadingHint = false;
						if (res && res.data.code == 200) {
							if (res.data.data.length > 0) {
								for (let i = 0, len = res.data.data.length; i < len; i++) {
									this.goalSpacesOption.push({
										text: res.data.data[i].spaceName,
										value: res.data.data[i].id,
										id: i
									})
								}
							};
							if (flag) {this.showGoalSpaces = true}
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
							})
						}
					})
					.catch((err) => {
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: `${err}`,
							type: 'error'
						})
					})
				},

				// 并行查询科室、任务类型
				parallelFunction () {
					this.showLoadingHint = true;
					Promise.all([this.getAllDestination(),this.getTaskType(
					{
							proId: this.proId,
							state: 0,
							parentId: ''
						}
					)
					])
					.then((res) => {
						this.showLoadingHint = false;
						if (res && res.length > 0) {
							this.taskTypeOption = [];
							this.goalDepartmentOption = [];
							let [item1,item2] = res;
							if (item1) {
								// 科室
								Object.keys(item1).forEach((item,index) => {
									this.goalDepartmentOption.push({
										text: item1[item],
										value: item,
										id: index
									})
								});
								if (this.isMedicalMan) {
									if (this.depName) {
										this.goalDepartmentDefaultIndex = [this.goalDepartmentOption.findIndex((item) =>{ return item.text == this.depName })];
									}
								}
							};
							if (item2) {
								// 任务类型
								for (let i = 0, len = item2.length; i < len; i++) {
									this.taskTypeOption.push({
										text: item2[i].typeName,
										value: item2[i].id,
										id: i
									})
								}
							}
						}
					})
					.catch((err) => {
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: `${err.message}`,
							type: 'error'
						})
					})
				},

				// 任务类型下拉选择框确认事件
				taskTypeSureEvent (val,value,id) {
				if (val) {
					this.taskTypeDefaultIndex = [id];
					this.currentTaskType =  val
				} else {
					this.currentTaskType = '请选择'
				};
				this.showTaskType = false
				},

				// 任务类型下拉选择框取消事件
				taskTypeCancelEvent () {
				this.showTaskType = false
				},

				// 任务类型下拉选择框关闭事件
				taskTypeCloseEvent () {
				this.showTaskType = false
				},

				// 目的科室下拉选择框确认事件
				goalDepartmentSureEvent (val,value,id) {
				if (val) {
					this.currentGoalDepartment =  val;
					this.currentGoalSpaces = '请选择';
					this.goalSpacesDefaultIndex = [0];
					this.goalDepartmentDefaultIndex = [id];
					this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],false)
				} else {
					this.currentGoalDepartment = '请选择'
				};
				this.showGoalDepartment = false
				},

				// 目的科室列点击事件
				goalDepartmentClickEvent () {
				 this.showGoalDepartment = true
				},

				// 目的科室下拉选择框取消事件
				goalDepartmentCancelEvent () {
				 this.showGoalDepartment = false
				},

				// 目的科室下拉选择框关闭事件
				 goalDepartmentCloseEvent () {
				this.showGoalDepartment = false
				},

				// 目的房间下拉选择框关闭事件
				goalSpacesCloseEvent () {
				 this.showGoalSpaces = false
				},

				// 目的房间列点击事件
				goalSpacesClickEvent () {
				if (this.currentGoalDepartment == '请选择') {
					this.$refs.uToast.show({
						message: '请选择科室',
						position: 'center'
					})
				} else {
					this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],true)
				}
				},

				// 目的房间下拉选择框确认事件
				goalSpacesSureEvent (val,value,id) {
				if (val.length > 0) {
					this.goalSpacesDefaultIndex = [id];
					this.currentGoalSpaces =  val;
				} else {
					this.currentGoalSpaces = '请选择'
				};
				this.showGoalSpaces = false
				},

				// 目的房间下拉选择框取消事件
				goalSpacesCancelEvent () {
					this.showGoalSpaces = false
				},
				
				// 确认事件
				sureEvent () {
				// 任务类型不能为空
				if (this.currentTaskType == '请选择') {
					this.$refs.uToast.show({
						message: '任务类型不能为空',
						position: 'center'
					});
					return
				};
				// 创建工程维保任务
				let temporaryMessage = {
					typeId: this.taskTypeOption.filter((item) => { return item['text'] == this.currentTaskType})[0]['value'], // 任务类型id
					typeName: this.currentTaskType, // 任务类型名称
					depName: this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment, //科室名称
					depId: this.currentGoalDepartment == '请选择' ? '' : this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'], // 目的科室id
					spaceId: this.currentGoalSpaces == '请选择' ? '' : this.goalSpacesOption.filter((item) => { return item['text'] == this.currentGoalSpaces})[0]['value'], //目的房间id
					space: this.currentGoalSpaces == '请选择' ? '' : this.currentGoalSpaces, //目的房间名称
					priority: this.priorityRadioValue,
					taskDesc: this.taskDescribe, //任务描述
					proId: this.proId,
					workerId: this.workerId,
					workerName: this.userAccount,
					flag: 1,
					images: this.imgArr, // 问题图片信息 非必输
					createType: 3,
					flag: this.isMedicalMan ? 1 : 0 // 上报人类型，0-维修人员，1-医护人员
				};
				this.postGenerateRepairsTask(temporaryMessage)
				},

				// 生成工程任务
				postGenerateRepairsTask (data) {
				this.infoText = '提交中···';
				this.showLoadingHint = true;
				reportProblem(data).then((res) => {
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						this.$refs.alertToast.show({
							type: 'success',
							message: '提交成功!',
							isShow: true
						});
						setTimeout(() => {
							this.backTo();
						},2000);
						this.resetEvent();
					} else {
						this.$refs.alertToast.show({
							type: 'error',
							message: `${res.data.msg}!`,
							isShow: true
						})
					}
				})
				.catch((err) => {
					this.showLoadingHint = false;
					this.$refs.alertToast.show({
						type: 'error',
						message: `${err}!`,
						isShow: true
					})
				})
				},
				
				// 重置事件
				resetEvent () {
					this.priorityRadioValue = '1';
					this.goalDepartmentDefaultIndex = [0];
					this.currentGoalDepartment = '请选择';
					this.currentGoalSpaces = '请选择';
					this.goalSpacesDefaultIndex = [0];
					this.taskTypeDefaultIndex = [0];
					this.currentTaskType = '请选择';
					this.imgArr = [];
					this.taskDescribe = []
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
		.content-box-inner {
				width: 100%;
				height: 0;
				background: #f7f7f7;
				z-index: 10;
				flex: 1;
				overflow: auto;
				padding: 0 0 10px 0;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				::v-deep .u-empty {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%,-50%)
				};
				.message-box {
					height: 100%;
					width: 100%;
					overflow: scroll;
					.message-one {
						width: 100%;
						padding: 10px 6px 10px 10px;
						box-sizing: border-box;
						background: #fff;
						display: flex;
						align-items: center;
						justify-content: space-between;
						font-size: 14px;
						margin-top: 6px;
						.message-one-left {
							width: 20%;
							color: #9E9E9A;
						};
						.message-one-right {
							flex: 1;
							/deep/ .u-radio-group {
								display: flex;
								justify-content: space-between;
								.u-radio {
									flex: 1 0 auto !important;
									justify-content: center;
									.u-radio__label {
										margin-right: 9px;
									}
								}
							}
						}
					};
					.select-box {
						width: 100%;
						padding: 8px 6px 8px 10px;
						box-sizing: border-box;
						background: #fff;
						display: flex;
						align-items: center;
						justify-content: space-between;
						font-size: 14px;
						margin-top: 6px;
						.select-box-left {
							padding-right: 10px;
							box-sizing: border-box;
							>text {
								&:nth-child(1) {
									color: red
								};
								&:nth-child(2) {
									color: #9E9E9A;
									padding-right: 6px;
									box-sizing: border-box
								};
							}
						};
						.select-box-right {
							flex: 1;
							justify-content: flex-end;
							align-items: center;
							display: flex;
							width: 0;
							>text {
								color: #101010;
								text-align: right;
								flex: 1;
								@include no-wrap();
							}
						}
					};
					.end-select-box {
						.select-box-left {
							>text {
								&:nth-child(1) {
									color: #9E9E9A;
									padding-right: 6px;
									box-sizing: border-box
								};
							}
						};
					};
					.view-photoList {
						background: #fff;
						box-sizing: border-box;
						padding: 10px 6px 10px 10px;
						margin-top: 6px;
						display: flex;
						>view {
							display: inline-block;
							&:first-child {
								font-size: 14px;
								color: #9E9E9A;
								padding-right: 10px;
								box-sizing: border-box;
								vertical-align: top;
								height: 100px;
								line-height: 100px;
							};
							&:nth-child(2) {
								width: calc(100% - 80px);
								font-size: 34px;
								>view {
									width: 32%;
									height: 100px;
									display: inline-block;
									vertical-align: top;
									margin-right: 2%;
									margin-top: 2%;
									position: relative;
									&:nth-child(1) {
										margin-top: 0;
									};
									&:nth-child(2) {
										margin-top: 0;
									};
									&:nth-child(3) {
										margin-top: 0;
									};
									&:nth-child(3n+3) {
										margin-right: 0;
									};
									::v-deep .u-icon {
										position: absolute;
										top: -12px;
										right: 0
									};
									image {
										width: 100%;
										height: 100%
									}
								}
							}
						}
					};
					.transport-type {
						width: 100%;
						padding: 10px 6px 10px 10px;
						box-sizing: border-box;
						background: #fff;
						display: flex;
						justify-content: space-between;
						margin-top: 6px;
						font-size: 14px;
						margin-top: 6px;
						.transport-type-left {
							padding: 10px 10px 0 0;
							box-sizing: border-box;
							>text {
								&:nth-child(1) {
									color: #9E9E9A
								}
							}
						};
						.transport-type-right {
							flex: 1;
							width: 0;
							display: flex;
							flex-wrap: wrap;
							/deep/ .u-textarea {
								flex: 1;
								padding:10px 0 10px 4px;
								color: $color-text-left;
								background: #f9f9f9;
							}
						}
					}
				}
		};
		.btn-box {
			width: 100%;
			background: #F8F8F8;
			height: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
			>text {
				width: 35%;
				display: inline-block;
				height: 45px;
				font-size: 14px;
				line-height: 45px;
				background: #fff;
				text-align: center;
				border-radius: 4px;
				&:nth-child(1) {
					color: #2B98FE;
					border: 1px solid #2B98FE;
					box-sizing: border-box;
					margin-right: 30px;
					box-shadow: 0px 2px 6px 0 rgba(0, 0, 0, 0.4);
				};
				&:nth-child(2) {
					color: #fff;
					background: #2B98FE;
					box-shadow: 0px 2px 6px 0 rgba(0, 0, 0, 0.4);
				}
			}
		}
	}
</style>
