<template>
	<view class="content-box">
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" @backClick="backTo">
			</nav-bar>
		</view>
		<view class="content">
			<view class="submit-success-icon">
				<u-icon name="checkmark-circle-fill" color="#289E8E" size="60"></u-icon>
			</view>
			<view class="submit-success-text">
				<text>提交成功！</text>
			</view>
			<view class="submit-success-replenish">
				<text>请耐心等待商家处理</text>
			</view>
		</view>
		<view class="bottom-btn">
				<view class="back-box" @click="backTo">
					<text>返回</text>
				</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {}
		},
		computed: {
			...mapGetters([
				'statusBarHeight',
				'navigationBarHeight'
			])
		},
		methods: {
			...mapMutations([
			]),
			
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
		background: #fff;
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
			width: 100%;
			background: #fff;
			z-index: 10;
			flex: 1;
			height: 0;
			padding: 0 0 20px 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			.submit-success-icon {
				margin-bottom: 40px;
			};
			.submit-success-text {
				margin-bottom: 10px;
				word-break: break-all;
				>text {
					font-size: 14px;
					color: #101010;
				}
			};
			.submit-success-replenish {
				word-break: break-all;
				>text {
					font-size: 14px;
					color: #101010;
				}
			}
		};
		.bottom-btn {
			height: 100px;
			width: 94%;
			margin: 0 auto;
			display: flex;
			align-items: center;
			justify-content: center;
			.back-box {
				 width: 70%;
				 height: 32px;
				 border: 1px solid #44CC72;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 >text {
					font-size: 12px;
					color: #44CC72;
				 }
			}
		}
	}
</style>
