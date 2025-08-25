<!-- src/components/workshop/PaymentMethodPieChart.vue -->
<template>
    <div class="chart-container">
        <Pie :chart-data="data" :chart-options="options" />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// zarejestruj wszystkie potrzebne elementy i plugin
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels)

const props = defineProps({
  breakdown: {
    type: Object,
    required: true
  }
})

const labels     = ['Gotówka', 'Karta', 'Przelew', 'Inne']
const background = ['#4caf50', '#2196f3', '#ff9800', '#9e9e9e']

// przygotowujemy dane
const data = computed(() => ({
  labels,
  datasets: [{
    data: [
      props.breakdown.cash   || 0,
      props.breakdown.card   || 0,
      props.breakdown.transfer || 0,
      props.breakdown.other  || 0
    ],
    backgroundColor: background
  }]
}))

// opcje, w tym datalabels do wyświetlania % w środku wycinków
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12 }
    },
    datalabels: {
      color: '#fff',
      formatter: (value, ctx) => {
        const dataArr = ctx.chart.data.datasets[0].data
        const sum = dataArr.reduce((acc, v) => acc + v, 0)
        // jeśli sum = 0, zwróć pusty string
        if (!sum) return ''
        const pct = (value / sum * 100).toFixed(1)
        return pct + '%'
      },
      font: {
        weight: 'bold',
        size: 12
      }
    },
    tooltip: {
      callbacks: {
        label: ctx => {
          const v = ctx.parsed
          const sum = ctx.chart.data.datasets[0].data.reduce((a,b) => a+b, 0)
          const pct = sum ? (v/sum*100).toFixed(1) + '%' : ''
          return `${ctx.label}: ${v} zł (${pct})`
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 15VW;
  margin: auto;
  aspect-ratio: 1;
}
</style>