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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="订单" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="status-date-box">
				<view class="status-box">
					啥数据库
				</view>
				<view class="data-box">
					<view class="date-text">
						<text>日期:</text>
					</view>
					<view class="date-choose">
						<text @click="showStartDate = true">{{ startDate }}</text>
						<u-icon name="arrow-rightward" color="#CACACA" size="18" /></u-icon>
						<text @click="showEndDate = true">{{ endDate }}</text>
						<u-icon name="calendar" color="#CACACA" size="20" /></u-icon>
					</view>
				</view>
			</view>
			<view class="order-list-box"></view>
		</view>
		<!-- 开始时间选择框 -->
		 <u-datetime-picker
			@cancel="showStartDate = false" 
			@confirm="startDateSure"
			:show="showStartDate"
			v-model="startDatevalue"
			mode="date"
		></u-datetime-picker>
		<!-- 结束时间选择框 -->
		 <u-datetime-picker
			@cancel="showEndDate = false" 
			@confirm="endDateSure"
			:show="showEndDate"
			v-model="endDatevalue"
			mode="date"
		></u-datetime-picker>
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
				showStartDate: false,
				startDate: getDate(),
				startDatevalue: this.normalizeTimestamp(),
				showEndDate: false,
				endDate: getDate(),
				endDatevalue: this.normalizeTimestamp(),
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
		methods: {
			...mapMutations([
			]),
			
			// 将时间戳转换为当天的 00:00:00
			normalizeTimestamp () {
			  const date = new Date();
			  date.setHours(0, 0, 0, 0);
			  return Number(date)
			},
			
			// 开始时间选择框确认事件
			startDateSure (e) {
				this.startDate = SOtime.time8(e.value);
				this.showStartDate = false
			},
			
			// 结束时间选择框确认事件
			ensDateSure (e) {
				this.endDate = SOtime.time8(e.value);
				this.showEndDate = false
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
			background: #44CC72;
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
			 background: #F8F8F8;
			 display: flex;
			 flex-direction: column;
			 .status-date-box {
				 height: 40px;
				 display: flex;
				 align-items: center;
				 justify-content: space-between;
				 .status-box {
					 width: 90px;
					 margin-right: 10px;
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
			 }
		}
	}
</style>
