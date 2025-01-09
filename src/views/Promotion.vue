<template>
  <!-- 保留原有 router-link -->
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>

  <div class="promotions">
    <!-- 保留原有 header-actions -->
    <div class="header-actions">
      <button @click="openCreateModal" class="btn btn-create">
        新增活動
      </button>
    </div>

    <!-- 保留原有 loading & error 處理 -->
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 主要的活動列表 table -->
    <table v-else>
      <thead>
      <tr>
        <th @click="sort('id')" class="sortable">
          活動ID
          <span v-if="sortKey === 'id'" class="sort-icon">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
        </th>
        <th>標題</th>
        <th>描述</th>
        <th>折扣類型</th>
        <th>折扣值</th>
        <th>活動期間</th>
        <th>狀態</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="promotion in sortedPromotions" :key="promotion.promotionId">
        <!-- 活動主要資訊行 -->
        <tr>
          <td>{{ promotion.promotionId }}</td>
          <td>{{ promotion.title }}</td>
          <td>{{ promotion.description }}</td>
          <td>{{ promotion.discountType === 'PERCENTAGE' ? '百分比' : '固定金額' }}</td>
          <td>{{ promotion.discountValue }}{{ promotion.discountType === 'PERCENTAGE' ? '%' : '元' }}</td>
          <td>
            {{ formatDate(promotion.startDate) }} ~ {{ formatDate(promotion.endDate) }}
          </td>
          <td>
              <span
                  class="promotion-status"
                  :class="{
                  'status-active': promotion.isActive,
                  'status-inactive': !promotion.isActive
                }"
              >
                {{ promotion.isActive ? '啟用' : '不啟用' }}
              </span>
          </td>
          <td>
            <div class="action-wrapper">
              <button
                  @click="toggleProducts(promotion)"
                  class="btn btn-view"
                  :class="{ 'btn-active': expandedPromotion === promotion.promotionId }"
              >
                {{ expandedPromotion === promotion.promotionId ? '收起' : '商品' }}
              </button>
              <button @click="openEditModal(promotion)" class="btn btn-edit">
                修改
              </button>
            </div>
          </td>
        </tr>

        <!-- 展開的商品列表行 -->
        <tr v-if="expandedPromotion === promotion.promotionId" class="expanded-row">
          <td colspan="8">
            <div class="products-section" :class="{ 'fade-enter-active': expandedPromotion === promotion.promotionId }">
              <div class="products-header">
                <h4>關聯商品列表</h4>
                <button @click="openAddProductModal(promotion)" class="btn btn-add">
                  新增商品
                </button>
              </div>

              <!-- 商品列表 loading 狀態 -->
              <div v-if="productsLoading" class="loading">
                商品資料載入中...
              </div>

              <!-- 商品列表錯誤狀態 -->
              <div v-else-if="productsError" class="error">
                {{ productsError }}
              </div>

              <!-- 商品列表 table -->
              <table v-else class="products-table">
                <thead>
                <tr>
                  <th>商品ID</th>
                  <th>商品名稱</th>
                  <th>原價</th>
                  <th>促銷價</th>
                  <th>庫存</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="product in promotionProducts" :key="product.ProductID">
                  <td>{{ product.ProductID }}</td>
                  <td>{{ product.Name }}</td>
                  <td>{{ formatPrice(product.Price) }}</td>
                  <td>{{ formatPrice(product.PromotionalPrice) }}</td>
                  <td>{{ product.Stock }}</td>
                  <td>
                    <button
                        @click="confirmRemoveProduct(product.ProductID, promotion.promotionId)"
                        class="btn btn-delete"
                    >
                      移除
                    </button>
                  </td>
                </tr>
                <!-- 無商品時的提示 -->
                <tr v-if="promotionProducts.length === 0">
                  <td colspan="6" class="no-data">
                    尚未添加商品
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </template>
      </tbody>
    </table>

    <!-- 保留原有活動編輯 Modal -->
    <el-dialog
        v-model="showModal"
        :title="isEditing ? '修改活動' : '新增活動'"
        width="50%"
    >
      <!-- 保留原有表單內容 -->
    </el-dialog>

    <!-- 新增商品 Modal -->
    <el-dialog
        v-model="showProductModal"
        title="新增商品至活動"
        width="30%"
        :close-on-click-modal="false"
    >
      <div class="form-group">
        <label>商品ID：</label>
        <input
            v-model="productForm.productId"
            type="number"
            class="form-input"
            @input="handleProductInput"
            :disabled="productSearching"
        >

        <!-- 商品搜尋中狀態 -->
        <div v-if="productSearching" class="product-searching">
          搜尋商品中...
        </div>

        <!-- 商品預覽資訊 -->
