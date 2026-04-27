<template>
  <view class="content-box">
		<u-overlay :show="showLoadingHint"></u-overlay>
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
					<text>{{ productChooseShow ? '添加物资' : '添加产品' }}</text>
				</view>
			</view>
			<view class="content-center">
				<view class="empty-info" v-if="chooseMaterialList.length == 0">
					<u-empty text="暂无产品" mode="list"></u-empty>
				</view>
				<view class="product-list" v-for="(item,index) in chooseMaterialList" :key="item.productName">
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
									{{ item.standard }}
								</text>
							</view>
							<view class="product-specification-right">
								<text>￥</text>
								<text>
									{{ item.salePrice }}
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
							<text>{{ item.showTotalPrice }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="total-prices">
				<view class="total-prices-right">
					<text>合计:</text>
					<text>{{ `￥${formatPrice(allChooseProductPrice)}` }}</text>
				</view>
			</view>
			<view class="content-bottom">
				<view class="content-bottom-left" @click="materialApplicationSaveEvent">
					<text>保存</text>
				</view>
				<view class="content-bottom-right" @click="materialApplicationSubmitEvent">
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
							></u--input>
						</view>
						<view class="search-box" @click="searchChange">
							<u-icon name="search" color="#888888" size="20"></u-icon>
						</view>
					</view>
					<view class="product-popup-center">
							<view class="empty-info" v-if="materialList.length == 0">
								<u-empty text="暂无产品" mode="list"></u-empty>
							</view>
							<view class="add-product-popup-list" v-for="(item,index) in materialList" :key="item.id" @click="addProductItemEvent(item,index)">
								<view class="add-product-popup-top">
									<view class="add-product-popup-top-left">
										<image :src="item.productImage" mode="widthFix"></image>
										<view>
											<text>
												{{ item.productName }}
											</text>
										</view>
										<view>
											<text>
												{{ `,${item.standard},` }}
											</text>
										</view>
										<view>
											<text>￥</text>
											<text>
												{{ item.salePrice }}
											</text>
											<text>
												{{ `/${item.unit}` }}
											</text>
										</view>
									</view>
									<view class="add-product-popup-top-right" :class="{'popupTopRightStyle':item.checked == true, 'popupTopRightDisabledStyle':item.disabled == true}">
										<u-icon v-if="item.checked == true" name="checkbox-mark" color="#fff" size="18"></u-icon>
									</view>
								</view>
								<view class="add-product-popup-bottom" @click.stop="handleClick">
									<text>*</text>
									<text>请输入数量:</text>
									<u--input 
									   v-model="item.quantity"
										type="number"
										:disabled="item.disabled"
										placeholder="请输入数量"
									   border="none"
									 ></u--input>
								</view>
							</view>
					</view>
					<view class="page-area">
						<view class="page-left" @click="pageClickEvent('previous')" :class="{'pageSpanStyle' : currentPage == 1}">上一页</view>
						<view class="page-center">
							<text>{{ totalPage == 0 ? 0 : currentPage }}</text>
							<text>/</text>
							<text>{{ totalPage }}</text>
						</view>
						<view class="page-right" @click="pageClickEvent('next')" :class="{'pageSpanStyle' : currentPage == totalPage}">下一页</view>
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
import { setCache, removeAllLocalStorage } from '@/common/js/utils'
import { getProductSimpleList, getPlanOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import navBar from "@/components/zhouWei-navBar"
import _ from 'lodash'
export default {
  components: {
		navBar
  },
  data() {
    return {
			infoText: '加载中···',
			isEdit: false,
			showLoadingHint: false,
			productDefaultImage: require('@/static/img/basic-message.png'),
			tierNum: 0,
			searchValue: '',
			allChooseProductPrice: 0,
			totalPage: '',
			pageSize: 6,
			currentPage: 1,
			orderMessage: {},
			temporaryMaterialList: [],
			originalMaterialList: [],
			materialList: [],
			chooseMaterialList: [],
			productChooseShow: false,
			orderId: ''
    }
  },
	
	onLoad (options) {
		// 编辑
		if (JSON.stringify(options) != '{}') {
			this.isEdit = true;
			this.orderId = Number(options.id);
			this.getPlanOrderEvent(Number(options.id))
		} else {
			// 新建
			this.isEdit = false;
			this.echoAddMaterialListEvent()
		};
		this.getProductSimpleListEvent()
	},
	
  watch: {},

  computed: {
    ...mapGetters([
			"userInfo",
			'statusBarHeight',
		  'navigationBarHeight',
			'addMaterialApplicationMessage',
			'editOrderMessage',
			'editMaterialApplicationMessage'
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

  methods: {
    ...mapMutations([
			'changeAddMaterialApplicationMessage',
			'changeEditMaterialApplicationMessage'
		]),

    // 顶部导航返回事件
    backTo () {
			// 编辑成功后,调取订单列表页的更新所编辑订单信息的方法
     	// 获取页面栈
			if (this.isEdit && this.editOrderMessage['editStatus'] == '成功') {
				// 清空暂存的编辑产品列表信息
				let temporaryEditMaterialApplicationMessage = _.cloneDeep(this.editMaterialApplicationMessage);
				let temporaryProductList = temporaryEditMaterialApplicationMessage.filter((item) => { return item.id != this.orderId});
				this.changeEditMaterialApplicationMessage(temporaryProductList);
				const pages = getCurrentPages();
				const prevPage = pages[pages.length - 2];
				if (prevPage) {
					prevPage.$vm.echoEditOrderMessage();
				}
			};
     	uni.navigateBack()
    },
		 
		 // 回显保存的添加产品列表信息
		 echoAddMaterialListEvent () {
			 if (this.addMaterialApplicationMessage.length > 0) {
				 this.chooseMaterialList = _.cloneDeep(this.addMaterialApplicationMessage);
				 this.reduceTotal();
			 }
		 },
		 
		 // 回显暂存的编辑产品列表数据
		 echoEditMaterialListEvent () {
			 if (this.editMaterialApplicationMessage.length > 0) {
				 let temporaryIndex = this.editMaterialApplicationMessage.findIndex((item) => {return item['id'] == this.orderId});
				 if (temporaryIndex != -1) {
					  this.chooseMaterialList = _.cloneDeep(this.editMaterialApplicationMessage[temporaryIndex]['chooseMaterialList']);
						this.reduceTotal();
				 }
			 }
		 },
		 
		 // 查询订单详情
		 getPlanOrderEvent(id) {
		 	this.showLoadingHint = true;
		 	this.infoText = '加载中···';
			this.chooseMaterialList = [];
		 	getPlanOrder(id).then((res) => {
		 		this.showLoadingHint = false;
		 		this.infoText = '';
		 		if ( res && res.data.code == 0) {
					this.orderMessage = res.data.data;
					this.allChooseProductPrice = res.data.data['totalProductPrice'];
		 			for (let item of res.data.data['items']) {
						this.chooseMaterialList.push({
							id: item['productId'], /*产品编号 */
							productName: item['productName'], /*产品名称 */
							standard: item['standard'] ? item['standard'] : '无', /*产品规格 */
							unit: item['productUnitName'], /*单位 */
							warningCount: item['stockCount'], /*预警数量 */
							productImage: item['images'].length > 0 ? item['images'] : this.productDefaultImage,
							barCode: item['productBarCode'] ? item['productBarCode'] : '', /*产品条码 */
							categoryId: item['categoryId'] ? item['categoryId'] : '', /*产品分类编号 */
							categoryName: item['categoryName'] ? item['categoryName'] : '', /*产品分类 */
							unitId: item['productUnitId'], /*单位编号 */
							remark: item['remark'] ? item['remark'] : '', /*产品备注 */
							expiryDay: item['expiryDay'] ? item['expiryDay'] : '', /*保质期天数 */
							weight: item['weight'] ? item['weight'] : '', /*基础重量（kg） */
							purchasePrice: item['purchasePrice'] ? item['purchasePrice'] : '', /*采购价格，单位：元 */
							salePrice: item['productPrice'] ? item['productPrice'] : 0, /*销售价格，单位：元 */
							minPrice: item['minPrice'] ? item['minPrice'] : '', 	/*最低价格，单位：元 */
							quantity: item['count'],
							totalPrice: item['totalPrice'],
							showTotalPrice: item['totalPrice']
						}) 
		 			};
					// 如果有缓存的该订单编辑产品列表信息,则回显保存的编辑产品列表信息
					if (this.editMaterialApplicationMessage.length > 0) {
						let temporaryIndex = this.editMaterialApplicationMessage.findIndex((item) => {return item['id'] == this.orderId});
						if (temporaryIndex != -1) {
							if (this.editMaterialApplicationMessage[temporaryIndex]['chooseMaterialList'].length > 0) {
								this.echoEditMaterialListEvent()
							}
						}
					}
		 		} else {
		 			this.$refs.uToast.show({
		 				message: res.data.msg,
		 				type: 'error',
		 				position: 'bottom'
		 			})
		 		}
		 	})
		 	.catch((err) => {
		 		this.showLoadingHint = false;
		 		this.infoText = '';
		 		this.$refs.uToast.show({
		 			message: err,
		 			type: 'error',
		 			position: 'bottom'
		 		})
		 	})
		 },
		 
		// 获取产品列表
		getProductSimpleListEvent () {
			this.infoText = '加载中···';
			this.showLoadingHint = true;
			this.materialList = [];
			this.originalMaterialList = [];
			this.temporaryMaterialList = [];
			getProductSimpleList().then((res) => {
				this.showLoadingHint = false;
				if (res && res.data.code == 0) {
					if (res.data.data.length > 0) {
						let temporaryData = res.data.data;
						for (let item of temporaryData) {
							this.originalMaterialList.push({
								id: item['id'], /*产品编号 */
								productName: item['name'], /*产品名称 */
								standard: item['standard'] ? item['standard'] : '无', /*产品规格 */
								unit: item['unitName'], /*单位 */
								warningCount: item['warningCount'] ? item['warningCount'] : 100, /*预警数量 */
								productImage: item['images'][0] ? item['images'][0] : this.productDefaultImage,
								barCode: item['barCode'], /*产品条码 */
								categoryId: item['categoryId'], /*产品分类编号 */
								categoryName: item['categoryName'], /*产品分类 */
								unitId: item['unitId'], /*单位编号 */
								remark: item['remark'] ? item['remark'] : '无', /*产品备注 */
								expiryDay: item['expiryDay'] ? item['expiryDay'] : '无', /*保质期天数 */
								weight: item['weight'] ? item['weight'] : '无', /*基础重量（kg） */
								purchasePrice: item['purchasePrice'], /*采购价格，单位：元 */
								salePrice: item['salePrice'] ? item['salePrice'] : 0, /*销售价格，单位：元 */
								minPrice: item['minPrice'], 	/*最低价格，单位：元 */
								checked: false,
								disabled: false,
								quantity: 0
							})
						};
						this.temporaryMaterialList = _.cloneDeep(this.originalMaterialList);
						this.totalPage =  Math.ceil(this.temporaryMaterialList.length/this.pageSize);
						// 默认展示第一页的物料信息
						this.materialList = this.temporaryMaterialList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
					}
				} else {
					this.$refs.uToast.show({
						message: res.data.msg,
						position: 'center',
						type: 'error'
					})
				}
			})
			.catch((err) => {
				this.showLoadingHint = false;
				this.$refs.uToast.show({
					message: err,
					position: 'center',
					type: 'error'
				})
			})
		},
		
		// 产品分页点击事件
		pageClickEvent (text) {
			if (this.totalPage == 0) { return };
			if (text == 'previous') {
				if ( this.currentPage == 1) { return };
				this.currentPage--;
			} else if (text == 'next') {
				if ( this.currentPage == this.totalPage ) { return }
				this.currentPage++
			};
			// 根据页码分割展示对应的数据
			this.materialList = this.temporaryMaterialList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
		},
		 
		handleClick () {},
		 
		 // 求和函数(计算所有添加产品总价格)
		 reduceTotal() {
			 let targetMsg = this.chooseMaterialList.filter((item) => {
				 return item.quantity > 0
			 });
			 this.allChooseProductPrice = targetMsg.reduce((accumulator, currentValue) => {
				 return accumulator + currentValue.totalPrice
			 }, 0)
		 },
		 
		 // 保留两位小数，返回数字类型，修复精度问题
		 formatPrice(num) {
		   if (typeof num !== 'number' || isNaN(num)) return "0.00";
			 const value = Math.round(num * 100) / 100;
			 return value.toFixed(2);
		 },
		 
		 // 产品步进器change事件
		 productNumberBoxChange(item,index,val) {
			 if (val['value'] == 0) {
				 this.chooseMaterialList.splice(index,1);
			 };
			 item['showTotalPrice'] = this.formatPrice(item['salePrice'] * val['value']);
			 item['totalPrice'] = item['salePrice'] * val['value'];
			 item['quantity'] = val['value'];
			 this.reduceTotal();
		 },
		 
		 // 添加产品事件
		 addProductEvent () {
				this.productChooseShow = true;
				this.searchValue = '';
				// 添加过的产品不允许再次添加
				for (let item of this.originalMaterialList) {
					 let isExist = this.chooseMaterialList.filter((innerItem) => { return innerItem.id == item.id});
					 if (isExist.length > 0) {
						 item['checked'] = true;
						 item['disabled'] = true;
						 item['quantity'] = isExist[0]['quantity'];
					 } else {
						 item['checked'] = false;
						 item['disabled'] = false;
						 item['quantity'] = 0;
					 }
				};
				// 打开物料弹框就显示全部物料信息
				this.temporaryMaterialList = this.originalMaterialList;
				this.totalPage = Math.ceil(this.temporaryMaterialList.length/this.pageSize);
				this.materialList = this.temporaryMaterialList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize)
		 },
		 
		 // 添加产品弹框关闭事件
		 productChoosePopupCloseEvent () {
			 this.productChooseShow = false;
		 },
		 
		 // 搜索框值改变事件
		 searchChange () {
			 if (this.searchValue === '') {
				this.temporaryMaterialList = _.cloneDeep(this.originalMaterialList);
				this.materialList = _.cloneDeep(this.originalMaterialList);
				this.currentPage = 1;
			  this.totalPage =  Math.ceil(this.temporaryMaterialList.length/this.pageSize);
				// 根据页码分割展示对应的数据
				this.materialList = this.temporaryMaterialList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
			 } else {
				this.materialList = this.originalMaterialList.filter((item) => { return item['productName'].indexOf(this.searchValue) != -1 });
			  this.temporaryMaterialList = this.materialList;
			  this.currentPage = 1;
			  this.totalPage =  Math.ceil(this.temporaryMaterialList.length/this.pageSize);
			  this.materialList = this.temporaryMaterialList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
			 }
		 },
		 
		 // 添加确认事件
		 addSureEvent () {
			 const regex = /^(0|[1-9]\d*)$/;
			 let count = this.materialList.some((item)=> {return item.checked == true && !item.disabled});
			 let isSomeZero = this.materialList.some((item)=> {return item.quantity === ''});
			 let is‌NoValid = this.materialList.some((item)=> {return regex.test(item.quantity) === false });
			 if (!count) {
				 this.$refs.uToast.show({
				 	message: '至少要选择一种产品',
				 	position: 'center'
				});
				return;
			 };
			 if (isSomeZero) {
				this.$refs.uToast.show({
					message: '请输入产品数量',
					position: 'center'
				});
				return;
			 };
			 if (is‌NoValid) {
				this.$refs.uToast.show({
					message: '请输入正确的产品数量(正整数和0)',
					position: 'center'
				});
				return;
			 };
			 this.productChooseShow = false;
			 let temporaryMaterialList = this.originalMaterialList.filter((item) => { return item['checked'] === true && !item.disabled });
			 for (let item of temporaryMaterialList) {
				this.chooseMaterialList.push({
					id: item['id'], /*产品编号 */
					productName: item['productName'], /*产品名称 */
					standard: item['standard'] ? item['standard'] : '无', /*产品规格 */
					unit: item['unit'], /*单位 */
					warningCount: item['warningCount'], /*预警数量 */
					productImage: item['productImage'],
					barCode: item['barCode'], /*产品条码 */
					categoryId: item['categoryId'], /*产品分类编号 */
					categoryName: item['categoryName'], /*产品分类 */
					unitId: item['unitId'], /*单位编号 */
					remark: item['remark'], /*产品备注 */
					expiryDay: item['expiryDay'], /*保质期天数 */
					weight: item['weight'], /*基础重量（kg） */
					purchasePrice: item['purchasePrice'], /*采购价格，单位：元 */
					salePrice: item['salePrice'] ? item['salePrice'] : 0, /*销售价格，单位：元 */
					minPrice: item['minPrice'], 	/*最低价格，单位：元 */
					quantity: item['quantity'],
					totalPrice: 0,
					showTotalPrice: '0.00'
				}) 
			 };
			 // 计算选中产品的对应价格
			 for (let item of this.chooseMaterialList) {
				 item['showTotalPrice'] = this.formatPrice(item['salePrice'] * item['quantity']);
				 item['totalPrice'] = item['salePrice'] * item['quantity'];
			 }; 
			 this.reduceTotal();
		 },
		 
		 // 添加产品弹框内产品项点击事件
		 addProductItemEvent(item,index) {
			 if (!this.materialList[index]['disabled']) {
				 this.materialList[index]['checked'] = !this.materialList[index]['checked'];
			 }
		 },
		 
		 // 添加物资保存事件
		 materialApplicationSaveEvent () {
			 if (!this.isEdit) {
				if (this.chooseMaterialList.length == 0) {
					if (this.addMaterialApplicationMessage.length == 0) {
						this.$refs.uToast.show({
							message: '请先添加产品',
							position: 'center',
							type: 'warning'
						});
						return	
					}
				};
				this.changeAddMaterialApplicationMessage(this.chooseMaterialList);
			 } else {
				if (this.chooseMaterialList.length == 0) {
				 	this.$refs.uToast.show({
				 		message: '请先添加产品',
				 		position: 'center',
				 		type: 'warning'
				 	});
				 	return
				 };
				 let temporaryEditMaterialApplicationMessage = _.cloneDeep(this.editMaterialApplicationMessage);
				 // 存储保存的编辑盘点信息
				 if (this.editMaterialApplicationMessage.length > 0 ) {
					 let temporaryIndex = this.editMaterialApplicationMessage.findIndex((item) => {return item['id'] == this.orderId});
					 if (temporaryIndex != -1) {
						 temporaryEditMaterialApplicationMessage[temporaryIndex]['chooseMaterialList'] = this.chooseMaterialList;
					 } else {
						 temporaryEditMaterialApplicationMessage.push(
							 {
								 id: this.orderId,
								 chooseMaterialList: this.chooseMaterialList
							 }
						 )
					 };
				 } else {
					 temporaryEditMaterialApplicationMessage.push(
							 {
								id: this.orderId,
								chooseMaterialList: this.chooseMaterialList
							 }
						 )
				 };
				 this.changeEditMaterialApplicationMessage(temporaryEditMaterialApplicationMessage);
			 };
			 this.$refs.uToast.show({
			 	message: '保存成功',
			 	position: 'center',
			 	type: 'success'
			 });
			 this.backTo()
		 },
		 
		 // 物资申请提交事件
		 materialApplicationSubmitEvent () {
		 if (!this.isEdit) {
			if (this.chooseMaterialList.length == 0) {
				 this.$refs.uToast.show({
					message: '请先添加产品',
					position: 'center',
					type: 'warning'
				 });
				 return
			 };
			 this.$refs.uToast.show({
			 	message: '保存成功',
			 	position: 'center',
			 	type: 'success'
			 });
			 this.changeAddMaterialApplicationMessage(this.chooseMaterialList);
			 uni.navigateTo({
			 	url: '/materialApplicationPackage/pages/materialApplicationSubmit/materialApplicationSubmit'
			 })
		 } else {
		 if (this.chooseMaterialList.length == 0) {
				this.$refs.uToast.show({
					message: '请先添加产品',
					position: 'center',
					type: 'warning'
				});
				return
			};
			 let temporaryEditMaterialApplicationMessage = _.cloneDeep(this.editMaterialApplicationMessage);
				 // 存储保存的编辑盘点信息
				 if (this.editMaterialApplicationMessage.length > 0 ) {
					 let temporaryIndex = this.editMaterialApplicationMessage.findIndex((item) => {return item['id'] == this.orderId});
					 if (temporaryIndex != -1) {
						 temporaryEditMaterialApplicationMessage[temporaryIndex]['chooseMaterialList'] = this.chooseMaterialList;
					 } else {
						 temporaryEditMaterialApplicationMessage.push(
							 {
								 id: this.orderId,
								 chooseMaterialList: this.chooseMaterialList
							 }
						 )
					 };
				 } else {
					 temporaryEditMaterialApplicationMessage.push(
							 {
								id: this.orderId,
								chooseMaterialList: this.chooseMaterialList
							 }
						 )
				 };
				 this.changeEditMaterialApplicationMessage(temporaryEditMaterialApplicationMessage);
			 };
			 this.$refs.uToast.show({
			 	message: '保存成功',
			 	position: 'center',
			 	type: 'success'
			 });
			 let transmitParams = encodeURIComponent(
				 JSON.stringify({
					 id: this.orderMessage['id'],
					 orderType: this.orderMessage['orderType'],
					 orderTime: this.orderMessage['orderTime'],
					 remark: this.orderMessage['remark'],
					 address: this.orderMessage['address'],
					 status: this.orderMessage['status']
				 })
			 );
			 uni.navigateTo({
			 	url: `/materialApplicationPackage/pages/materialApplicationSubmit/materialApplicationSubmit?transmitParams=${transmitParams}`
			 })
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
  ::v-deep .u-toast{
		.u-transition {
			z-index: 100000 !important;
		}
  };
	.add-product-popup-box {
		::v-deep .u-popup {
			.u-popup__content {
				.u-popup__content__close {
					.u-icon__icon {
						font-size: 22px !important;
						color: #101010 !important;
					}
				}
			};
			.popup-content {
				width: 100%;
				height: 75vh;
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
				padding: 6px 4px;
				box-sizing: border-box;
				overflow: auto;
				position: relative;
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
				.add-product-popup-list {
					margin-bottom: 10px;
					.add-product-popup-top {
						display: flex;
						align-items: center;
						.add-product-popup-top-left {
							margin-right: 10px;
							flex: 1;
							width: 0;
							display: flex;
							align-items: center;
							@include no-wrap;
							>image {
								width: 36px;
								height: 36px;
								margin-right: 4px;
							};
							>view {
								text {
									font-size: 14px;
									color: #101010;
								};
								&:nth-child(2) {
									max-width: 150px;
									@include no-wrap;
									>text {
										@include no-wrap;
										width: 100%;
									}
								};
								&:nth-child(3) {
									margin: 0 4px;
								}
							}
						};
						.add-product-popup-top-right {
							width: 24px;
							height: 24px;
							display: flex;
							align-items: center;
							justify-content: center;
							border: 1px solid #BBBBBB;
						};
						.popupTopRightStyle {
							background: #11D183 !important;
							border: 1px solid #11D183 !important;
						};
						.popupTopRightDisabledStyle {
							opacity:.5 !important;
							border: 1px solid #11D183 !important;
						}
					};
					.add-product-popup-bottom {
						display: flex;
						justify-content: flex-end;
						align-items: center;
						margin-top: 6px;
						>text {
							&:nth-child(1) {
								font-size: 14px;
								color: #F44E23;
							};
							&:nth-child(2) {
								font-size: 14px;
								color: #101010;
								margin-right: 4px;
							}
						};
						.u-input {
							width: 60px;
							height: 25px;
							flex: none !important;
							border-radius: 5px;
							padding: 6px !important;
							box-sizing: border-box;
							color: #11D183;
							border: 1px solid #11D183;
						}
					}
				}
			};
			.page-area {
				height: 40px;
				width: 70%;
				margin: 0 auto;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.page-left {
					font-size: 14px;
					padding: 4px 6px;
					border-radius: 2px;
					box-sizing: border-box;
					border: 1px solid #d0d0d0;
				};
				.page-center {
					>text {
						font-size: 12px;
						color: #333;
						&:nth-child(1) {
							color: #3B9DF9
						}
					}
				};
				.page-right {
					font-size: 14px;
					border-radius: 2px;
					padding: 4px 6px;
					box-sizing: border-box;
					border: 1px solid #d0d0d0
				};
				.pageSpanStyle {
					color: #d0d0d0 !important
				}
			};
			.product-popup-bottom {
				height: 80px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.cancel-box {
					width: 45%;
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
					width: 45%;
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
			 position: relative;
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
					 @include no-wrap;
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
						  @include no-wrap;
						 .product-specification-left {
							 margin-right: 10px;
							 >text {
								 font-size: 12px;
								 color: #777575;
							 }
						 };
						 .product-specification-right {
							 flex: 1;
							 @include no-wrap;
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
					 width: 130px;
					 .product-number-box {
						 margin-bottom: 4px;
						 ::v-deep .u-number-box {
							 .u-number-box__minus {
								 background: transparent !important;
								 .u-icon {
									 .u-icon__icon {
										 color: #3B9DF9 !important;
										 font-size: 18px !important;
										 line-height: 18px !important;
									 }
								 }
							 };
							 .u-number-box__input {
								 border-radius: 5px;
								 height: 25px !important;
								 background: #fff !important; 
								 border: 1px solid #9EA1B6 !important;
								 font-size: 14px !important;
								 color: #101010 !important;
								 flex: 1;
								 box-sizing: border-box;
							 };
							 .u-number-box__plus {
								background: transparent !important;
								.u-icon {
									.u-icon__icon {
										 color: #3B9DF9 !important;
										 font-size: 18px !important;
										 line-height: 18px !important;
									}
								}
							 }
						 }
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