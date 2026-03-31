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
	import navBar from "@/components/zhouWei-navBar"
	import { setCache,removeAllLocalStorage, getDate } from '@/common/js/utils'
	import { createPlanOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
				loadingShow: false,
				chooseMaterialList: [],
				taskDescribe: '',
				deliveryAddress: '',
				deliveryAddressId: '',
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
				currentHospital: '请选择',
				currentHospitalId: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'addMaterialApplicationMessage',
				'materialApplicationOrderType'
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
			this.disposeAddMaterialListEvent()
		},
		methods: {
			...mapMutations([
				'changeAddMaterialApplicationMessage'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 处理添加产品列表信息
			disposeAddMaterialListEvent () {
				this.chooseMaterialList = [];
				 if (this.addMaterialApplicationMessage.length > 0) {
					 for (let item of this.addMaterialApplicationMessage) {
							this.chooseMaterialList.push({
								id: '', /*订单项编号 */
								productId: item['id'], /*产品编号 */
								productUnitId: item['unitId'], /*单位编号 */
								productPrice: item['salePrice'], /*产品单价，单位：元 */
								count: item['quantity'], /*数量*/
								taxPercen: '', /*产品税率*/
								remark: item['remark'] === '无' ? '' : item['remark'] /*产品备注 */
							}) 
					 }
				 }
			},
			
			// 回显医院和科室信息
			echoHospitalMessage () {
				// 医院信息
				if (this.proId || this.proId === 0) {
					this.currentHospitalId = this.proId
				};
				if (this.proName) {
					this.currentHospital = this.proName
				};
				// 科室信息
				if (this.depId || this.depId === 0) {
					this.deliveryAddressId = this.depId
				};
				if (this.depName) {
					this.deliveryAddress = this.depName
				}
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
						this.currentHospital = val;
						this.currentHospitalId = value
					} else {
						this.currentHospital = '请选择';
						this.currentHospitalId = ''
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
					// 医院不能为空
					if (this.currentHospital == '请选择') {
						this.$refs.uToast.show({
							message: '医院不能为空',
							position: 'center'
						});
						return
					};
					// 送货地址不能为空
					if (this.deliveryAddress === '') {
						this.$refs.uToast.show({
							message: '送货地址不能为空',
							position: 'center'
						});
						return
					};
					// 创建计划订单
					let temporaryMessage = {
							creator: this.userName, //创建者
						  orderTime: this.deliveryDate, //下单时间
						  creatorId: this.workerId, //当前用户ID
						  customerId: this.workerId,  //客户编号
							remark: this.taskDescribe, //备注
							address: this.deliveryAddress, //送货地址
							departmentId: this.depId, //科室ID
							items: this.chooseMaterialList, //订单清单列表
							id: '', //编号
						  saleUserId: '', //销售员编号
						  accountId: '', //结算账户编号
						  discountPercent: '', //优惠率，百分比
						  depositPrice: '', //定金金额，单位：元
						  fileUrl: '', //附件地址
						  createUserType: '', //创建人类型
						  orderType: this.materialApplicationOrderType, //订单类型 0-计划订单 1-临时订单
						  version:'' 
					};
					this.createPlanOrderEvent(temporaryMessage)
				},

				// 物资申领提交
				createPlanOrderEvent (data) {
					this.infoText = '提交中···';
					this.showLoadingHint = true;
					createPlanOrder(data).then((res) => {
						this.showLoadingHint = false;
						if (res && res.data.code == 0) {
							this.$refs.alertToast.show({
								type: 'success',
								message: '提交成功!',
								isShow: true,
								isShowSupplement: true
							});
							setTimeout(() => {
								this.backTo();
							},2000);
							this.changeAddMaterialApplicationMessage([]);
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
			height: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
			>text {
				width: 40%;
				display: inline-block;
				height: 32px;
				font-size: 14px;
				line-height: 32px;
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
