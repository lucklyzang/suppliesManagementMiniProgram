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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="意见反馈" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="feedback-icon">
				<image src="/static/img/feedback-icon.png"></image>
			</view>
			<view class="idea-type">
				<text>*</text>意见类型
			</view>
			<view class="idea-type-list">
				<text v-for="(item,index) in opinionTypeList" :class="{'opinionTypeStyle': opinionTypeIndex == index}" :key="index" @click="opinionTypeEvent(item,index)">{{item}}</text>
			</view>
			<view class="feedback-idea">
				<text>*</text>反馈意见
			</view>
			<u--textarea v-model="deedbackContent" maxlength="500" count placeholder="请输入反馈意见"></u--textarea>
			<view class="guess-speak">
				<text>
					猜你想说 :
				</text>
			</view>
			<view class="guess-speak-list">
				<text v-for="(innerItem,innerIndex) in totalGuessSpeakList" :class="{'guessSpeakListStyle' : guessSpeakListIndex === innerIndex}" @click="totalGuessSpeakListEvent(innerItem,innerIndex)" :key="innerIndex">{{innerItem.name}}</text>
			</view>
		</view>
		<view class="bottom-area">
			<view class="quit-area" :class="{'quitAreaStyle' : opinionTypeIndex === null || deedbackContent === ''}" @click="submitFeedBackEvent">提交反馈</view>
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
	} from '@/common/js/utils'
	import store from '@/store'
	import { queryFeedback, submitFeedback } from '@/api/public.js'
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
				opinionTypeList: ['人员','功能故障','其它意见'],
				opinionTypeIndex: null,
				guessSpeakListIndex: null,
				totalGuessSpeakList: [],
				deedbackContent: ''
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
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 意见反馈栏意见类型点击事件
			opinionTypeEvent (item,index) {
				this.opinionTypeIndex = index;
				this.deedbackContent = '';
				this.guessSpeakListIndex = null;
				// 查询总体反馈意见
				this.inquireFeedback({
					proId: this.proId,
					signFlag: 1,
					typeFlag: index + 1,
					state: 1
				})
			},
			
			
			// 总体反馈猜你想说项点击事件
			totalGuessSpeakListEvent(innerItem,innerIndex) {
				this.guessSpeakListIndex = innerIndex;
				if (this.deedbackContent.length == 0) {
					this.deedbackContent = `${innerItem.name}`
				} else {
					this.deedbackContent = `${this.deedbackContent},${innerItem.name}`
				}
			},
			
			// 查询总体反馈意见
			inquireFeedback (data) {
				this.totalGuessSpeakList = [];
				queryFeedback(data).then((res) => {
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let item of res.data.data) {
								this.totalGuessSpeakList.push({
									name: item.content
								})
							}
						}
					} else {
						this.$refs.uToast.show({
						  message: `${res.data.msg}`,
						  type: 'warning'
						})
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
					  message: `${err.message}`,
					  type: 'warning'
					})
				})
			},
						
			// 提交意见反馈
			submitFeedBackEvent () {
				if (this.opinionTypeIndex === null) {
					this.$refs.uToast.show({
					  message: '请选择意见类型',
					  type: 'warning'
					})
					return
				};
				if (this.deedbackContent == '') {
					this.$refs.uToast.show({
					  message: '请填写反馈意见',
					  type: 'warning'
					})
					return
				};
				submitFeedback({
					proId: this.proId,
					feedbackId : this.workerId, // 反馈者ID
					typeFlag: this.opinionTypeIndex + 1, //意见类型
					feedbackName : this.userAccount, // 反馈者名称
					feedbackRole : '', //反馈角色，暂定为医务人员的 role 字段
					depId : this.depId  , //反馈科室ID，医务人员depId字段
					depName:  this.depName , //反馈科室名称医务人员depName字段
					content : this.deedbackContent , //反馈内容，可以为空，点赞默认为空
					type : 1, //反馈类型(1-意见反馈，2-赞)
					terminal : 2, //反馈终端(1-客户端，2-小程序)
				}).then((res) => {
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
						  message: '意见反馈成功',
						  type: 'success'
						});
						setTimeout(()=>{
							this.backTo();
						},2000);
					} else {
						this.$refs.uToast.show({
						  message: `${res.data.msg}`,
						  type: 'warning'
						})
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
					  message: `${err.message}`,
					  type: 'warning'
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
		.content {
			 flex: 1;
			 overflow: auto;
			 padding: 0 30px;
			 box-sizing: border-box;
			 position: relative;
			 background: #F8F8F8;
			 .feedback-icon {
					height: 140px;
					display: flex;
					flex-flow: row nowrap;
					justify-content: center;
					align-items: center;
					>image {
						width: 60px;
						height: 60px;
					}
			 };
			 .idea-type {
					color: black;
					font-size: 14px;
					font-weight: bold;;
					margin-bottom: 20px;
					>text {
						color: red;
					}
			 };
			 .guess-speak {
					font-size: 12px;
					color: #a59f9f;
					height: 40px;
					line-height: 40px
			 };
			 .guess-speak-list {
			 		display: flex;
			 		flex-flow: row wrap;
			 		justify-content: flex-start;
			 		margin: 0 0 20px 0;
			 		min-height: 80px;
			 		overflow: auto;
			 		text {
			 			font-size: 13px;
			 			color: #a59f9f;
			 			display: inline-block;
			 			padding: 0 8px;
			 			box-sizing: border-box;
			 			height: 25px;
			 			line-height: 25px;
			 			text-align: center;
			 			border: 1px solid #a59f9f;
			 			margin: 0 8px 8px 0;
			 		};
					.guessSpeakListStyle {
						border: 1px solid #266FFF;
					}
			 };
			 .idea-type-list {
					display: flex;
					flex-flow: row wrap;
					justify-content: space-between;
					text {
						font-size: 13px;
						color: #266FFF;
						background: #fff;
						border-radius: 4px;
						display: inline-block;
						width: 90px;
						padding: 8px 0;
						box-sizing: border-box;
						text-align: center;
						border: 1px solid #266FFF;
						margin: 0 0 8px 0;
					};
					.opinionTypeStyle {
						border: none;
						background: #266FFF;
						color: #ffff;
					}
			 };
			 .feedback-idea {
					color: black;
					font-size: 14px;
					font-weight: bold;
					margin: 20px 0;
					>text {
						color: red;
					}
			 };
			 ::v-deep .u-textarea{
			 	padding: 9px 9px 18px 9px !important;
			 };
		};
		.bottom-area {
			height: 110px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 10px;
			box-sizing: border-box;
			.quit-area {
				display: block;
				height: 44px;
				background: #3890EE;
				border-radius: 4px;
				font-size: 14px;
				color: #fff;
				line-height: 44px;
				text-align: center;
				width: 60%;
			};
			.quitAreaStyle {
				opacity: .6;
			}
		}
	}
</style>
