<template>
  <div class="home-container">
    <div class="dashboard-grid">
      <!-- 管理者權限模組 -->
      <div v-if="checkModulePermission('1')" class="module-section">
        <div class="module-card" :class="{ 'active': activeModule === '1' }" @click="toggleModule('1')">
          <el-icon size="80" color="#4169E1"><User /></el-icon>
          <h3>管理功能</h3>
          <transition name="slide-fade">
            <el-menu class="module-menu" v-show="activeModule === '1'"
                     :default-active="activeMenuItem" @select="handleSelect"
                     router= true >
              <el-menu-item v-if="checkItemPermission('1', '1-3')" index="1-3" route= "/account-manager">帳號啟用</el-menu-item>
              <el-menu-item v-if="checkItemPermission('1', '1-2')" index="1-2" route= "/adminroles">角色管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('1', '1-1')" index="1-1">營業額查詢</el-menu-item>

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
                     :default-active="activeMenuItem" @select="handleSelect"
                     router= true >
              <el-menu-item v-if="checkItemPermission('2', '2-1')" index="2-1" route="/categories">商品分類管理</el-menu-item>
<!--              <el-menu-item v-if="checkItemPermission('2', '2-2')" index="2-2">商品上架/下架</el-menu-item>-->
              <el-menu-item v-if="checkItemPermission('2', '2-3')" index="2-3" route="/product">商品基本管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('2', '2-4')" index="2-4">庫存管理</el-menu-item>
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
                     :default-active="activeMenuItem" @select="handleSelect"
                     router= true >
              <el-menu-item v-if="checkItemPermission('3', '3-1')" index="3-1">訂單處理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('3', '3-2')" index="3-2">送貨管理</el-menu-item>
              <el-menu-item v-if="checkItemPermission('3', '3-3')" index="3-3">退貨管理</el-menu-item>
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
                     :default-active="activeMenuItem" @select="handleSelect"
                     router= true >
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
import { ref, computed, onMounted } from 'vue'
import { User, Box, Document, ShoppingBag } from '@element-plus/icons-vue'
import { MODULE_PERMISSIONS, hasPermission } from '@/utils/permissions'
import { useStore } from 'vuex'

const store = useStore()
const activeModule = ref('')
const activeMenuItem = ref('')

// 從 store 獲取權限
const userPermissions = computed(() => {
  console.log('當前用戶權限:', store.state.permissions)
  return store.state.permissions
})

// 檢查模組權限
const checkModulePermission = (moduleId) => {
  console.log(`檢查模組 ${moduleId} 權限:`)
  console.log('用戶權限:', userPermissions.value)

  const moduleConfig = MODULE_PERMISSIONS[moduleId]
  if (!moduleConfig) {
    console.log('找不到模組配置')
    return false
  }

  console.log('所需模組權限:', moduleConfig.module)
  const result = hasPermission(userPermissions.value, moduleConfig.module)
  console.log('權限檢查結果:', result)

  return result
}

// 檢查子項目權限
const checkItemPermission = (moduleId, itemId) => {
  console.log(`檢查項目權限: ${moduleId}-${itemId}`)
  const moduleConfig = MODULE_PERMISSIONS[moduleId]
  if (!moduleConfig?.items[itemId]) {
    console.log('找不到項目配置')
    return false
  }
  const hasAccess = hasPermission(userPermissions.value, moduleConfig.items[itemId])
  console.log('項目權限檢查:', {
    所需權限: moduleConfig.items[itemId],
    用戶權限: userPermissions.value,
    結果: hasAccess
  })
  return hasAccess
}

// 切換模組展開/收起
const toggleModule = (moduleId) => {
  console.log('嘗試切換模組:', moduleId)
  console.log('當前用戶權限:', userPermissions.value)
  const moduleConfig = MODULE_PERMISSIONS[moduleId]
  const canAccess = checkModulePermission(moduleId)
  console.log('模組設定:', moduleConfig)
  console.log('是否有權限:', canAccess)

  if (!canAccess) {
    console.log('權限檢查未通過')
    return
  }

  if (activeModule.value === moduleId) {
    activeModule.value = ''
    activeMenuItem.value = ''
    console.log('收起模組')
  } else {
    activeModule.value = moduleId
    activeMenuItem.value = ''
    console.log('展開模組')
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

// 組件掛載時檢查
onMounted(() => {
  console.log('======= 權限設定摘要 =======')
  console.log('用戶當前權限:', userPermissions.value)
  console.log('模組權限設定:')
  Object.entries(MODULE_PERMISSIONS).forEach(([key, module]) => {
    console.log(`模組 ${key}:`, {
      需求權限: module.module,
      子項目權限: module.items
    })
  })
  console.log('==========================')
})
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 250px);
  padding: 20px;
  background: rgba(255, 248, 231, 0.8);
  backdrop-filter: blur(10px);
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
  background: rgba(254, 250, 224, 0.85);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.module-card h3 {
  margin: 15px 0;
  color: #333;
  font-size: 40px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.module-menu {
  border: none;
  margin-top: 15px;
  background: rgba(254, 250, 224, 0.7);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.module-menu .el-menu-item {
  justify-content: center;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
  font-size: 30px;
  background: transparent;
  margin-bottom: 10px;
  border-radius: 8px;
}

.module-menu .el-menu-item:hover {
  background: rgba(187, 233, 255, 0.6);
  transform: translateY(-2px);
}

.el-menu-item.is-active {
  color: #4169E1 !important;
  background: rgba(65, 105, 225, 0.1);
}

.el-menu-item {
  font-size: 14px;
}

/* Transition animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>