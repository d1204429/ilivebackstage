# MonthlyRevenue.vue
<template>
  <div class="monthly-revenue">
    <router-link to="/home" class="home-btn">
      <span>回首頁</span>
    </router-link>

    <div class="revenue-container">
      <div v-if="loading" class="loading">
        載入中...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div class="summary-cards">
          <div class="summary-card">
            <h3>本月營業額</h3>
            <div class="amount">{{ formatCurrency(currentMonthData.totalRevenue) }}</div>
            <div class="growth" :class="{ 'positive': currentMonthData.growthRate >= 0 }">
              {{ currentMonthData.growthRate > 0 ? '↑' : '↓' }}
              {{ Math.abs(currentMonthData.growthRate) }}% 較上月
            </div>
          </div>
          <div class="summary-card">
            <h3>本月訂單數</h3>
            <div class="amount">{{ currentMonthData.orderCount }}</div>
          </div>
        </div>

        <div class="chart-container">
          <h3>營業額趨勢</h3>
          <div class="revenue-chart">
            <v-chart class="chart" :option="chartOption" autoresize />
          </div>
        </div>

        <div class="revenue-table">
          <h3>月度營收明細</h3>
          <table>
            <thead>
            <tr>
              <th @click="sort('yearMonth')">
                月份
                <span v-if="sortKey === 'yearMonth'">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
              </th>
              <th @click="sort('totalRevenue')">
                營業額
                <span v-if="sortKey === 'totalRevenue'">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
              </th>
              <th @click="sort('orderCount')">
                訂單數
                <span v-if="sortKey === 'orderCount'">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
              </th>
              <th @click="sort('growthRate')">
                環比增長
                <span v-if="sortKey === 'growthRate'">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="month in sortedMonthlyData" :key="month.yearMonth">
              <td>{{ month.yearMonth }}</td>
              <td>{{ formatCurrency(month.totalRevenue) }}</td>
              <td>{{ month.orderCount }}</td>
              <td :class="{ 'positive': month.growthRate >= 0 }">
                {{ month.growthRate > 0 ? '+' : '' }}{{ month.growthRate }}%
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { LineChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import VChart, { THEME_KEY } from "vue-echarts"
import _ from 'lodash'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent
])

const orders = ref([])
const loading = ref(false)
const error = ref(null)
const sortKey = ref('yearMonth')
const sortOrder = ref('desc')

const monthlyData = computed(() => {
  const completedOrders = orders.value.filter(order => order.statusId === 5)
  const grouped = _.groupBy(completedOrders, order => {
    const date = new Date(order.orderDate)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  return Object.entries(grouped)
      .map(([yearMonth, monthOrders]) => ({
        yearMonth,
        totalRevenue: _.sumBy(monthOrders, 'totalAmount'),
        orderCount: monthOrders.length,
        growthRate: 0
      }))
      .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
})

const monthlyDataWithGrowth = computed(() => {
  return monthlyData.value.map((month, index) => {
    if (index === 0) return { ...month, growthRate: 0 }
    const previousMonth = monthlyData.value[index - 1]
    const growthRate = ((month.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue * 100) || 0
    return { ...month, growthRate: Math.round(growthRate * 10) / 10 }
  })
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      const data = params[0];
      return `${data.name} 月份<br/>營業額: ${formatCurrency(data.value)}`;
    }
  },
  xAxis: {
    type: "category",
    data: monthlyDataWithGrowth.value.map(m => m.yearMonth),
    axisLabel: {
      interval: 0,
      rotate: 45
    }
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (value) => formatCurrency(value)
    }
  },
  series: [{
    data: monthlyDataWithGrowth.value.map(m => m.totalRevenue),
    type: "line",
    smooth: true
  }]
}))

const sortedMonthlyData = computed(() => {
  return [...monthlyDataWithGrowth.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    if (sortKey.value === 'yearMonth') {
      return a[sortKey.value].localeCompare(b[sortKey.value]) * modifier
    }
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

const currentMonthData = computed(() => {
  const data = monthlyDataWithGrowth.value
  return data[data.length - 1] || { totalRevenue: 0, orderCount: 0, growthRate: 0 }
})

const fetchOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/order', {
      headers: { Authorization: `Bearer ${token}` }
    })
    orders.value = response.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || '獲取訂單失敗'
    orders.value = []
  } finally {
    loading.value = false
  }
}

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

onMounted(async () => {
  await fetchOrders()
})
</script>

<style scoped>
.monthly-revenue {
  padding: 20px;
  background-color: #f5f5f5;
}

.home-btn {
  display: inline-block;
  margin-bottom: 15px;
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-btn:hover {
  background-color: #45a049;
}

.revenue-container {
  max-width: 1200px;
  margin: 0 auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.summary-card .amount {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.summary-card .growth {
  margin-top: 10px;
  color: #f44336;
}

.summary-card .growth.positive {
  color: #4caf50;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.revenue-chart {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
}

.revenue-table {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  cursor: pointer;
}

th:hover {
  background-color: #e0e0e0;
}

td.positive {
  color: #4caf50;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: #f44336;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  th, td {
    padding: 8px;
    font-size: 14px;
  }
}
</style>