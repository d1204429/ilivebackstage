<template>
  <div class="orders-container">
    <h2>訂單管理</h2>
    <el-card class="orders-card">
      <!-- 搜尋區域 -->
      <div class="search-area">
        <el-form :inline="true">
          <el-form-item label="訂單狀態">
            <el-select v-model="searchForm.status" placeholder="請選擇">
              <el-option label="未付款" value="1" />
              <el-option label="已付款" value="3" />
              <el-option label="已取消" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="訂單編號">
            <el-input v-model="searchForm.orderNo" placeholder="請輸入訂單編號" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜尋</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 訂單列表 -->
      <el-table :data="orderList" style="width: 100%">
        <el-table-column prop="orderNo" label="訂單編號" />
        <el-table-column prop="createTime" label="建立時間" />
        <el-table-column prop="status" label="狀態">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金額" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleDetail(scope.row)">
              詳情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination">
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 搜尋表單
const searchForm = ref({
  status: '',
  orderNo: ''
})

// 訂單列表數據
const orderList = ref([
  {
    orderNo: 'ORD2024001',
    createTime: '2024-01-01 10:00:00',
    status: '1',
    amount: 1000
  },
  // 更多測試數據...
])

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 狀態相關方法
const getStatusType = (status) => {
  const map = {
    '1': 'warning',
    '3': 'success',
    '4': 'info'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    '1': '未付款',
    '3': '已付款',
    '4': '已取消'
  }
  return map[status]
}

// 處理方法
const handleSearch = () => {
  console.log('搜尋條件：', searchForm.value)
}

const handleDetail = (row) => {
  console.log('查看詳情：', row)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加載數據
}
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.orders-card {
  margin-top: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>