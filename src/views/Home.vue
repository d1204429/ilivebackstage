<template>
  <div class="home-container">
    <div class="dashboard-grid">
      <!-- 管理者權限模組 -->
      <div v-if="checkModulePermission('1')" class="module-section">
        <div class="module-card" :class="{ 'active': activeModule === '1' }" @click="toggleModule('1')">
          <el-icon size="80" color="#4169E1"><User /></el-icon>
          <h3>管理者權限</h3>
          <transition name="slide-fade">
            <el-menu class="module-menu" v-show="activeModule === '1'"
                     :default-active="activeMenuItem" @select="handleSelect"
                     router= true >
              <el-menu-item v-if="checkItemPermission('1', '1-1')" index="1-1" route= "/account-manager">權限設定</el-menu-item>
              <el-menu-item v-if="checkItemPermission('1', '1-2')" index="1-2">角色管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('1', '1-3')" index="1-3">帳號啟用</el-menu-item>
            </el-menu>
          </transition>
        </div>
      </div>

      <!-- 商品管理模組 -->
      <div v-if="checkModulePermission('2')" class="module-section">
        <div class="module-card" :class="{ 'active': activeModule === '2' }" @click="toggleModule('2')">
          <el-icon size="80" color="#2E8B57"><Box /></el-icon>
          <h3>商品管理</h3>
          <transition name="slide-fade">
            <el-menu class="module-menu" v-show="activeModule === '2'"
                     :default-active="activeMenuItem" @select="handleSelect">
              <el-menu-item v-if="checkItemPermission('2', '2-1')" index="2-1">新增商品</el-menu-item>
              <el-menu-item v-if="checkItemPermission('2', '2-2')" index="2-2">商品上架/下架</el-menu-item>
              <el-menu-item v-if="checkItemPermission('2', '2-3')" index="2-3">庫存管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('2', '2-4')" index="2-4">分類管理</el-menu-item>
            </el-menu>
          </transition>
        </div>
      </div>

      <!-- 訂單管理模組 -->
      <div v-if="checkModulePermission('3')" class="module-section">
        <div class="module-card" :class="{ 'active': activeModule === '3' }" @click="toggleModule('3')">
          <el-icon size="80" color="#FFA500"><Document /></el-icon>
          <h3>訂單管理</h3>
          <transition name="slide-fade">
            <el-menu class="module-menu" v-show="activeModule === '3'"
                     :default-active="activeMenuItem" @select="handleSelect">
              <el-menu-item v-if="checkItemPermission('3', '3-1')" index="3-1">訂單處理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('3', '3-2')" index="3-2">送貨管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('3', '3-3')" index="3-3">退換貨管理</el-menu-item>
            </el-menu>
          </transition>
        </div>
      </div>

      <!-- 促銷活動管理模組 -->
      <div v-if="checkModulePermission('4')" class="module-section">
        <div class="module-card" :class="{ 'active': activeModule === '4' }" @click="toggleModule('4')">
          <el-icon size="80" color="#FF6B6B"><ShoppingBag /></el-icon>
          <h3>促銷活動管理</h3>
          <transition name="slide-fade">
            <el-menu class="module-menu" v-show="activeModule === '4'"
                     :default-active="activeMenuItem" @select="handleSelect">
              <el-menu-item v-if="checkItemPermission('4', '4-1')" index="4-1">新增促銷活動</el-menu-item>
              <el-menu-item v-if="checkItemPermission('4', '4-2')" index="4-2">編輯促銷活動</el-menu-item>
              <el-menu-item v-if="checkItemPermission('4', '4-3')" index="4-3">查看促銷活動</el-menu-item>
              <el-menu-item v-if="checkItemPermission('4', '4-4')" index="4-4">首頁推送清單</el-menu-item>
            </el-menu>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured, onMounted } from 'vue'
import { User, Box, Document, ShoppingBag } from '@element-plus/icons-vue'
import { MODULE_PERMISSIONS, hasPermission } from '@/utils/permissions'
import { useStore } from 'vuex'

const store = useStore()
const activeModule = ref('')
const activeMenuItem = ref('')

// 從 store 獲取權限
const userPermissions = computed(() => {
  console.log('Current permissions:', store.state.permissions)
  return store.state.permissions
})

// 檢查模組權限
const checkModulePermission = (moduleId) => {
  console.log(`Checking module ${moduleId}:`);
  console.log('User permissions:', userPermissions.value);

  const moduleConfig = MODULE_PERMISSIONS[moduleId];
  if (!moduleConfig) {
    console.log('Module config not found');
    return false;
  }

  console.log('Required module permission:', moduleConfig.module);
  const result = hasPermission(userPermissions.value, moduleConfig.module);
  console.log('Permission check result:', result);

  return result;
}

// 檢查子項目權限
const checkItemPermission = (moduleId, itemId) => {
  const moduleConfig = MODULE_PERMISSIONS[moduleId]
  if (!moduleConfig?.items[itemId]) return false
  return hasPermission(userPermissions.value, moduleConfig.items[itemId])
}

// 切換模組展開/收起
const toggleModule = (moduleId) => {
  if (!checkModulePermission(moduleId)) return
  if (activeModule.value === moduleId) {
    activeModule.value = ''
    activeMenuItem.value = ''
  } else {
    activeModule.value = moduleId
    activeMenuItem.value = ''
  }
}

// 選擇子項目
const handleSelect = (index) => {
  const [moduleId] = index.split('-')
  if (!checkItemPermission(moduleId, index)) return
  if (activeMenuItem.value === index) {
    activeMenuItem.value = ''
  } else {
    activeMenuItem.value = index
  }
  event.stopPropagation()
}

// 錯誤捕獲
onErrorCaptured((err, instance, info) => {
  console.error('Error in Home component:', err)
  console.log('Error instance:', instance)
  console.log('Error info:', info)
  return false
})

// 組件掛載時檢查
onMounted(() => {
  console.log('Home mounted, permissions:', userPermissions.value)
  console.log('MODULE_PERMISSIONS:', MODULE_PERMISSIONS)
})
</script>

<style scoped>
.home-container {
  background-color: #FFF8E7;
  min-height: calc(100vh - 250px);
  padding: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
}

@media screen and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.module-card {
  background: #FEFAE0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.5s ease;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px 0 rgba(0,0,0,0.15);
}

.module-card h3 {
  margin: 15px 0;
  color: #333;
  font-size: 40px;
}

.module-menu {
  border: none;
  margin-top: 15px;
  background-color: #FEFAE0;
}

.module-menu .el-menu-item {
  justify-content: center;
  height: 40px;
  line-height: 40px;
  transition: all 0.5s ease;
  font-size: 30px;
  background-color: #FEFAE0;
  margin-bottom: 10px;
}

.module-menu .el-menu-item:hover {
  background-color: #BBE9FF;
}

.el-menu-item.is-active {
  color: #4169E1 !important;
}

.el-menu-item {
  font-size: 14px;
}

/* Transition animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>