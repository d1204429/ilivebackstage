<template>
  <el-container class="layout-container">
    <!-- 頂部標題欄 -->
    <el-header class="header">
      <div class="header-left">
        Hi! 管理員，您好
      </div>
      <div class="header-right">
        <el-button plain @click="handleLogout">登出</el-button>
      </div>
    </el-header>

    <!-- 主要內容區，用於顯示各個頁面 -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- 頁尾 -->
    <TheFooter />
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TheFooter from './TheFooter.vue' // 引入頁尾組件

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('permissions')
  ElMessage.success('已登出')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column; /* 確保 footer 貼底 */
  background-color: #FFF8E7;
}

.header {
  background-color: #E9EDC9;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.main-content {
  flex: 1; /* 擴展內容區以填滿剩餘空間 */
  padding: 20px;
}
</style>
