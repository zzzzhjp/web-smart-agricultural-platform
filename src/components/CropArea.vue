<template>
    <div ref="cropArea" class="crop-area"></div>
</template>

<script setup lang="ts">
import { computed, ref , onMounted , onUnmounted } from 'vue'
import * as echarts from 'echarts'

let chart: echarts.ECharts
const cropArea = ref()

const { data } = defineProps<{
    data: Record<string, number>
}>()

const pieData = computed(()=>{
    return Object.entries(data).map((item)=>{
        return { value: item[1], name: item[0]}
    })
})

const updateChart = () => {
  if (!chart) return
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br />{b}: {d}%',
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        color: '#ededed',
      },
    },
    color: ['#E74C3C66', '#8E44AD66', '#FF6B8166'],
    series: [
      {
        name: '占比面积',
        type: 'pie',
        radius: ['40%', '60%'],
        center: ['50%', '60%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          color: '#ededed',
        },
        labelLine: {
          show: true,
          length: 5,
          length2: 5,
          smooth: true,
          lineStyle: {
            color: '#ededed',
          },
        },
        data: pieData.value,
      },
    ],
  })
}

const resizeChart = () => {
  chart?.resize()
}

onMounted(() => {
  if (cropArea.value) {
    chart = echarts.init(cropArea.value)
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
.crop-area {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>