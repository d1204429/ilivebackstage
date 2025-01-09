<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="recommends">
    <div class="header-actions">
      <button @click="openCreateModal" class="btn btn-create">
        新增推薦商品序列與商品
      </button>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else>
      <thead>
      <tr>
        <th @click="sort('recommendId')" class="sortable">
          推薦ID
          <span v-if="sortKey === 'recommendId'" class="sort-icon">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
        <th>商品資訊</th>
        <th>建立時間</th>
        <th>更新時間</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="recommend in sortedRecommends" :key="recommend.recommendId">
        <td>{{ recommend.recommendId }}</td>
        <td>
          <div class="product-info">
            <span class="product-id">ID: {{ recommend.productId }}</span>
            <span class="product-name">{{ productNames[recommend.productId] || '商品不存在' }}</span>
          </div>
        </td>
        <td>{{ formatDate(recommend.createdAt) }}</td>
        <td>{{ formatDate(recommend.updatedAt) }}</td>
        <td>
          <div class="action-wrapper">
            <button
                @click="openEditModal(recommend)"
                class="btn btn-edit"
            >
              修改
            </button>
            <button
                @click="deleteRecommend(recommend.recommendId)"
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
        <h3>{{ isEditing ? '修改推薦商品' : '新增推薦商品' }}</h3>
        <div class="form-group">
          <label>商品ID:</label>
          <div class="product-select">
            <input
                v-model="formData.productId"
                type="number"
                class="form-input"
                @input="handleProductInput"
            >
            <div v-if="formData.productId && productNames[formData.productId]" class="product-preview">
              商品名稱: {{ productNames[formData.productId] }}
            </div>
            <div v-else-if="formData.productId" class="product-preview error">
              查無此商品
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-cancel">取消</button>
          <button
              @click="submitForm"
              class="btn btn-submit"
              :disabled="!isValidProduct"
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
import { ElMessage } from 'element-plus'

const recommends = ref([])
const productNames = ref({})
const loading = ref(false)
const error = ref(null)
const sortKey = ref('recommendId')
const sortOrder = ref('asc')
const showModal = ref(false)
const isEditing = ref(false)
const formData = ref({
  recommendId: null,
  productId: '',
})

const sortedRecommends = computed(() => {
  return [...recommends.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

const isValidProduct = computed(() => {
  return formData.value.productId && productNames.value[formData.value.productId]
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    productNames.value = response.data.reduce((acc, product) => {
      acc[product.productId] = product.name
      return acc
    }, {})
  } catch (err) {
    error.value = err.response?.data?.message || '獲取商品資料失敗'
  }
}

const fetchRecommends = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/products/recommends', {
      headers: { Authorization: `Bearer ${token}` }
    })
    recommends.value = response.data
    await fetchProducts()
  } catch (err) {
    error.value = err.response?.data?.message || '獲取推薦商品資料失敗'
  } finally {
    loading.value = false
  }
}

const handleProductInput = async () => {
  if (!formData.value.productId) return
  if (!productNames.value[formData.value.productId]) {
    await fetchProducts()
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    recommendId: null,
    productId: '',
  }
  showModal.value = true
}

const openEditModal = (recommend) => {
  isEditing.value = true
  formData.value = { ...recommend }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    recommendId: null,
    productId: '',
  }
}

const submitForm = async () => {
  if (!isValidProduct.value) {
    error.value = '請選擇有效的商品'
    return
  }

  // 檢查商品ID是否已存在於推薦列表中
  const isDuplicate = recommends.value.some(
      item => item.productId === Number(formData.value.productId) &&
          item.recommendId !== formData.value.recommendId
  )

  if (isDuplicate) {
    // 使用 Element Plus 的 Message 組件
    ElMessage({
      message: '此商品已在推薦列表中',
      type: 'warning',
      duration: 1000
    })
    return
  }

  try {
    const token = localStorage.getItem('token')
    if (isEditing.value) {
      await axios.put(
          `/api/v1/admin/products/recommends/${formData.value.recommendId}`,
          { productId: formData.value.productId },
          { headers: { Authorization: `Bearer ${token}` } }
      )
    } else {
      await axios.post(
          '/api/v1/admin/products/recommends',
          { productId: formData.value.productId },
          { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    await fetchRecommends()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || '操作失敗'
  }
}

const deleteRecommend = async (recommendId) => {
  if (!recommendId || isNaN(Number(recommendId))) {
    error.value = '無效的推薦ID'
    return
  }

  if (!confirm('確定要刪除此推薦商品嗎？')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/v1/admin/products/recommends/${recommendId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await fetchRecommends()
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
fetchRecommends()
</script>

<style scoped>
.recommends {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-id {
  font-weight: bold;
  color: #666;
}

.product-name {
  color: #333;
}

.product-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-preview {
  font-size: 14px;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.product-preview.error {
  color: #f44336;
  background-color: #ffebee;
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
</style>