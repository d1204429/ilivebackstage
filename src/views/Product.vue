<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="products">
    <div class="header-actions">
      <button @click="openCreateModal" class="btn btn-create">
        新增商品
      </button>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else>
      <thead>
      <tr>
        <th @click="sort('productId')" class="sortable">
          ID
          <span v-if="sortKey === 'productId'" class="sort-icon">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
        </th>
        <th>商品名稱</th>
        <th>價格</th>
        <th>庫存</th>
        <th>品牌</th>
        <th>分類ID</th>
        <th>狀態</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="product in sortedProducts" :key="product.productId">
        <td>{{ product.productId }}</td>
        <td>{{ product.name }}</td>
        <td>{{ product.price }}</td>
        <td>{{ product.stock }}</td>
        <td>{{ product.brand }}</td>
        <td>{{ product.categoryId }}</td>
        <td>{{ product.status === 1 ? '上架' : '下架' }}</td>
        <td>
          <div class="action-wrapper">
            <button
                @click="openEditModal(product)"
                class="btn btn-edit"
            >
              修改
            </button>
            <button
                @click="toggleStatus(product)"
                class="btn"
                :class="product.status === 1 ? 'btn-warning' : 'btn-success'"
            >
              {{ product.status === 1 ? '下架' : '上架' }}
            </button>
            <button
                @click="deleteProduct(product.productId)"
                class="btn btn-delete"
            >
              刪除
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 新增/修改彈窗 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ isEditing ? '修改商品' : '新增商品' }}</h3>
        <div class="form-group">
          <label>商品名稱:</label>
          <input
              v-model="formData.name"
              type="text"
              class="form-input"
          >
        </div>
        <div class="form-group">
          <label>商品描述:</label>
          <textarea
              v-model="formData.description"
              class="form-input"
              rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>價格:</label>
          <input
              v-model="formData.price"
              type="number"
              step="0.01"
              class="form-input"
          >
        </div>
        <div class="form-group" v-if="!isEditing">
          <label>庫存:</label>
          <input
              v-model="formData.stock"
              type="number"
              class="form-input"
          >
        </div>
        <div class="form-group">
          <label>品牌:</label>
          <input
              v-model="formData.brand"
              type="text"
              class="form-input"
          >
        </div>
        <div class="form-group">
          <label>分類ID:</label>
          <input
              v-model="formData.categoryId"
              type="number"
              class="form-input"
          >
        </div>
        <div class="form-group">
          <label>商品圖片URL:</label>
          <input
              v-model="formData.imageUrl"
              type="text"
              class="form-input"
          >
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-cancel">取消</button>
          <button
              @click="submitForm"
              class="btn btn-submit"
              :disabled="!formData.name || !formData.price"
          >
            確認
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
const isEditing = ref(false)
const formData = ref({
  productId: null,
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  brand: '',
  imageUrl: '',
  status: 1
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

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    productId: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    brand: '',
    imageUrl: '',
    status: 1
  }
  showModal.value = true
}

const openEditModal = (product) => {
  isEditing.value = true
  formData.value = { ...product }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    productId: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    brand: '',
    imageUrl: '',
    status: 1
  }
}

const submitForm = async () => {
  try {
    const token = localStorage.getItem('token')
    if (isEditing.value) {
      await axios.put(
          `/api/v1/admin/products/${formData.value.productId}`,
          formData.value,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    } else {
      await axios.post(
          '/api/v1/admin/products',
          formData.value,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    await fetchProducts()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || '操作失敗'
  }
}

const toggleStatus = async (product) => {
  // 確保 product.productId 是有效的數字
  if (!product || !product.productId || isNaN(Number(product.productId))) {
    error.value = '無效的商品ID'
    return
  }

  if (!confirm(`確定要${product.status === 1 ? '下架' : '上架'}此商品嗎？`)) return

  try {
    const token = localStorage.getItem('token')
    const newStatus = product.status === 1 ? 0 : 1
    await axios.put(
        `/api/v1/admin/products/${product.productId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchProducts()
  } catch (err) {
    error.value = err.response?.data?.message || '狀態更新失敗'
  }
}

const deleteProduct = async (productId) => {
  if (!productId || isNaN(Number(productId))) {
    error.value = '無效的商品ID'
    return
  }

  if (!confirm('確定要刪除此商品嗎？')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/v1/admin/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await fetchProducts()
  } catch (err) {
    error.value = err.response?.data?.message || '刪除失敗'
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
.products {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
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

.action-wrapper {
  display: flex;
  gap: 8px;
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

.btn-create {
  background-color: #4caf50;
  color: white;
}

.btn-create:hover {
  background-color: #45a049;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
}

.btn-edit:hover {
  background-color: #1e88e5;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-delete:hover {
  background-color: #e53935;
}

.btn-warning {
  background-color: #ff9800;
  color: white;
}

.btn-warning:hover {
  background-color: #f57c00;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-success:hover {
  background-color: #45a049;
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

textarea.form-input {
  resize: vertical;
  min-height: 80px;
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
</style>