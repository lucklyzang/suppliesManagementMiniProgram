<template>
	<view class="container">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<u-modal :show="modalShow" :title="modalContent"
		 :showCancelButton="true" @confirm="sureCancel" @cancel="cancelSure">
		</u-modal>
		<u-toast ref="uToast"></u-toast>
		<!-- 院区 -->
		<view class="transport-rice-box" v-if="showHospitalCampus">
			<ScrollSelection buttonLocation='top' v-model="showHospitalCampus" :pickerValues="hospitalCampusDefaultIndex" :isShowSearch="false" :columns="hospitalCampusOption" @sure="hospitalCampusSureEvent" @cancel="hospitalCampusCancelEvent" @close="hospitalCampusCloseEvent" />
		</view>
		<view class="top-background-area">
			<image src="/static/img/login-background-image.png" mode="widthFix"></image>
			<view class="title-area">
				<image src="/static/img/login-icon.png" mode="widthFix"></image>
				<text>智 慧 后 勤 服 务 平 台</text>
			</view>
		</view>
		<view class="container-content">
			<view class="form-box">
				<u--input
					prefixIcon="account"
					prefixIconStyle="font-size: 24px;color: #B6B6B6"
					placeholderStyle="font-size: 16px;color: #B6B6B6"
					fontSize="16px"
					color="#B6B6B6"
					placeholder="请输入账号"
					v-model="form.username"
					border="bottom"
					type="text"
					clearable
				>
				</u--input>
				<u--input
					prefixIcon="lock"
					prefixIconStyle="font-size: 24px;color: #B6B6B6"
					placeholderStyle="font-size: 16px;color: #B6B6B6"
					fontSize="16px"
					color="#B6B6B6"
					placeholder="请输入密码"
					v-model="form.password"
					border="bottom"
					type="password"
					clearable
				>
				</u--input>
			</view>
      <view class="remember-password">
        <view class="remember-password-content">
          <u-checkbox-group @change="checkboxGroupChange">
                <u-checkbox 
                  shape="circle"
                  activeColor="#1864FF"
									labelSize="14px"
									labelColor="#565656"
                  v-model="item.checked"
                  v-for="(item, index) in list"
                  :key="index"
									:label="item.name"
									:name="item.name"
                ></u-checkbox>
            </u-checkbox-group>
         </view>
      </view>
			<view class="form-btn">
				<button type="primary" @click="sure">登 录</button>
			</view>
      <view class="bottom-character">
        <text>-内部系统，仅限医护下单使用-</text>
      </view>
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations } from 'vuex'
	import { logIn, getTemplateType } from '@/api/login.js'
	import Qs from 'qs'
	import { setCache, getCache, removeCache } from '@/common/js/utils'
	import ScrollSelection from "@/components/scrollSelection/scrollSelection";
	export default {
	components: {
		ScrollSelection,
	},
		data() {
			return {
				showLoadingHint: false,
				infoText: '登录中···',
				form: {
					username: '',
					password: ''
				},
        list: [
          {
            name: '记住账户密码',
            disabled: false
          }
        ],
				hospitalCampusDefaultIndex: [0],
				hospitalCampusOption: [],
				showHospitalCampus: false,
				currentHospitalCampusSpaces: '请选择',
				
				rememberAccountMessage: false,
				modalShow: false,
				modalContent: ''
			}
		},
		onReady () {
		},
		computed: {
			...mapGetters([
				'chooseHospitalArea'
			])
		},
		onShow () {
			 this.form.username = getCache('userName') ? getCache('userName') : '';
			 this.form.password = getCache('userPassword') ? getCache('userPassword') : '';
		},
		methods: {
			...mapMutations([
				'storeUserInfo',
				'changeOverDueWay',
				'changeTemplateType',
				'changeToken',
				'changeIsLogin',
				'storeChooseHospitalArea',
				'changeIsMedicalMan'
			]),
      
      // 选中任一checkbox时，由checkbox-group触发
      checkboxGroupChange(e) {
				if (e[0] == '记住账户密码') {
					this.rememberAccountMessage = true
				} else {
					this.rememberAccountMessage = false
				}
      },
			
			// 院区下拉选择框确认事件
			hospitalCampusSureEvent (val,value,id) {
				if (val) {
					this.hospitalCampusDefaultIndex = [id]
					this.currentHospitalCampusSpaces =  val;
					this.storeChooseHospitalArea({
						text: val,
						value,
						id
					});
					this.queryTemplateType(this.chooseHospitalArea['value'])
				} else {
					this.currentGoalSpaces = '请选择'
				};
				this.showHospitalCampus = false
			},
			
			// 院区下拉选择框取消事件
			hospitalCampusCancelEvent () {
				this.showHospitalCampus = false
			},
			
			// 院区下拉选择框关闭事件
			hospitalCampusCloseEvent () {
				this.showHospitalCampus = false
			},
          
			// 账号密码事件
			sure () {
				if (this.form.username === '' || this.form.password === '') {
					this.$refs.uToast.show({
						message: '账号或密码不能为空'
					});
					return;
				};
				let loginMessage = {
				  username: this.form.username,
				  password: this.form.password,
					logType: 1
				};
				this.showLoadingHint = true;
				logIn(loginMessage).then((res) => {
					this.showLoadingHint = false;
					if (res) {
					  if (res.data.code == 200) {
						   this.changeOverDueWay(false);
						   setCache('storeOverDueWay',false); 
							// 登录用户名密码及用户信息存入Locastorage
              // 判断是否勾选记住用户名密码
              if (this.rememberAccountMessage) {
                setCache('userName', this.form.username);
                setCache('userPassword', this.form.password);
              } else {
                removeCache('userName');
                removeCache('userPassword');
              };
							// 登录用户信息存入store
							this.changeIsLogin(true);
							this.storeUserInfo(res.data.data);
							if (res.data.data['extendData']['user_type_id'] == 1) {
							  this.changeIsMedicalMan(true)
							} else {
							  this.changeIsMedicalMan(false)
							};
							// 保存模板类型
							if (res.data.data.mobile) {
								this.changeTemplateType(res.data.data.mobile);
							};
							uni.switchTab({
								url: '/pages/index/index'
							})
					  } else {
						 this.modalShow = true;
						 this.modalContent = `${res.data.msg}`
					  }
					};
				  })
				  .catch((err) => {
						this.showLoadingHint = false;
					  this.modalShow = true;
					  this.modalContent = err;
				  })
			},
			
			// 查询模板类型
			queryTemplateType (data) {
			  this.showLoadingHint = true;
				this.infoText = '查询中···';
			  getTemplateType(data).then((res) => {
				this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						// 保存模板类型
						if (res.data.data) {
							this.changeTemplateType(res.data.data);
						};
						uni.switchTab({
							url: '/pages/index/index'
						})
					} else {
						this.modalShow = true;
						this.modalContent = `${res.data.msg}`
					}
			  })
			  .catch((err) => {
					this.showLoadingHint = false;
					this.modalShow = true;
					this.modalContent = err.message;
			  })
			},
			
			// 弹框确定事件
			sureCancel () {
				this.modalShow = false;
			},
			
			// 弹框取消事件
			cancelSure () {
				this.modalShow = false;
			}
		}
	}
