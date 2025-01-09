<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="inventory">
    <h2 class="page-title">庫存管理</h2>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else>
      <thead>
      <tr>
        <th @click="sort('productId')" class="sortable">
          商品ID
          <span v-if="sortKey === 'productId'" class="sort-icon">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
        <th>商品名稱</th>
        <th>目前庫存</th>
        <th>品牌</th>
        <th>狀態</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="product in sortedProducts" :key="product.productId">
        <td>{{ product.productId }}</td>
        <td>{{ product.name }}</td>
        <td>{{ product.stock }}</td>
        <td>{{ product.brand }}</td>
        <td>{{ product.status === 1 ? '上架' : '下架' }}</td>
        <td>
          <button
              @click="openUpdateModal(product)"
              class="btn btn-edit"
          >
            修改庫存
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 修改庫存彈窗 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>修改庫存數量</h3>
        <div class="form-group">
          <label>商品名稱:</label>
          <input
              :value="selectedProduct?.name"
              type="text"
              class="form-input"
              disabled
          >
        </div>
        <div class="form-group">
          <label>目前庫存:</label>
          <input
              :value="selectedProduct?.stock"
              type="number"
              class="form-input"
              disabled
          >
        </div>
        <div class="form-group">
          <label>新庫存數量:</label>
          <input
              v-model="formData.stock"
              type="number"
              class="form-input"
              min="0"
          >
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-cancel">取消</button>
          <button
              @click="updateStock"
              class="btn btn-submit"
              :disabled="!formData.stock || formData.stock < 0"
          >
            確認更新
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const products = ref([])
const loading = ref(false)
const error = ref(null)
const sortKey = ref('productId')
const sortOrder = ref('asc')
const showModal = ref(false)
const selectedProduct = ref(null)
const formData = ref({
  stock: ''
})

const sortedProducts = computed(() => {
  return [...products.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    products.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || '獲取商品資料失敗'
  } finally {
    loading.value = false
  }
}

const openUpdateModal = (product) => {
  selectedProduct.value = product
  formData.value.stock = product.stock
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  formData.value.stock = ''
}

const updateStock = async () => {
  if (!selectedProduct.value || !formData.value.stock) return

  try {
    const token = localStorage.getItem('token')
    await axios.put(
        `/api/v1/admin/products/${selectedProduct.value.productId}/stock`,
        { stock: parseInt(formData.value.stock) },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchProducts()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || '更新庫存失敗'
  }
}

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// 初始化
fetchProducts()
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.sortable {
  cursor: pointer;
}

.sort-icon {
  margin-left: 5px;
}

tr:hover {
  background-color: #f9f9f9;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
}

.btn-edit:hover {
  background-color: #1e88e5;
}

.btn-cancel {
  background-color: #757575;
  color: white;
}

.btn-cancel:hover {
  background-color: #616161;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
}

.btn-submit:hover {
  background-color: #45a049;
}

.error {
  color: #f44336;
  padding: 12px;
  margin: 12px 0;
  background-color: #ffebee;
  border-radius: 4px;
}

.modal {
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
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #2196f3;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.home-btn {
  margin: 20px;
  text-decoration: none;
  color: #333;
  display: block;
}

.home-btn:hover {
  color: #2196f3;
}
</style>