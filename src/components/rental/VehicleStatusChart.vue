<!-- src/components/VehicleStatusChart.vue -->
<template>
  <div class="chart-container">
    <Pie :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// rejestracja elementów Chart.js + pluginu datalabels
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const props = defineProps({
  counts: {
    type: Object,
    required: true
  }
})

// dane wykresu
const chartData = computed(() => ({
  labels: ['Wypożyczone', 'Dostępne', 'Niedostępne'],
  datasets: [{
    data: [
      props.counts.rented     || 0,
      props.counts.available  || 0,
      props.counts.unavailable|| 0
    ],
    backgroundColor: ['#ff9800', '#4caf50', '#f44336'],
    borderColor:     ['#ffffff', '#ffffff', '#ffffff'],
    borderWidth: 2
  }]
}))

// opcje wykresu
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',    // ← przenosi legendę na dół
      align: 'center',       // wyśrodkowanie
      labels: {
        boxWidth: 12,
        padding: 10
    }},
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 12 },
      formatter: v => v || 0
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