</script>

<style lang="scss">
	@import "~@/common/stylus/variable.scss";
	.container {
		@include content-wrapper;
		font-size: 14px;
		padding-top: 50vh;
		box-sizing: border-box;
		.top-background-area {
			width: 100%;
			height: 50vh;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10;
			>image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
			};
			.title-area {
				width: 100%;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				>image {
					width: 64px;
				};
				>text {
					margin-top: 22px;
					font-size: 20px;
					color: #fff
				}
			}
		};
		.container-content {
			height: 50vh;
			background: #fff;
			position: relative;
			padding-top: 40px;
			box-sizing: border-box;
			.form-box {
        width: 80%;
        margin: 0 auto;
				::v-deep {
					.u-input {
						height: 40px;
						border-color: #B6B6B6 !important;
						.u-input__content {
							.u-input__content__prefix-icon {
								margin-right: 12px;
							}
						};
						&:first-child {
							margin-bottom: 14px;
						}
					}
				}
			};
      .remember-password {
        width: 80%;
        margin: 0 auto;
        height: 20px;
				margin-top: 20px;
        position: relative;
        .remember-password-content {
          position: absolute;
          top: 0;
          right: 0
        }
      };
			.form-btn {
        width: 75%;
        margin: 0 auto;
        margin-top: 50px;
				::after {
					border-radius: 26px;
					border: none;
				};
				button {
					height: 48px;
					line-height: 48px;
					font-size: 16px;
          background-image: linear-gradient(to right, #6ED3F7,#218FFF);
          border-radius: 26px;
					box-shadow: 0pt 2pt 6pt 0pt rgba(36,149,213,1);
				}
			};
      .bottom-character {
        width: 100%;
        text-align: center;
        position: absolute;
        left: 0;
        bottom: 40px;
        color: #9C9C9C;
        text {
          font-size: 12px;
        }
      }
		}
	}
</style>
