
<!-- не использоуется -->

<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { computed } from "vue";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);


const props = defineProps<{
  labels: string[],
  data: number[],
}>()

const options = computed(() => {
  return {
    xAxis: {
      type: 'category',
      data: props.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: props.data,
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',// Indicator type
        label: {
          // Horizontal section indicator block color
          backgroundColor: '#6a7985'
        }
      }
    }
  };
})


</script>

<template>
  <div class="charts-wrapper">
    <v-chart class="chart " :option="options" />
  </div>
</template>

<style scoped>
.charts-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.chart {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>