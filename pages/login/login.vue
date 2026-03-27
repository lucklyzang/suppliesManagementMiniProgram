<template>
	<view class="container">
		<view class="loading-box">
			<u-transition :show="showLoadingHint" mode="fade-down">
				<view class="loading-box" v-if="showLoadingHint">
					<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
				</view>
			</u-transition>
		</view>
		<u-modal :show="modalShow" :title="modalContent"
		 :showCancelButton="true" @confirm="sureCancel" @cancel="cancelSure">
		</u-modal>
		<u-toast ref="uToast"></u-toast>
		<view class="top-background-area">
			<image src="/static/img/login-background-image.png" mode="widthFix"></image>
		</view>
		<view class="container-content">
			<view class="title-box">
				<view class="title-text">
					<view class="text-top">欢迎登录</view>
					<view class="text-bottom">物资管理系统</view>
				</view>
				<view class="title-icon">
					<image src="/static/img/login-icon.png" mode="widthFix"></image>
				</view>
			</view>
			<view class="form-box">
				<view class="form-account">
					<view class="input-text">
						账号
					</view>
					<view class="input-content">
						<u--input
								placeholderStyle="font-size: 14px;color: #C4C4C4"
								fontSize="14px"
								color="#101010"
								placeholder="请输入账号"
								v-model="form.username"
								border="bottom"
								type="text"
								clearable
							>
						</u--input>
					</view>
				</view>
				<view class="form-account form-password">
					<view class="input-text">
						密码
					</view>
					<view class="input-content">
						<u--input
							placeholderStyle="font-size: 14px;color: #C4C4C4"
							fontSize="14px"
							color="#101010"
							placeholder="请输入密码"
							v-model="form.password"
							border="bottom"
							type="password"
							clearable
						>
						</u--input>
					</view>
				</view>
			</view>
      <view class="remember-password">
        <view class="remember-password-content">
          <u-checkbox-group @change="checkboxGroupChange">
                <u-checkbox 
                  shape="circle"
                  activeColor="#11D183"
									labelSize="12px"
									labelColor="#999999"
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
				<button type="primary" @click="loginHandle">登 录</button>
			</view>
			<view class="have-read-box">
				<u-checkbox-group @change="userAgreementCheckboxGroupChange">
						<u-checkbox 
							shape="circle"
							activeColor="#11D183"
							labelSize="12px"
							labelColor="#999999"
							v-model="item.checked"
							v-for="(item, index) in userAgreementlist"
							:key="index"
							:label="item.name"
							:name="item.name"
						></u-checkbox>
				</u-checkbox-group>
				<text @click="userAgreemenShow = true">《用户协议》</text>
			</view>
		</view>
		<!-- 用户协议提示弹框	 -->
		<view class="evaluate-modal">
			<u-modal :show="userAgreemenShow" :showConfirmButton="false">
				<view class="evaluate-model-content">
					<view class="evaluate-modal-top">
						用户协议
					</view>
					<view class="evaluate-modal-center">
						一、协议确认与接受 <br/>
						1.1 欢迎使用本小程序（以下简称“本平台”）。在您通过本平台登录界面进行登录操作之前，请仔细阅读、理解并同意本《用户协议》（以下简称“本协议”）。本协议是您与本平台之间关于您使用本平台服务所订立的具有法律约束力的协议。<br/>
						1.2 当您点击“登录”或类似按钮，或以其他方式（包括但不限于通过手机号验证码、第三方账号授权等方式）登录、访问、使用本平台时，即表示您已阅读、理解并同意本协议的全部内容。如果您不同意本协议的任何条款，您应立即停止登录及使用本平台。<br/>
						1.3 本平台有权在必要时更新本协议，更新后的协议将在本平台公布，自公布之日起生效。若您在本协议更新后继续使用本平台，即视为您已接受更新后的协议。请您定期查阅，以了解最新版本。<br/>
						二、账号注册与登录 <br/>
						2.1 您理解并同意，您可能需要通过本平台支持的登录方式（如手机号验证码、微信一键登录、其他第三方账号授权等）创建或绑定您的账号，以使用本平台提供的完整服务。<br/>
						2.2 您应保证注册、登录时提供的所有信息（包括但不限于手机号码、验证信息等）是真实、准确、完整、合法有效的。如信息有变，您应及时更新。因信息不真实、不准确或不完整引起的责任及损失由您自行承担。<br/>
						2.3 您有责任妥善保管您的账号、密码及相关验证信息。您应对以您的账号进行的所有活动和行为负责。如发现任何未经授权的使用，您应立即通知本平台。本平台对因您未能妥善保管账号信息而导致的损失不承担责任。<br/>
						2.4 您不得将您的账号以任何形式转让、出借、赠与或分享给他人使用。否则，由此产生的风险和责任由您自行承担，且本平台有权在不通知您的情况下暂停或终止向该账号提供服务。<br/>
						三、用户信息与隐私保护<br/> 
						3.1 为向您提供登录验证及后续服务，在您登录过程中，本平台可能需要收集、使用您的必要个人信息（如手机号码、设备信息、第三方账号授权的公开信息等）。<br/>
						3.2 本平台对您个人信息的收集、使用、存储和保护，将严格遵守相关法律法规的规定，并遵循《隐私政策》。本《用户协议》与《隐私政策》共同构成对您个人信息的保护指引。请您在登录前务必仔细阅读本平台的《隐私政策》。<br/>
						3.3 您理解并同意，本平台有权依据法律法规或监管要求，或在特定服务场景下，向有关政府部门、司法机关或其他第三方提供您的必要信息。<br/>
						四、用户行为规范 <br/>
						4.1 您在使用本平台登录及相关服务时，必须遵守中华人民共和国法律法规及相关规定，不得利用本平台从事任何违法违规或侵犯他人权益的活动，包括但不限于：<br/>
						(1) 违反宪法或法律法规确定的基本原则；<br/>
						(2) 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一；<br/>
						(3) 损害国家荣誉和利益；<br/>
						(4) 煽动民族仇恨、民族歧视，破坏民族团结；<br/>
						(5) 破坏国家宗教政策，宣扬邪教和封建迷信；<br/>
						(6) 散布谣言，扰乱社会秩序，破坏社会稳定；<br/>
						(7) 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪；<br/>
						(8) 侮辱或者诽谤他人，侵害他人合法权益；<br/>
						(9) 以任何方式干扰或破坏本平台的正常运行；<br/>
						(10) 其他法律法规禁止的行为。<br/>
						4.2 如您违反上述规定，本平台有权在不通知您的情况下，立即中止或终止为您提供服务，并保留追究您法律责任的权利。<br/>
						五、服务的中断、变更与终止 <br/>
						5.1 鉴于网络服务的特殊性，您同意本平台有权因系统维护、升级、或因不可抗力（如火灾、洪水、地震、战争、政府行为等）而中断、暂停或变更部分或全部服务。本平台将尽可能提前通告，但对于因此造成的您的任何损失，本平台不承担责任。<br/>
						5.2 在符合法律法规规定及本协议约定的情况下，本平台有权随时变更、中断或终止部分或全部服务。如服务终止，本平台将尽可能通过公告等形式通知您。<br/>
						5.3 您有权随时停止使用本平台服务。如您长期未登录，本平台有权回收您的账号。<br/>
						六、免责声明 <br/>
						6.1 本平台提供的登录及所有服务均按“现状”和“可用”的基础提供。本平台不保证服务不会中断，也不保证服务的及时性、安全性、准确性、完整性和适用性。您使用本平台所下载或获得的任何资料，其风险由您自行承担。<br/>
						6.2 对于因不可抗力、计算机病毒、黑客攻击、系统不稳定、第三方服务瑕疵、政府行为等原因造成的服务中断、数据丢失或其他损失，本平台不承担责任，但将尽力减少因此给您造成的损失和影响。<br/>
						6.3 您从本平台或经由本平台获取的任何建议或信息，无论是书面或口头的，均不构成本平台对本协议范围之外的任何保证。<br/>
						七、法律适用与争议解决 <br/>
						7.1 本协议的订立、执行、解释及争议的解决均适用中华人民共和国大陆地区法律。<br/>
						7.2 如您与本平台就本协议内容或其执行发生任何争议，双方应首先友好协商解决；协商不成的，任何一方均有权将争议提交至本平台运营方所在地有管辖权的人民法院诉讼解决。<br/>
						八、其他 <br/>
						8.1 本协议的任何条款无论因何种原因完全或部分无效或不具有执行力，其余条款仍应有效并且有约束力。<br/>
						8.2 本协议（包括《隐私政策》及本平台不时发布的各项规则）构成您与本平台之间就登录及使用服务所达成的完整协议，并取代您和本平台先前就相同事项达成的任何口头或书面约定。<br/>
						8.3 本平台未行使或执行本协议任何权利或规定，不构成对该权利或规定的放弃。<br/>
						温馨提示：在您点击“同意”并登录前，请确保您已完整阅读并理解本协议及《隐私政策》的全部内容。如果您有任何疑问，可联系客服进行咨询。
						感谢您的使用，祝您使用愉快！
					</view>
					<view class="evaluate-modal-bottom">
						<view class="evaluate-modal-btn">
							<view class="cancel-left" @click.stop="userAgreemenModalCancelEvent">
								<text>取消</text>
							</view>
							<view class="submit-right" @click.stop="userAgreemenModalSureEvent">
								<text>确定</text>
							</view>
						</view>
					</view>
				</view>
			</u-modal>
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations } from 'vuex'
	import { logIn, getUserInfo } from '@/api/login.js'
	import Qs from 'qs'
	import { setCache, getCache, removeCache } from '@/common/js/utils'
	export default {
	components: {
	},
		data() {
			return {
				showLoadingHint: false,
				infoText: '登录中···',
				userAgreemenShow: false,
				checkUserAgreemen: false,
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
				userAgreementlist: [
					{
					  name: '我已阅读并同意',
					  disabled: false
					}
				],
				
				rememberAccountMessage: false,
				modalShow: false,
				modalContent: ''
			}
		},
		onReady () {
		},
		computed: {
			...mapGetters([
				'chooseHospitalArea',
				'userTokenInfo'
			])
		},
		onShow () {
			 this.form.username = getCache('userName') ? getCache('userName') : '';
			 this.form.password = getCache('userPassword') ? getCache('userPassword') : '';
		},
		methods: {
			...mapMutations([
				'storeUserInfo',
				'storeUserTokenInfo',
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
			
			// 同意用户协议复选框
			userAgreementCheckboxGroupChange(e) {
				if (e[0] == '我已阅读并同意') {
					this.checkUserAgreemen = true;
				} else {
					this.checkUserAgreemen = false;
				}
			},
				
			// 用户协议弹框确定事件
			userAgreemenModalSureEvent() {
				this.userAgreemenShow = false;
			},
			
			// 用户协议弹框取消事件
			userAgreemenModalCancelEvent() {
				this.userAgreemenShow = false;
			},
			
			// 获取用户详情
			getUserInfoEvent () {
				return new Promise((resolve,reject) => {
					this.showLoadingHint = true;
					this.infoText = '获取中···';
					getUserInfo(this.userTokenInfo['userId'])
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						if (res && res.data.code == 0) {
							resolve();
							this.storeUserInfo(res.data.data);
						} else {
							reject(res.data.msg);
							this.modalShow = true;
							this.modalContent = res.data.msg;
						}
					})
					.catch((err) => {
						this.infoText = '';
						this.showLoadingHint = false;
						if (err === '') { return };
						reject(err);
						this.modalShow = true;
						this.modalContent = err;
					})
				})
			},
          
			// 账号密码登录事件
			authLoginEvent () {
				return new Promise((resolve,reject)=> {
					let loginMessage = {
						username: this.form.username,
						password: this.form.password
					};
					this.showLoadingHint = true;
					this.infoText = '登录中···';
					logIn(loginMessage).then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						if (res) {
							if (res.data.code == 0) {
								resolve(); 
								// 登录用户名密码及用户信息存入Locastorage
								// 判断是否勾选记住用户名密码
								if (this.rememberAccountMessage) {
									setCache('userName', this.form.username);
									setCache('userPassword', this.form.password);
								} else {
									removeCache('userName');
									removeCache('userPassword');
								};
								// 登录用户token信息存入store
								this.storeUserTokenInfo(res.data.data);
								// 存入token
								this.changeToken(res.data.data['accessToken']);
							} else {
							 reject(res.data.msg);
							 this.modalShow = true;
							 this.modalContent = `${res.data.msg}`
							}
						};
						})
						.catch((err) => {
							this.infoText = '';
							this.showLoadingHint = false;
							if (err === '') { return };
							reject(err);
							this.modalShow = true;
							this.modalContent = err;
						})
					})
			},
			
			// 登录事件
			async loginHandle () {
				if (this.form.username === '' || this.form.password === '') {
					this.$refs.uToast.show({
						message: '账号或密码不能为空'
					});
					return;
				};
				if (!this.checkUserAgreemen) {
					this.$refs.uToast.show({
						message: '请勾选我已阅读并同意《用户协议》'
					});
					return;
				};
				try {
					// 账号密码登录事件
					await this.authLoginEvent();
					// 获取用户详情事件
					await this.getUserInfoEvent();
					this.changeIsLogin(true);
					this.changeOverDueWay(false);
					setCache('storeOverDueWay',false); 
					uni.switchTab({
						url: '/pages/index/index'
					});
				} catch (err) {
					this.$refs.uToast.show({
						message: err,
						type: 'error'
					})
				}
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
	  position: relative;
		.loading-box {
			::v-deep .u-transition {
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				bottom: 10vh;
				z-index: 1000;
			}
		};
		.evaluate-modal {
			::v-deep .u-modal {
				.u-modal__content {
					padding: 0 !important;
					.evaluate-model-content {
						width: 100%;
						.evaluate-modal-top {
							height: 50px;
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 0 10px;
							box-sizing: border-box;
							font-size: 22px;
							color: #101010;
							font-weight: bold;
						};
						.evaluate-modal-center {
							padding: 0 20px;
							box-sizing: border-box;
							max-height: 60vh;
							overflow: auto;
						};
						.evaluate-modal-bottom {
							padding: 30px 45px;
							box-sizing: border-box;
							display: flex;
							align-items: center;
							.evaluate-modal-btn {
							 width: 100%;
							 display: flex;
							 align-items: center;
							 justify-content: space-between;
								.cancel-left {
									 width: 100px;
									 height: 35px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 border: 1px solid #11D183;
									 box-sizing: border-box;
									 border-radius: 4px;
									 >text {
										 font-size: 14px;
										 color: #11D183;
									 }
								};
								.submit-right {
									 width: 100px;
									 height: 35px;
									 display: flex;
									 align-items: center;
									 justify-content: center;
									 background: #11D183;
									 border-radius: 4px;
									 >text {
										 font-size: 14px;
										 color: #fff
									 }
								}
							}
						}
					}
				}
			}
		};
		.top-background-area {
			width: 100%;
			height: 100vh;
			position: absolute;
			>image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
			}
		};
		.container-content {
			width: 92%;
			height: 55vh;
			background: #fff;
			position: absolute;
			top: 25vh;
			left: 50%;
			transform: translateX(-50%);
			padding: 20px 14px;
			box-sizing: border-box;
			border-radius: 19px;
			box-shadow: 0px 2px 6px 0px rgba(207,229,214,1);
			z-index: 10;
			.title-box {
				display: flex;
				justify-content: space-between;
				align-items: center;
				.title-text {
					flex: 1;
					height: 66px;
					display: flex;
					flex-direction: column;
					justify-content: flex-end;
					margin-right: 10px;
					.text-top {
						font-size: 20px;
						color: #333333;
						font-weight: bold;
					};
					.text-bottom {
						margin-top: 10px;
						font-size: 14px;
						color: #999999;
					}
				};
				.title-icon {
					>image {
						width: 112px;
					}
				}
			};
			.form-box {
        width: 100%;
				margin-top: 40px;
				.form-account {
					.input-text {
						font-size: 12px;
						color: #666666;
						margin-bottom: 4px;
					};
					.input-content {
						::v-deep {
							.u-input {
								height: 34px;
								border-color: #EDEEF2 !important;
								padding: 0 !important;
								.u-input__content {
								}
							}
						}
					}
				};
				.form-password {
					margin-top: 25px;
				}
			};
      .remember-password {
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
        margin-top: 30px;
				::after {
					border-radius: 8px;
					border: none;
				};
				button {
					height: 40px;
					line-height: 40x;
					font-size: 16px;
					color: #fff;
					background-color: #11D183;
          border-radius: 8px;
				}
			};
			.have-read-box {
				margin-top: 25px;
				display: flex;
				align-items: center;
				>text {
					color: #11D183;
					font-size: 12px;
				}
			}
		}
	}
</style>
