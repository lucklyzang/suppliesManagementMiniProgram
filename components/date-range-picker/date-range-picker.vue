<template>
	<view :class="{'remark':show}" :style="{'--theme-color': themeColor}" @click="close" @touchmove.stop.prevent="returnHandle">
		<view class="picker-box" :class="{show: show}">
			<view class="operate-box" @touchmove.stop.prevent="returnHandle" @tap.stop="returnHandle">
				<view @click="touchSelect(0)" class="time-item" :class="{ active: touchIndex === 0 }">
					<view class="label">{{ startText }}</view>
					<view class="date">{{ resultDate[0] }}</view>
				</view>
				<view class="divider-text">至</view>
				<view @click="touchSelect(1)" class="time-item" :class="{ active: touchIndex === 1 }">
					<view class="label">{{ endText }}</view>
					<view class="date">{{ resultDate[1] }}</view>
				</view>
			</view>
			<picker-view 
				:value="pickerValue" 
				@change="pickerChange" 
				class="picker-view" 
				:immediate-change="true"
				indicator-class="select-line"
				:indicator-style="indicatorStyle"
				mask-style="background: transparent"
				@tap.stop="returnHandle"
			>
				<picker-view-column class="column-left">
					<view class="picker-item" :class="index == pickerValue[0] ? 'picker-select' : ''" v-for="(item, index) in years" :key="index">
						{{ item }} <!-- 移除了 "年" -->
					</view>
				</picker-view-column>
				<picker-view-column class="column-center">
					<view class="picker-item" :class="index == pickerValue[1] ? 'picker-select' : ''" v-for="(item, index) in months" :key="index">
						{{ item }} <!-- 移除了 "月" -->
					</view>
				</picker-view-column>
				<picker-view-column class="column-right" v-if="days.length > 0">
					<view class="picker-item" :class="index == pickerValue[2] ? 'picker-select' : ''" v-for="(item, index) in days" :key="index">
						{{ item }} <!-- 移除了 "日" -->
					</view>
				</picker-view-column>
			</picker-view>
			<view class="button-group">
				<view class="item cancel" @click.stop="close">取消</view>
				<view class="item confirm" @click.stop="pickerConfirm">确认</view>
			</view>
		</view>
	</view>
</template>

