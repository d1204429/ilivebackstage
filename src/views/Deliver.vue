<template>
  <div class="order-management">
    <router-link to="/home" class="home-btn">
      <span>回首頁</span>
    </router-link>

    <div class="order-list-container">
      <div v-if="loading" class="loading">
        載入中...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

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
          <th>訂單狀態</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in sortedOrders" :key="order.orderId">
          <td>{{ order.orderId }}</td>
          <td>{{ formatDate(order.orderDate) }}</td>
          <td>
            {{ order.userName }}
            <br>
            {{ order.userPhone }}
          </td>
          <td>
            <span class="status-badge badge-info">已出貨</span>
          </td>
          <td>
            <button class="btn btn-detail" @click="viewOrderDetail(order.orderId)">
              查看詳情
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <div v-if="selectedOrder" class="order-detail-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>訂單詳情 #{{ selectedOrder.orderId }}</h3>
            <button @click="closeOrderDetail" class="close-btn">✖</button>
          </div>

          <div class="modal-body">
            <div class="order-info">
              <p>下單時間: {{ formatDate(selectedOrder.orderDate) }}</p>
<!--              <p>付款方式: {{ formatPaymentMethod(selectedOrder.paymentMethod) }}</p>-->
              <p>收貨地址: {{ selectedOrder.shippingAddress }}</p>
              <p>訂單狀態: <span class="status-badge badge-info">已出貨</span></p>
            </div>

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
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.orderItemId">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.productSpec || '無' }}</td>
                  <td>{{ item.quantity }}</td>
                </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4">
              <button
                  class="btn btn-sm btn-success"
                  @click="updateOrderStatus(ORDER_STATUS.COMPLETED.id)"
              >
                變更為已完成
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

const ORDER_STATUS = {
  SHIPPED: {
    id: 3,
    label: '已出貨',
    color: 'info'
  },
  COMPLETED: {
    id: 5,
    label: '已完成',
    color: 'success'
  }
}

const orders = ref([])
const loading = ref(false)
const error = ref(null)
const selectedOrder = ref(null)
const sortKey = ref('orderId')
const sortOrder = ref('desc')

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

const fetchOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/v1/admin/order/status/${ORDER_STATUS.SHIPPED.id}`, {
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

    await fetchOrders()
    selectedOrder.value = null
  } catch (err) {
    error.value = err.response?.data?.message || '更新訂單狀態失敗'
  }
}

const closeOrderDetail = () => {
  selectedOrder.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

.badge-info { background-color: #00BCD4; }
.badge-success { background-color: #4CAF50; }

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

.btn-sm {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
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