<!--        <div v-else-if="selectedProduct" class="product-preview">-->
<!--          <div class="product-info">-->
<!--            <span class="product-name">{{ selectedProduct.Name }}</span>-->
<!--&lt;!&ndash;            <span class="product-price">原價: {{ formatPrice(selectedProduct.Price) }}</span>&ndash;&gt;-->
<!--          </div>-->
<!--        </div>-->

        <!-- 商品搜尋錯誤 -->
        <div v-else-if="productSearchError" class="product-error">
          {{ productSearchError }}
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeProductModal">取消</el-button>
          <el-button
              type="primary"
              @click="addProduct"
              :disabled="!selectedProduct || productSearching"
          >
            確認
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// State
const promotions = ref([])
const promotionProducts = ref([])
const expandedPromotion = ref(null)
const loading = ref(false)
const error = ref(null)
const sortKey = ref('id')
const sortOrder = ref('asc')
const showModal = ref(false)
const showProductModal = ref(false)
const isEditing = ref(false)
const selectedProduct = ref(null)
const productSearching = ref(false)
const productSearchError = ref(null)
const productsLoading = ref(false)
const productsError = ref(null)

// Form data
const formData = ref({
  title: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  startDate: '',
  endDate: '',
  isActive: false
})

const productForm = ref({
  productId: '',
  promotionId: null
})

const dateRange = ref([])

// Computed
const sortedPromotions = computed(() => {
  return [...promotions.value].sort((a, b) => {
    const modifier = sortOrder.value === 'desc' ? -1 : 1
    return (a[sortKey.value] - b[sortKey.value]) * modifier
  })
})

// Helpers
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(price)
}

// API Functions
const fetchPromotions = async () => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/v1/admin/promotions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    promotions.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || '獲取活動資料失敗'
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (id, status) => {
  if (!id) return

  const promotion = promotions.value.find(p => p.id === id)
  if (!promotion) return

  const endDate = new Date(promotion.endDate)
  const now = new Date()

  if (status && endDate < now) {
    ElMessage.warning('已超過結束時間的活動不可啟用')
    await fetchPromotions()
    return
  }

  try {
    const token = localStorage.getItem('token')
    await axios.patch(
        `/api/v1/admin/promotions/${id}/status`,
        { isActive: Boolean(status) },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    ElMessage.success('狀態更新成功')
    await fetchPromotions()
  } catch (err) {
    error.value = err.response?.data?.message || '狀態更新失敗'
  }
}

// Products Management
const toggleProducts = async (promotion) => {
  if (expandedPromotion.value === promotion.promotionId) {
    expandedPromotion.value = null
  } else {
    expandedPromotion.value = promotion.promotionId
    await fetchPromotionProducts(promotion.promotionId)
  }
}

const fetchPromotionProducts = async (promotionId) => {
  productsLoading.value = true
  productsError.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
        `/api/v1/admin/product-promotions/promotion/${promotionId}/products`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    promotionProducts.value = response.data
  } catch (err) {
    productsError.value = err.response?.data?.message || '獲取商品資料失敗'
  } finally {
    productsLoading.value = false
  }
}

