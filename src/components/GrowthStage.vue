<template>
  <div ref="growthStage" class="growth-stage"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

let chart: echarts.ECharts
const growthStage = ref()

const { data } = defineProps<{
  data: string[][]
}>()

const updateChart = () => {
  if (!chart) return
  chart.setOption({
    grid: { left: 60, right: 30, top: 20, bottom: 40 },
    xAxis: {
      type: 'time',
      axisLabel: { color: '#ededed' },
      axisLine: { lineStyle: { color: '#666' } },
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d[0]),
      axisLabel: { color: '#ededed' },
    },
    series: [
      {
        type: 'custom',
        renderItem(
          params: echarts.CustomSeriesRenderItemParams,
          api: echarts.CustomSeriesRenderItemAPI,
        ): echarts.CustomSeriesRenderItemReturn {
          const categoryIndex = api.value(0)
          const start = api.coord([api.value(1), categoryIndex])
          const end = api.coord([api.value(2), categoryIndex])
          const barHeight = 20
          const colors = ['#91cc7599', '#fac85899', '#5470c699', '#ee666699']

          return {
            type: 'rect',
            shape: {
              x: start[0]!,
              y: start[1]! - barHeight / 2,
              width: end[0]! - start[0]!,
              height: barHeight,
            },
            style: {
              fill: colors[params.dataIndex],
              stroke: 'none',
            },
          }
        },
        encode: { x: [1, 2], y: 0 },
        data,
      },
    ],
  })
}

const resizeChart = () => {
  chart?.resize()
}

watch(
  () => data,
  () => {
    updateChart()
  },
  { deep: true },
)

onMounted(() => {
  if (growthStage.value) {
    chart = echarts.init(growthStage.value)
    updateChart()
    window.addEventListener('resize', resizeChart)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<style scoped>
.growth-stage {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
