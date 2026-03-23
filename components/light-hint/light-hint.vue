<template>
    <view class="light-hint" v-if="params.isShow">
			<div class="light-hint-top">
				<image :src="params.type == 'success' ? passedPng : exclamationPointPng" alt=""></image>
				<text>{{params.message}}</text>
			</div>
			<div class="light-hint-bottom" :class="{'lightHintBottomStyle' : params.isShowSupplement}" v-if="params.isShowSupplement">
				<text>{{params.supplementMessage}}</text>
			</div>
    </view>
</template>
 
<script>
export default {
  name: 'LightHint',
  data() {
    return {
			params: {
				type: 'success',
				message: '',
				supplementMessage: '',
				duration: '2000',
				isShow: false,
				isShowSupplement: false
			},
			defaultParams: {
				type: 'success',
				message: '',
				supplementMessage: '',
				duration: '2000',
				isShow: false,
				isShowSupplement: false
			},
      exclamationPointPng: require("@/static/img/exclamation-point.png"),
      passedPng: require("@/static/img/passed.png")
    }
  },
  methods: {
    show(parameter={}) {
			Object.keys(this.params).forEach((key)=>{
				if (!parameter.hasOwnProperty(key)) {
					this.params[key] = this.defaultParams[key]
				} else if (parameter[key] == '') {
					this.params[key] = this.defaultParams[key]
				} else {
					this.params[key] = parameter[key]
				}
			});
      setTimeout(this.hide, this.params.duration);//设置时间自动消失
    },
    hide() {
			this.params['isShow'] = false
    }
  }
};
</script>
<style lang="scss" scoped>
 .light-hint {
    background: #fff;
    display: flex;
		flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 180px;
		max-width: 276px;
    min-height: 48px;
    padding: 15px 20px; 
		box-sizing: border-box;
    position: fixed;
    z-index: 1000;
    bottom: 200px;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
		box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.4);
		.light-hint-top {
			display: flex;
			justify-content: center;
			align-items: center;
			text {
				width: 100%;
				display: inline-block;
				color: #101010;
				font-size: 14px;
			  vertical-align: middle;
			  margin-left: 10px;
				text-align: left;
				word-break: break-all;
			};
			image {
				flex-shrink: 0;
			  vertical-align: middle;
			  width: 24px;
			  height: 24px
			}
		};
		.light-hint-bottom {
			min-width: 168px;
			max-width: 236px;
			text {
			 width: 100%;
			 display: inline-block;
			 font-size: 12px;
			 text-align: center;
			 color: #777575;
			 word-break: break-all;
			}
		};
		.lightHintBottomStyle {
			margin-top: 10px;
		}
  }
</style>