# Categories.vue

<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="categories">
    <div class="header-actions">
      <button @click="openCreateModal" class="btn btn-create">
        新增分類
      </button>
    </div>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else>
      <thead>
      <tr>
        <th @click="sort('categoryId')" class="sortable">
          ID
          <span v-if="sortKey === 'categoryId'" class="sort-icon">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
        </th>
        <th>分類名稱</th>
        <th>父分類ID</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="category in sortedCategories" :key="category.categoryId">
        <td>{{ category.categoryId }}</td>
        <td>{{ category.categoryName }}</td>
        <td>{{ category.parentCategoryId || '-' }}</td>
        <td>
          <div class="action-wrapper">
            <button
                @click="openEditModal(category)"
                class="btn btn-edit"
            >
              修改
            </button>
            <button
                @click="deleteCategory(category.categoryId)"
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
        <h3>{{ isEditing ? '修改分類' : '新增分類' }}</h3>
        <div class="form-group">
          <label>分類名稱:</label>
          <input
              v-model="formData.categoryName"
              type="text"
              class="form-input"
          >
        </div>
        <div class="form-group">
          <label>父分類ID:</label>
          <input
              v-model="formData.parentCategoryId"
              type="number"
              class="form-input"
          >
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-cancel">取消</button>
          <button
              @click="submitForm"
              class="btn btn-submit"
              :disabled="!formData.categoryName"
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

const categories = ref([])
const loading = ref(false)
const error = ref(null)
const sortKey = ref('categoryId')
const sortOrder = ref('asc')
const showModal = ref(false)
const isEditing = ref(false)
const formData = ref({
  categoryId: null,
  categoryName: '',
  parentCategoryId: 0
})

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

const fetchCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
    categories.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || '獲取分類資料失敗'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    categoryId: null,
    categoryName: '',
    parentCategoryId: 0
  }
  showModal.value = true
}

const openEditModal = (category) => {
  isEditing.value = true
  formData.value = { ...category }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    categoryId: null,
    categoryName: '',
    parentCategoryId: 0
  }
}

const submitForm = async () => {
  try {
    const token = localStorage.getItem('token')
    if (isEditing.value) {
      await axios.put(
          `/api/v1/admin/categories/${formData.value.categoryId}`,
          formData.value,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    } else {
      await axios.post(
          '/api/v1/admin/categories',
          formData.value,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    await fetchCategories()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || '操作失敗'
  }
}

const deleteCategory = async (categoryId) => {
  if (!confirm('確定要刪除此分類嗎？')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/v1/admin/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await fetchCategories()
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
fetchCategories()
</script>

<style scoped>
.categories {
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