<script>
	// ... (保持 script 部分完全不变)
	export default {
		name: 'dateRangePicker',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			defaultDate: {
				type: Array,
				default: () => []
			},
			minYear: {
				type: Number,
				default: 2000,
			},
			maxYear: {
				type: Number,
				default: null,
			},
			themeColor: {
				type: String,
				default: '#11D183'
			},
			startText: {
				type: String,
				default: '开始日期'
			},
			endText: {
				type: String,
				default: '结束日期'
			}
		},
		data() {
			// 每次创建组件实例时都生成独立的数据
			const date = new Date();
			const currentYear = date.getFullYear();
			const currentMonth = date.getMonth() + 1;
			const currentDay = date.getDate();
			
			// 为每个实例独立生成years和months数组
			const years = [];
			const maxYear = this.maxYear || currentYear;
			for (let i = this.minYear; i <= maxYear; i++) {
				years.push(i);
			}
			
			const months = [];
			for (let i = 1; i <= 12; i++) {
				months.push(this.padStart(i));
			}
			
			return {
				indicatorStyle: `height: ${uni.upx2px(84)}px`,
				touchIndex: 0,
				currentYear,
				currentMonth,
				currentDay,
				years,  // 实例私有
				months, // 实例私有
				days: [],
				pickerValue: [0, 0, 0],
				resultDate: [],
				lastConfirmedDate: []
			};
		},
		watch: {
			show(newVal) {
				if (newVal) {
					this.touchIndex = 0;
					
					// 每次显示时重新初始化数据
					this.initDisplayData();
					
					// 延迟设置picker，确保DOM已渲染
					this.$nextTick(() => {
						setTimeout(() => {
							this.setPickerToCurrentDate();
						}, 100);
					});
				}
			}
		},
		mounted() {
			this.initDisplayData();
		},
		methods: {
			returnHandle() {},
			
			initDisplayData() {
				// 初始化显示数据
				if (this.lastConfirmedDate.length > 0) {
					this.resultDate = [...this.lastConfirmedDate];
				} else if (this.defaultDate.length > 0) {
					this.resultDate = [...this.defaultDate];
				} else {
					const month = this.padStart(this.currentMonth);
					const day = this.padStart(this.currentDay);
					const nowTime = `${this.currentYear}-${month}-${day}`;
					this.resultDate = [nowTime, nowTime];
				}
			},
			
			setPickerToCurrentDate() {
				const date = this.resultDate[this.touchIndex];
				if (date) {
					this.setPicker(date, true);
				}
			},
			
			setPicker(date, forceScroll = false) {
				if (!date) return;
				
				const splitVal = date.split('-');
				if (splitVal.length !== 3) return;
				
				const year = Number(splitVal[0]);
				const month = Number(splitVal[1]);
				const day = Number(splitVal[2]);
				
				// 找到年份索引
				let yearIndex = this.years.indexOf(year);
				if (yearIndex === -1) {
					// 如果年份不在范围内，使用最近的有效年份
					if (year < this.minYear) {
						yearIndex = 0;
					} else if (year > (this.maxYear || this.currentYear)) {
						yearIndex = this.years.length - 1;
					} else {
						yearIndex = 0;
					}
				}
				
				// 月份索引
				let monthIndex = month - 1;
				if (monthIndex < 0) monthIndex = 0;
				if (monthIndex > 11) monthIndex = 11;
				
				// 更新天数
				this.updateDays(this.years[yearIndex], month);
				
				// 天数索引
				let dayIndex = day - 1;
				if (dayIndex >= this.days.length) {
					dayIndex = this.days.length - 1;
				}
				if (dayIndex < 0) dayIndex = 0;
				
				// 关键：使用新的数组引用触发picker-view重新渲染
				const newPickerValue = [yearIndex, monthIndex, dayIndex];
				
				// 如果forceScroll为true，使用$nextTick确保DOM已更新
				if (forceScroll) {
					this.$nextTick(() => {
						// 延迟一小段时间确保picker-view已准备好
						setTimeout(() => {
							this.pickerValue = [...newPickerValue];
						}, 10);
					});
				} else {
					this.pickerValue = newPickerValue;
				}
			},
			
			touchSelect(val) {
				this.touchIndex = val;
				const date = this.resultDate[val];
				// 强制滚动到对应位置
				this.setPicker(date, true);
			},
			
			getDateTime(dateIndices) {
				if (!dateIndices || dateIndices.length < 3) return;
				
				const year = this.years[dateIndices[0]];
				const month = this.months[Number(dateIndices[1])];
				const day = this.days[Number(dateIndices[2])];
				
				if (year && month && day) {
					this.resultDate[this.touchIndex] = `${year}-${month}-${day}`;
				}
			},
			
			updateDays(year, month) {
				let days = [];
				if (month === 2) {
					// 二月
					const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
					const maxDay = isLeapYear ? 29 : 28;
					for (let i = 1; i <= maxDay; i++) {
						days.push(this.padStart(i));
					}
				} else if ([4, 6, 9, 11].includes(month)) {
					// 小月
					for (let i = 1; i <= 30; i++) {
					days.push(this.padStart(i));
					}
				} else {
					// 大月
					for (let i = 1; i <= 31; i++) {
					days.push(this.padStart(i));
					}
				}
				this.days = days;
			},
			
			pickerChange(e) {
				const currents = e.detail.value;
				
				// 获取选中的年、月
				const selectedYear = this.years[currents[0]];
				const selectedMonth = Number(this.months[currents[1]]);
				
				// 保存当前选中的天数
				let selectedDayIndex = currents[2];
				let selectedDayValue = 1;
				if (this.days[selectedDayIndex]) {
					selectedDayValue = Number(this.days[selectedDayIndex]);
				}
				
				// 更新天数
				this.updateDays(selectedYear, selectedMonth);
				
				// 检查天数是否超过范围
				let newDayIndex = selectedDayIndex;
				if (newDayIndex >= this.days.length) {
					newDayIndex = this.days.length - 1;
				}
				
				// 尝试保持之前选中的天数
				const targetDayStr = this.padStart(selectedDayValue);
				const targetDayIndex = this.days.indexOf(targetDayStr);
				if (targetDayIndex !== -1) {
					newDayIndex = targetDayIndex;
				}
				
				// 更新picker值
				this.pickerValue = [currents[0], currents[1], newDayIndex];
				
				// 更新结果日期
				this.getDateTime(this.pickerValue);
			},
			
			close() {
				this.$emit('close', false);
			},
			
			pickerConfirm() {
				const { resultDate } = this;
				let startTime = new Date(resultDate[0].replace(/-/g, '/')).getTime();
				let endTime = new Date(resultDate[1].replace(/-/g, '/')).getTime();
				
				if (startTime > endTime) {
					uni.showToast({
						title: '开始日期应小于结束日期',
						icon: 'none',
						duration: 3500
					});
					return;
				}
				
				this.lastConfirmedDate = [...resultDate];
				this.$emit('confirm', resultDate);
				this.close();
			},
			
			padStart(val) {
				return val.toString().padStart(2, '0');
			},
		}
	}
</script>

