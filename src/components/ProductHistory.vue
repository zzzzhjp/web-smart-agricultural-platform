<template>
    <div class="product-history" ref="productHistory">

    </div>
</template>

<script setup lang="ts">
import { onMounted , onUnmounted , ref , watch } from 'vue';
import * as echarts from 'echarts';
import type { ProducData } from '@/interface';

let chart: echarts.ECharts
const productHistory = ref()

const props = defineProps<{
    data: ProducData
}>()

const labelOptions ={
    show: true,
    position: 'insideButtom',
    align: 'left',
    verticalAlign: 'middle',
    rotate: 90,
    formatter: '{c} {name|{a}}',
    fontsize: 14,
    rich: {
        name: {},
    }
}

const updateChart = ()=>{
    if(!chart) return
    chart.setOption({
        grid: {
            bottom: 40,
            top: 20,
        },
        xAxis: [
            {
                type: 'category',
                axisTick: { show: false },
                axisLabel: { color: '#ededed' },
                data: props.data.years
            }
        ],
        yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#ededed',
        },
        splitLine: {
          lineStyle: {
            color: '#137e5a',
            type: 'dashed',
          },
        },
      },
    ],
    series: props.data.series.map((item) => ({
      name: item.name,
      type: 'bar',
      barGap: 0,
      label: labelOptions,
      emphasis: { focus: 'series' },
      itemStyle: { color: item.color },
      data: item.data,
    })),
  })
}

function resizeChart(){
    chart?.resize()
}

watch(
    () => props.data,
    () => {
        updateChart()
    },
    { deep: true }
)

onMounted(()=>{
    if(productHistory.value){
        chart = echarts.init(productHistory.value)
        updateChart()
        window.addEventListener('resize', resizeChart)
    }
})

onUnmounted(()=>{
    window.removeEventListener('resize', resizeChart)
    chart?.dispose()
})
</script>

<style scoped>
.product-history {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>