<template>
  <view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast"></u-toast>
		<view class="nav">
			<nav-bar :home="false" backState='3000' :isShowBackText="true" fontColor="#FFF" bgColor="none" title="物资申领" @backClick="backTo">
			</nav-bar> 
		</view>
    <view class="content">
			<view class="content-top">
				<view class="content-top-left">
					<text>已添加产品</text>
				</view>
				<view class="content-top-right" @click="addProductEvent">
					<u-icon name="plus-circle" color="#fff" size="18"></u-icon>
					<text>添加产品</text>
				</view>
			</view>
			<view class="content-center">
				<view class="product-list" v-for="(item,index) in materialList" :key="item.productName">
					<view class="product-left">
						<image :src="item.productImage" mode="widthFix"></image>
					</view>
					<view class="product-center">
						<view class="product-name">
							<text>
								{{ item.productName }}
							</text>
						</view>
						<view class="product-specification">
							<view class="product-specification-left">
								<text>
									{{ item.specification }}
								</text>
							</view>
							<view class="product-specification-right">
								<text>￥</text>
								<text>
									{{ item.unitPrice }}
								</text>
								<text>
									{{ `/${item.unit}` }}
								</text>
							</view>
						</view>
					</view>
					<view class="product-right">
						<view class="product-number-box">
							<u-number-box v-model="item.quantity" @change="function(val){productNumberBoxChange(item,index,val)}" integer :min="0"></u-number-box>
						</view>
						<view class="product-total-price">
							<text>￥</text>
							<text>{{ item.totalPrice }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="total-prices">
				<view class="total-prices-right">
					<text>合计:</text>
					<text>{{ `￥${allChooseProductPrice}` }}</text>
				</view>
			</view>
			<view class="content-bottom">
				<view class="content-bottom-left">
					<text>保存</text>
				</view>
				<view class="content-bottom-right">
					<text>保存并继续</text>
				</view>
			</view>
    </view>
		<!-- 添加产品弹框 -->
		<view class="add-product-popup-box">
			<u-popup :show="productChooseShow" mode="bottom" :round="10" :closeable="true" @close="productChoosePopupCloseEvent">
				<view class="popup-content">
					<view class="product-popup-top">
						<view class="input-box">
							<u--input
								placeholder="请输入搜索关键词"
								border="none"
								v-model="searchValue"
								@change="searchChange"
							></u--input>
						</view>
						<view class="search-box">
							<u-icon name="search" color="#888888" size="20"></u-icon>
						</view>
					</view>
					<view class="product-popup-center">
							
					</view>
					<view class="product-popup-bottom">
							<view class="cancel-box" @click="productChoosePopupCloseEvent">
								<text>取消</text>
							</view>
							<view class="add-box" @click="addSureEvent">
								<text>添加</text>
							</view>
					</view>
				</view>
			</u-popup>
		</view>
  </view>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import { repairsDetails, repairsImage } from "@/api/project.js";
import { setCache, removeAllLocalStorage, } from '@/common/js/utils'
import navBar from "@/components/zhouWei-navBar"
export default {
  components: {
		navBar
  },
  data() {
    return {
			infoText: '加载中···',
			showLoadingHint: false,
			tierNum: 0,
			searchValue: '',
			allChooseProductPrice: 0,
			materialList: [
				{
					productName: '洗手液',
					specification: '500ML',
					unit: '瓶',
					unitPrice: '4.5',
					totalPrice: 0,
					quantity: 0,
					productImage: require('@/static/img/home-apply-icon.png')
				},
				{
					productName: '一次性垫',
					specification: '90*40cm',
					unit: '包',
					unitPrice: '8.3',
					totalPrice: 0,
					quantity: 0,
					productImage: require('@/static/img/home-apply-icon.png')
				}
			],
			productChooseShow: false
    }
  },
	
	onShow () {
		const pages = getCurrentPages(); //获取当前页面栈的实例数组
		if (pages.length == 1) {
			this.tierNum = 1
		} else {
			this.tierNum = pages.length;
		}
	},
	
  watch: {},

  computed: {
    ...mapGetters(["userInfo",'statusBarHeight','navigationBarHeight']),
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

  methods: {
    ...mapMutations([
		]),

    // 顶部导航返回事件
     backTo () {
     	uni.navigateBack()
     },
		 
		 // 求和函数(计算所有添加产品总价格)
		 reduceTotal() {
			 let targetMsg = this.materialList.filter((item) => {
				 return item.quantity > 0
			 });
			 this.allChooseProductPrice = targetMsg.reduce((accumulator, currentValue) => {
				 return accumulator + currentValue.totalPrice
			 }, 0);
		 },
		 
		 // 保留两位小数，返回数字类型，修复精度问题
		 formatPrice(num) {
		   if (typeof num !== 'number') return 0;
		   return Number(num.toFixed(2));
		 },
		 
		 // 产品步进器change事件
		 productNumberBoxChange(item,index,val) {
			 item['totalPrice'] = this.formatPrice(item['unitPrice'] * val['value']);
			 this.reduceTotal();
		 },
		 
		 // 添加产品事件
		 addProductEvent () {
			 this.productChooseShow = true;
		 },
		 
		 // 添加产品弹框关闭事件
		 productChoosePopupCloseEvent () {
			 this.productChooseShow = false;
		 },
		 
		 // 搜索框值改变事件
		 searchChange () {},
		 
		 // 添加确认事件
		 addSureEvent () {
			 this.productChooseShow = false;
		 }
	}
};
</script>
<style lang='scss' scoped>
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
	.add-product-popup-box {
		::v-deep .u-popup {
			.u-popup__content {
				.u-popup__content__close {
					.u-icon__icon {
						font-size: 20px !important;
						color: #101010 !important;
					}
				}
			};
			.popup-content {
				width: 100%;
				height: 50vh;
				display: flex;
				flex-direction: column;
				padding: 0 14px;
				box-sizing: border-box;
				.product-popup-top {
				height: 80px;
				display: flex;
				align-items: center;
				border-bottom: 1px solid #BBBBBB;
				.input-box {
					width: 65%;
					height: 40px;
					display: flex;
					align-items: center;
					padding-left: 10px;
					box-sizing: border-box;
					border: 1px solid #888888;
					border-top-left-radius: 5px;
					border-bottom-left-radius: 5px; 
				};
				.search-box {
					width: 15%;
					height: 40px;
					display: flex;
					align-items: center;
					box-sizing: border-box;
					border: 1px solid #888888;
					justify-content: center;
					border-top-right-radius: 5px;
					border-bottom-right-radius: 5px; 
				}
			};
			.product-popup-center {
				flex: 1;
				overflow: auto;
			};
			.product-popup-bottom {
				height: 80px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.cancel-box {
					width: 40%;
					height: 48px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 26px;
					box-shadow: 0px 2px 6px 0 rgba(123,233,160,0.38);
					>text {
						font-size: 18px;
						color: #11D183
					}
				};
				.add-box {
					width: 40%;
					height: 48px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 26px;
					background: #11D183;
					>text {
						font-size: 18px;
						color: #fff;
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
  };
  .content {
		 width: 100%;
		 flex: 1;
		 overflow: auto;
		 padding: 0 0 10px 0;
		 box-sizing: border-box;
		 display: flex;
		 flex-direction: column;
		 .content-top {
			 height: 40px;
			 padding: 0 14px;
			 box-sizing: border-box;
			 display: flex;
			 align-items: center;
			 justify-content: space-between;
			 .content-top-left {
				 >text {
					font-size: 14px;
					color: #777575; 
				 }
			 };
			 .content-top-right {
				 width: 84px;
				 height: 27px;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 background: #3B9DF9;
					>text {
						font-size: 12px;
						color: #fff;
						margin-left: 4px;
					}
			 }
		 };
		 .content-center {
			 width: 96%;
			 padding: 0 4px;
			 box-sizing: border-box;
			 flex: 1;
			 margin: 0 auto;
			 border-radius: 6px;
			 background: #F0F2FE;
			 overflow: auto;
			 .product-list {
				 padding: 10px 4px;
				 box-sizing: border-box;
				 border-bottom: 1px solid #BBBBBB;
				 display: flex;
				 align-items: center;
				 .product-left {
					 margin-right: 10px;
					 image {
						 width: 54px;
						 height: 54px;
					 }
				 };
				 .product-center {
					 flex: 1;
					 .product-name {
						 @include no-wrap;
						 margin-bottom: 4px;
						 >text {
							 width: 100%;
							 display: inline-block;
							 @include no-wrap;
							 font-size: 14px;
							 color: #3B9DF9;
						 }
					 };
					 .product-specification {
						 display: flex;
						 .product-specification-left {
							 margin-right: 10px;
							 >text {
								 font-size: 12px;
								 color: #777575;
							 }
						 };
						 .product-specification-right {
							 >text {
								 font-size: 12px;
								 color: #F44E23;
							 }
						 }
					 }
				 };
				 .product-right {
					 display: flex;
					 flex-direction: column;
					 justify-content: center;
					 .product-number-box {
						 margin-bottom: 4px;
					 };
					 .product-total-price {
						 text-align: center;
						 >text {
							 font-size: 12px;
							 color: #F44E23;
						 }
					 }
				 }
			 }
		 };
		 .total-prices {
			 width: 96%;
			 height: 40px;
			 display: flex;
			 align-items: center;
			 justify-content: flex-end;
			 margin: 0 auto;
			 .total-prices-right {
				>text {
				 font-size: 14px;
				 color: #E86F50;
				 &:nth-child(1) {
					 margin-right: 4px;
				 }
				} 
			 }
		 };
		 .content-bottom {
			 height: 60px;
			 padding: 0 14px;
			 box-sizing: border-box;
			 display: flex;
			 align-items: flex-start;
			 justify-content: space-between;
			 .content-bottom-left {
				 width: 45%;
				 height: 32px;
				 border: 1px solid #11D183;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 >text {
					font-size: 12px;
					color: #11D183;
				 }
			 };
			 .content-bottom-right {
				 width: 45%;
				 height: 32px;
				 display: flex;
				 align-items: center;
				 justify-content: center;
				 border-radius: 4px;
				 background: #11D183;
					>text {
						font-size: 12px;
						color: #fff;
					}
			 }
		 }
  }
}
</style>