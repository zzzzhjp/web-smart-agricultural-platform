<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

let chart: echarts.ECharts
const healthIndex = ref()

const ranges = [
  { label: '差', color: '#ff4d4f99', value: 0.3 },
  { label: '一般', color: '#faad1499', value: 0.7 },
  { label: '优', color: '#52c41a99', value: 1 },
]

const { value } = defineProps<{
  value: number
}>()

const updateChart = () => {
  if (!chart) return
  chart.setOption({
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 100,
        axisTick: {
          show: false,
        },
        axisLabel: {
          distance: 5,
          color: '#ededed',
          fontSize: 12,
        },
        splitLine: {
          distance: 0,
          length: 5,
          lineStyle: {
            width: 1,
            color: '#ededed',
          },
        },
        axisLine: {
          lineStyle: {
            width: 5,
            color: ranges.map((item) => [item.value, item.color]),
          },
        },
        pointer: {
          show: true,
          length: '70%',
          width: 4,
          itemStyle: {
            color: '#2e7d32ff',
          },
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: '#fff',
          fontSize: 20,
        },
        data: [{ value }],
      },
    ],
  })
}

const resizeChart = () => {
  chart?.resize()
}

watch(
  () => value,
  () => {
    updateChart()
  },
)

onMounted(() => {
  if (healthIndex.value) {
    chart = echarts.init(healthIndex.value)
    updateChart()
    window.addEventListener('resize', resizeChart)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>
<template>
  <div class="health-index">
    <div ref="healthIndex" class="health-index-chart"></div>
    <div class="health-index-legend">
      <div class="legend-item" v-for="r in ranges" :key="r.label">
        <span class="legend-color" :style="{ background: r.color }"></span>
        <span class="legend-label">{{ r.label }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.health-index {
  width: 100%;
  height: 100%;
  position: relative;
}
.health-index-chart {
  width: 100%;
  height: 100%;
}
.health-index-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;
  position: absolute;
  width: 100%;
  bottom: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 14px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
}
</style>