// Product Search and Validation
const handleProductInput = async () => {
  selectedProduct.value = null
  productSearchError.value = null

  const productId = productForm.value.productId
  if (!productId || productId <= 0) {
    productSearchError.value = '請輸入有效的商品ID'
    return
  }

  productSearching.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
        `/api/v1/admin/products/${productForm.value.productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    // 檢查商品是否已在當前活動中
    const isDuplicate = promotionProducts.value.some(
        p => p.ProductID === response.data.ProductID
    )

    if (isDuplicate) {
      productSearchError.value = '此商品已加入本活動'
      selectedProduct.value = null
    } else {
      selectedProduct.value = response.data
    }
  } catch (err) {
    productSearchError.value = err.response?.data?.message || '查無此商品'
    selectedProduct.value = null
  } finally {
    productSearching.value = false
  }
}

// Modal Functions
const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    isActive: false
  }
  dateRange.value = []
  showModal.value = true
}

const openEditModal = (promotion) => {
  isEditing.value = true
  formData.value = {
    ...promotion,
    id: promotion.promotionId
  }
  dateRange.value = [promotion.startDate, promotion.endDate]
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    isActive: false
  }
  dateRange.value = []
}

const openAddProductModal = (promotion) => {
  productForm.value = {
    productId: '',
    promotionId: promotion.promotionId
  }
  selectedProduct.value = null
  productSearchError.value = null
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  productForm.value = {
    productId: '',
    promotionId: null
  }
  selectedProduct.value = null
  productSearchError.value = null
}

// Form Submission
const submitForm = async () => {
  if (!dateRange.value?.length === 2) {
    ElMessage.warning('請選擇活動期間')
    return
  }

  const data = {
    ...formData.value,
    startDate: dateRange.value[0],
    endDate: dateRange.value[1],
    discountValue: Number(formData.value.discountValue)
  }

  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    if (isEditing.value) {
      await axios.put(`/api/v1/admin/promotions/${formData.value.promotionId}`, data, { headers })
      ElMessage.success('修改成功')
    } else {
      await axios.post('/api/v1/admin/promotions', data, { headers })
      ElMessage.success('新增成功')
    }
    await fetchPromotions()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || '操作失敗'
  }
}

// Product Management
const addProduct = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
        '/api/v1/admin/product-promotions',
        {
          productId: productForm.value.productId,
          promotionId: productForm.value.promotionId
        },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchPromotionProducts(productForm.value.promotionId)
    closeProductModal()
    ElMessage.success('商品新增成功')
  } catch (err) {
    error.value = err.response?.data?.message || '新增商品失敗'
  }
}

const confirmRemoveProduct = async (productId, promotionId) => {
  try {
    await ElMessageBox.confirm('確定要移除此商品嗎？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeProduct(productId, promotionId)
  } catch (err) {
    if (err !== 'cancel') {
      error.value = err.response?.data?.message || '移除商品失敗'
    }
  }
}

const removeProduct = async (productId, promotionId) => {
  try {
    const token = localStorage.getItem('token')
    await axios.delete(
        `/api/v1/admin/product-promotions/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchPromotionProducts(promotionId)
    ElMessage.success('商品移除成功')
  } catch (err) {
    throw err
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

// Initial fetch
fetchPromotions()
</script>

<style scoped>
.promotions {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Table Styles */
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
  user-select: none;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

tr:hover {
  background-color: #f9f9f9;
}

/* Product Section Styles */
.products-section {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  animation: fadeIn 0.3s ease-in-out;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.products-header h4 {
  margin: 0;
  color: #303133;
}

.products-table {
  width: 100%;
  margin: 0;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Button Styles */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
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

.btn-view {
  background-color: #ff9800;
  color: white;
}

.btn-view:hover {
  background-color: #f57c00;
}

.btn-active {
  background-color: #fb8c00;
}

.btn-add {
  background-color: #4caf50;
  color: white;
}

.btn-add:hover {
  background-color: #45a049;
}

.action-wrapper {
  display: flex;
  gap: 8px;
}

/* Form Styles */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
  font-size: 14px;
}

.form-input:focus {
  border-color: #2196f3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

/* Status Indicators */
.product-searching {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  animation: pulse 1.5s infinite;
}

.product-preview {
  margin-top: 8px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.product-preview:hover {
  background-color: #ebebeb;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.product-price {
  color: #606266;
  font-size: 14px;
}

.product-error {
  margin-top: 8px;
  padding: 8px;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 4px;
  font-size: 14px;
}

.status-active {
  color: #67c23a;
  font-weight: 500;
}

.status-inactive {
  color: #909399;
}

/* Loading & Error States */
.loading {
  text-align: center;
  padding: 20px;
  color: #606266;
  font-size: 14px;
}

.error {
  color: #f44336;
  padding: 12px;
  margin: 12px 0;
  background-color: #ffebee;
  border-radius: 4px;
  font-size: 14px;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 14px;
}

/* Dialog Styles */
:deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

.dialog-footer button + button {
  margin-left: 10px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .action-wrapper {
    flex-direction: column;
    gap: 4px;
  }

  .btn {
    width: 100%;
  }

  .products-header {
    flex-direction: column;
    gap: 8px;
  }

  .products-header h4 {
    margin-bottom: 8px;
  }
}

/* Print Styles */
@media print {
  .btn,
  .action-wrapper,
  .header-actions {
    display: none;
  }

  .products-section {
    break-inside: avoid;
  }
}

</style>