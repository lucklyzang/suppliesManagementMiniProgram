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
		<!-- 医院 -->
		<view class="transport-rice-box" v-if="showHospital">
			<ScrollSelection v-model="showHospital" :pickerValues="hospitalDefaultIndex" :isShowSearch="true" :columns="hospitalOption" title="医院" @sure="hospitalSureEvent" @cancel="hospitalCancelEvent" @close="hospitalCloseEvent" />
		</view>
		<view class="nav">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="产品申领" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content-box-inner">
			<view class="message-box">
				<view class="select-box" @click="showHospital = true">
					<view class="select-box-left">
						<text>*</text>
						<text>医院</text>
					</view>
					<view class="select-box-center">
						<text>{{ currentHospital }}</text>
					</view>
					<view class="select-box-right">
						<u-icon name="arrow-right" color="#101010" size="20" /></u-icon>
					</view>
				</view>
				<view class="select-box address-box">
					<view class="select-box-left">
						<text>*</text>
						<text>送货地址</text>
					</view>
					<view class="select-box-right">
						 <u--input
								v-model="deliveryAddress"
						    placeholder="请输入送货地址"
						    border="none"
						    clearable
						  ></u--input>
					</view>
				</view>
				<view class="select-box">
					<view class="select-box-left">
						<text>*</text>
						<text>交货日期</text>
					</view>
					<view class="select-box-center">
							<text>{{ deliveryDate }}</text>
					</view>
					<view class="select-box-right" @click="showDeliveryDate = true">
						<u-icon name="calendar" color="#101010" size="24" /></u-icon>
					</view>
				</view>
				<view class="transport-type">
					<view class="transport-type-left">
						<text>备注:</text>
					</view>
					<view class="transport-type-right">
						<u--textarea v-model="taskDescribe" placeholder="请输入备注" border="none"></u--textarea>
					</view>
				</view>
			</view>
		</view>
		<view class="btn-box">
			<text class="operate-two" @click="sureEvent">提交</text>
		</view>
		<!-- 送货时间选择框 -->
		 <u-datetime-picker
			@cancel="showDeliveryDate = false" 
			@confirm="deliveryDateSure"
			:show="showDeliveryDate"
			v-model="deliveryDatevalue"
			mode="date"
		></u-datetime-picker>
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
	import { setCache,removeAllLocalStorage, getDate } from '@/common/js/utils'
	import SOtime from '@/common/js/utils/SOtime.js';
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
				loadingShow: false,
				searchValue: '',
				taskDescribe: '',
				deliveryAddress: '',
				deliveryDate: getDate(),
				deliveryDatevalue: this.normalizeTimestamp(),
				showDeliveryDate: false,
				hospitalOption: [
					{
						text: '医院1',
						value: 1,
						id: 0
					},
					{
						text: '医院2',
						value: 2,
						id: 1
					},
					{
						text: '医院3',
						value: 3,
						id: 2
					}
				],
				hospitalDefaultIndex: [0],
				showHospital: false,
				currentHospital: '请选择'
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				"templateType"
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
		},
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 将时间戳转换为当天的 00:00:00
			normalizeTimestamp () {
			  const date = new Date();
			  date.setHours(0, 0, 0, 0);
			  return Number(date)
			},
			
				// 医院下拉选择框确认事件
				hospitalSureEvent (val,value,id) {
					if (val) {
						this.hospitalDefaultIndex = [id];
						this.currentHospital = val
					} else {
						this.currentHospital = '请选择'
					};
					this.showHospital = false
				},

				// 医院下拉选择框取消事件
				hospitalCancelEvent () {
					this.showHospital = false
				},

				// 医院下拉选择框关闭事件
				hospitalCloseEvent () {
					this.showHospital = false
				},
				
				// 送货时间选择框确认事件
				deliveryDateSure (e) {
					this.deliveryDate = SOtime.time8(e.value);
					this.showDeliveryDate = false
				},

				// 确认事件
				sureEvent () {
					this.$refs.alertToast.show({
						type: 'success',
						message: `提交成功!`,
						supplementMessage: '请在“订单”里面查看申领进度',
						isShow: true,
						isShowSupplement: true
					});
					return;
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
		.content-box-inner {
				width: 100%;
				height: 0;
				background: #fff;
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
						justify-content: center;
						font-size: 14px;
						margin-top: 6px;
						.select-box-left {
							min-width: 88px;
							padding-right: 6px;
							box-sizing: border-box;
							>text {
								&:nth-child(1) {
									color: red;
									margin-right: 2px;
								};
								&:nth-child(2) {
									color: #9E9E9A;
									padding-right: 6px;
									box-sizing: border-box
								}
							}
						};
						.select-box-center {
								flex: 1;
								display: flex;
								align-items: center;
								>text {
									color: #101010;
									text-align: left;
									display: inline-block;
									width: 100%;
									@include no-wrap();
								}
						};
						.select-box-right {
							align-items: center;
							display: flex;
						}
					};
					.address-box {
						.select-box-right {
							align-items: center;
							display: flex;
							flex: 1;
						}
					};
					.transport-type {
						width: 100%;
						padding: 10px 6px 10px 10px;
						box-sizing: border-box;
						background: #fff;
						display: flex;
						flex-direction: column;
						margin-top: 6px;
						font-size: 14px;
						.transport-type-left {
							margin-bottom: 6px;
							>text {
								&:nth-child(1) {
									color: #101010;
								}
							}
						};
						.transport-type-right {
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
					color: #fff;
					box-sizing: border-box;
					background: #11D183;
				}
			}
		}
	}
</style>
