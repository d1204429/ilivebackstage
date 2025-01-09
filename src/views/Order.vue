<template>
  <div class="order-management">
    <!-- 保持原有的返回主頁按鈕和基本結構 -->
    <router-link to="/home" class="home-btn">
      <span>回首頁</span>
    </router-link>

    <div class="order-list-container">
      <!-- 狀態篩選部分保持不變 -->
      <div class="status-filter">
        <button
            v-for="(status, key) in ORDER_STATUS"
            :key="status.id"
            @click="filterByStatus(status.id)"
            :class="[
            'status-btn',
            currentStatusFilter === status.id ? 'active' : '',
            `btn-${status.color}`
          ]"
        >
          {{ status.label }}
        </button>
        <button
            @click="resetFilter"
            class="status-btn btn-reset"
        >
          全部訂單
        </button>
      </div>

      <!-- 載入和錯誤狀態保持不變 -->
      <div v-if="loading" class="loading">
        載入中...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <!-- 修改訂單列表，移除行點擊事件 -->
      <table v-else class="order-table">
        <thead>
        <tr>
          <th @click="sort('orderId')">
            訂單編號
            <span v-if="sortKey === 'orderId'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
          </th>
          <th @click="sort('orderDate')">
            下單時間
            <span v-if="sortKey === 'orderDate'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
          </th>
          <th>客戶資訊</th>
          <th @click="sort('totalAmount')">
            訂單金額
            <span v-if="sortKey === 'totalAmount'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
          </th>
          <th>訂單狀態</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="order in sortedOrders"
            :key="order.orderId"
        >
          <td>{{ order.orderId }}</td>
          <td>{{ formatDate(order.orderDate) }}</td>
          <td>
            {{ order.userName }}
            <br>
            {{ order.userPhone }}
          </td>
          <td>{{ formatCurrency(order.totalAmount) }}</td>
          <td>
              <span
                  :class="[
                  'status-badge',
                  `badge-${ORDER_STATUS[getStatusKey(order.statusId)].color}`
                ]"
              >
                {{ ORDER_STATUS[getStatusKey(order.statusId)].label }}
              </span>
          </td>
          <td>
            <button
                class="btn btn-detail"
                @click="viewOrderDetail(order.orderId)"
            >
              查看詳情
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 訂單詳情彈窗保持不變，但修改狀態更新邏輯 -->
      <div v-if="selectedOrder" class="order-detail-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>訂單詳情 #{{ selectedOrder.orderId }}</h3>
            <button @click="closeOrderDetail" class="close-btn">✖</button>
          </div>

          <div class="modal-body">
            <!-- 訂單基本資訊 -->
            <div class="order-info">
              <p>下單時間: {{ formatDate(selectedOrder.orderDate) }}</p>
              <p>總金額: {{ formatCurrency(selectedOrder.totalAmount) }}</p>
              <p>付款方式: {{ formatPaymentMethod(selectedOrder.paymentMethod) }}</p>
              <p>收貨地址: {{ selectedOrder.shippingAddress }}</p>
              <p>訂單狀態:
                <span
                    :class="[
                    'status-badge',
                    `badge-${ORDER_STATUS[getStatusKey(selectedOrder.statusId)].color}`
                  ]"
                >
                  {{ ORDER_STATUS[getStatusKey(selectedOrder.statusId)].label }}
                </span>
              </p>
            </div>

            <!-- 其他詳情內容保持不變 -->
            <div class="user-info">
              <h4>客戶資訊</h4>
              <p>姓名: {{ selectedOrder.userName }}</p>
              <p>電話: {{ selectedOrder.userPhone }}</p>
              <p>信箱: {{ selectedOrder.userEmail || '未提供' }}</p>
            </div>

            <div class="order-items">
              <h4>訂購商品</h4>
              <table>
                <thead>
                <tr>
                  <th>商品名稱</th>
                  <th>規格</th>
                  <th>數量</th>
                  <th>單價</th>
                  <th>小計</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.orderItemId">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.productSpec || '無' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }}</td>
                  <td>{{ formatCurrency(item.price * item.quantity) }}</td>
                </tr>
                </tbody>
              </table>
            </div>


            <div v-if="canChangeStatus" class="mt-4 space-x-2">
              <!-- 未付款訂單選項 -->
              <button v-if="selectedOrder.statusId === ORDER_STATUS.ORDERED.id"
                      v-for="status in [ORDER_STATUS.CANCELLED, ORDER_STATUS.EXPIRED]"
                      :key="status.id"
                      class="btn btn-sm"
                      :class="`btn-${status.color}`"
                      @click="updateOrderStatus(status.id)">
                變更為{{ status.label }}
              </button>

              <!-- 已付款訂單選項 -->
              <button v-if="selectedOrder.statusId === ORDER_STATUS.PAID.id"
                      v-for="status in [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED]"
                      :key="status.id"
                      class="btn btn-sm"
                      :class="`btn-${status.color}`"
                      @click="updateOrderStatus(status.id)">
                變更為{{ status.label }}
              </button>

              <!-- 已出貨訂單選項 -->
              <button v-if="selectedOrder.statusId === ORDER_STATUS.SHIPPED.id"
                      v-for="status in [ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDED]"
                      :key="status.id"
                      class="btn btn-sm"
                      :class="`btn-${status.color}`"
                      @click="updateOrderStatus(status.id)">
                變更為{{ status.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 訂單狀態常數保持不變
const ORDER_STATUS = {
  ORDERED: {
    id: 1,
    label: '下單鎖定',
    color: 'warning'
  },
  PAID: {
    id: 2,
    label: '已付款',
    color: 'primary'
  },
  SHIPPED: {
    id: 3,
    label: '已出貨',
    color: 'info'
  },
  CANCELLED: {
    id: 4,
    label: '已取消',
    color: 'danger'
  },
  COMPLETED: {
    id: 5,
    label: '已完成',
    color: 'success'
  },
  REFUNDED: {
    id: 6,
    label: '已退貨',
    color: 'secondary'
  },
  EXPIRED: {
    id: 7,
    label: '未付款取消',
    color: 'dark'
  }
}

// 修改可更新的狀態邏輯
const FINAL_STATUSES = [
  ORDER_STATUS.CANCELLED,  // id: 4
  ORDER_STATUS.COMPLETED,  // id: 5
  ORDER_STATUS.REFUNDED,  // id: 6
  ORDER_STATUS.EXPIRED    // id: 7
]

// 計算屬性：判斷是否可以更改狀態
const canChangeStatus = computed(() => {
  if (!selectedOrder.value) return false
  return finalStatusOptions.value.length > 0
})

// 計算屬性：可用的最終狀態選項
const finalStatusOptions = computed(() => {
  if (!selectedOrder.value) return []

  const currentStatus = selectedOrder.value.statusId

  // 如果是未付款狀態(ORDERED)
  if (currentStatus === ORDER_STATUS.ORDERED.id) {
    return [ORDER_STATUS.CANCELLED, ORDER_STATUS.EXPIRED]
  }

  // 如果是已付款狀態(PAID)
  if (currentStatus === ORDER_STATUS.PAID.id) {
    return [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED]
  }

  // 如果是已出貨狀態(SHIPPED)
  if (currentStatus === ORDER_STATUS.SHIPPED.id) {
    return [ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDED]
  }

  // 如果已經是最終狀態，則不能更改
  return []
})

// 其他ref和狀態保持不變
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const currentStatusFilter = ref(null)
const selectedOrder = ref(null)
const sortKey = ref('orderId')
const sortOrder = ref('desc')

// 其他方法保持不變
const getStatusKey = (statusId) => {
  return Object.keys(ORDER_STATUS).find(key =>
      ORDER_STATUS[key].id === statusId
  )
}

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

// 其他函數保持不變
const filterByStatus = (statusId) => {
  currentStatusFilter.value = statusId
  fetchOrders(statusId)
}

const resetFilter = () => {
  currentStatusFilter.value = null
  fetchOrders()
}

// API 相關函數保持不變
const fetchOrders = async (statusId = null) => {
  loading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')
    const url = statusId
        ? `/api/v1/admin/order/status/${statusId}`
        : '/api/v1/admin/order'

    const response = await axios.get(url, {
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

const viewOrderDetail = async (orderId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/v1/admin/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    selectedOrder.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || '獲取訂單詳情失敗'
  }
}

const updateOrderStatus = async (newStatusId) => {
  if (!selectedOrder.value) return

  try {
    const token = localStorage.getItem('token')
    await axios.put(
        `/api/v1/admin/order/${selectedOrder.value.orderId}/status`,
        { statusId: newStatusId },
        { headers: { Authorization: `Bearer ${token}` } }
    )

    // 重新獲取訂單列表和詳情
    await fetchOrders(currentStatusFilter.value)
    await viewOrderDetail(selectedOrder.value.orderId)
  } catch (err) {
    error.value = err.response?.data?.message || '更新訂單狀態失敗'
  }
}

const closeOrderDetail = () => {
  selectedOrder.value = null
}

// 格式化函數保持不變
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatPaymentMethod = (method) => {
  const paymentMethods = {
    'CREDIT_CARD': '信用卡',
    'CASH': '現金',
    'BANK_TRANSFER': '銀行轉帳'
  }
  return paymentMethods[method] || method
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management {
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

.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.status-btn:hover {
  opacity: 0.8;
}

.status-btn.active {
  opacity: 0.7;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.2) inset;
}

/* 狀態按鈕顏色定義 */
.btn-warning { background-color: #FFC107; color: white; }
.btn-primary { background-color: #2196F3; color: white; }
.btn-info { background-color: #00BCD4; color: white; }
.btn-danger { background-color: #F44336; color: white; }
.btn-success { background-color: #4CAF50; color: white; }
.btn-secondary { background-color: #9E9E9E; color: white; }
.btn-dark { background-color: #616161; color: white; }
.btn-reset { background-color: #607D8B; color: white; }

.order-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 15px;
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.order-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  cursor: pointer;
  position: relative;
}

.order-table th:hover {
  background-color: #e6e6e6;
}

.order-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.order-table tr:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.badge-warning { background-color: #FFC107; }
.badge-primary { background-color: #2196F3; }
.badge-info { background-color: #00BCD4; }
.badge-danger { background-color: #F44336; }
.badge-success { background-color: #4CAF50; }
.badge-secondary { background-color: #9E9E9E; }
.badge-dark { background-color: #616161; }

.btn-detail {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-detail:hover {
  background-color: #1976D2;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
}

/* 訂單詳情彈窗 */
.order-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.order-info, .user-info {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.order-items table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.order-items th,
.order-items td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.status-update {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.status-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-change-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #2196F3;
  color: white;
  transition: opacity 0.3s;
}

.status-change-btn:hover {
  opacity: 0.8;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .status-filter {
    flex-direction: column;
  }

  .status-btn {
    width: 100%;
  }

  .order-table,
  .modal-content {
    font-size: 12px;
  }

  .modal-content {
    width: 95%;
    margin: 0 auto;
  }
}
</style>