<style lang="scss" scoped>
	/* --- 核心修改：为每个列的项目设置固定宽度，并调整固定单位标签的位置 --- */
	::v-deep .column-left,
	::v-deep .column-center,
	::v-deep .column-right {
		position: relative; /* 为内部的单位标签提供定位上下文 */
		.select-line {
			background: #F9FAFC;
			z-index: -1;
			&::before, &::after {
				border: none ;
			}
		}
		/* 为每个列的项目设置固定宽度和居中对齐 */
		.picker-item {
			width: 180rpx; /* 设置一个固定宽度，可以根据实际需要调整 */
			text-align: center; /* 确保内容在固定宽度内居中 */
		}
		/* 为每个列添加单位标签 */
		&::after {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			/* 现在，由于 picker-item 宽度固定，right 值可以统一设置 */
			right: 0; /* 统一设置为 0，然后通过 margin-left 来调整位置 */
			/* 或者，我们可以直接使用一个固定的 right 值，因为容器宽度固定了 */
			right: 20rpx; /* 统一设置 right 值，因为容器固定了 */
			pointer-events: none; /* 确保标签不影响触摸滚动 */
			font-size: 32rpx;
			font-weight: 600;
			color: var(--theme-color);
			z-index: 10;
		}
	}

	/* --- 为每个列单独设置单位文本 --- */
	::v-deep .column-left::after {
		content: '年';
	}
	::v-deep .column-center::after {
		content: '月';
	}
	::v-deep .column-right::after {
		content: '日';
	}

	/* --- 保持原有圆角样式不变 --- */
	::v-deep .column-left .select-line {
		border-radius: 42rpx 0 0 42rpx;
	}
	::v-deep .column-right .select-line {
		border-radius: 0 42rpx 42rpx 0;
	}
	
	/* --- 其余样式保持不变 --- */
	.remark {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
	}

	.picker-box {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		transition: all 0.3s ease;
		transform: translateY(100%);
		padding: 0 30rpx;
		box-sizing: border-box;
		background-color: #FFFFFF;
		z-index: 998;
		border-radius: 24rpx 24rpx 0 0;
		overflow: hidden;
		padding-bottom: calc(40rpx + constant(safe-area-inset-bottom)/2) !important;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom)/2) !important;
		&.show {
			transform: translateY(0);
		}

		/* --- 优化 operate-box --- */
		.operate-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 40rpx 0 30rpx; /* 增加上下内边距 */
			background-color: #FFFFFF;
			text-align: center;

			/* 为 time-item 添加选中状态的样式 */
			.time-item {
				flex: 1;
				padding: 16rpx 10rpx; /* 增加内边距 */
				border-radius: 12rpx; /* 添加圆角 */
				transition: background-color 0.2s, color 0.2s; /* 为背景色和文字颜色添加过渡 */
				.label {
					font-size: 24rpx; /* 稍微减小标签字体 */
					color: #888;
					margin-bottom: 8rpx; /* 增加与日期数字的间距 */
				}
				.date {
					font-size: 30rpx; /* 调整日期数字字体大小 */
					font-weight: 500; /* 数字加一点粗 */
					/* 移除内联样式，由 active 类控制 */
				}
			}
			
			/* 定义 active 类的样式，应用于 .time-item */
			.time-item.active {
				background-color: #f0f9ff; /* 淡蓝色背景 */
				.label,
				.date {
					color: var(--theme-color); /* 标签和数字都变成主题色 */
				}
			}

			.divider-text {
				font-size: 28rpx;
				color: #999;
				padding: 0 20rpx; /* 增加左右间距 */
			}
		}
		
		.picker-view {
			width: 100%;
			height: 420rpx;
			background-color: #FFFFFF;

			.picker-item {
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center; /* 已经在 ::v-deep .picker-item 中设置了 width 和 text-align */
				transition: all 0.2s ease;
				height: 84rpx;
				line-height: 84rpx;
				font-size: 32rpx;
				color: #999;
				&.picker-select {
					color: var(--theme-color);
					font-size: 36rpx;
					font-weight: 600;
					transition: all 0.2s ease;
				}
			}
		}
		
		.button-group {
			display: flex;
			justify-content: space-between;
			gap: 20rpx;
			padding: 30rpx 0 0;
			.item {
				flex: 1;
				height: 84rpx;
				text-align: center;
				line-height: 84rpx;
				border-radius: 42rpx;
				font-size: 30rpx;
				font-weight: 500;

				&.cancel {
					background: #f5f5f5;
					color: #666;

					&:active {
						background: #ebebeb;
					}
				}
				&.confirm {
					background: var(--theme-color);
					color: #fff;

					&:active {
						opacity: 0.9;
					}
				}
			}
		}
	}
</style>