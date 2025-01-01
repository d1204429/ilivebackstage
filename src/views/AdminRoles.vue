# AdminRoles.vue

<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="admin-roles">
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <table v-else>
      <thead>
      <tr>
        <th @click="sort('adminId')" class="sortable">
          ID
          <span v-if="sortKey === 'adminId'" class="sort-icon">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
        </th>
        <th>帳號</th>
        <th>信箱</th>
        <th>建立時間</th>
        <th>更新時間</th>
        <th>角色</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(roles, adminId) in sortedAdminRoles" :key="adminId">
        <td>{{ adminId }}</td>
        <td>{{ adminInfo[adminId]?.username || '-' }}</td>
        <td>{{ adminInfo[adminId]?.email || '-' }}</td>
        <td>{{ formatDateTime(adminInfo[adminId]?.createdAt) }}</td>
        <td>{{ formatDateTime(adminInfo[adminId]?.updatedAt) }}</td>
        <td>
          <div class="role-tags">
              <span
                  v-for="role in roles"
                  :key="role.roleId"
                  class="role-tag"
              >
                {{ formatRoleName(role.roleName) }}
                <button
                    @click="removeRole(adminId, role.roleId)"
                    class="btn-remove-role"
                >
                  ×
                </button>
              </span>
            <span v-if="roles.length === 0" class="no-role">
                未設定角色
              </span>
          </div>
        </td>
        <td>
          <div class="action-wrapper">
            <select
                v-model="selectedRoleId[adminId]"
                class="role-select"
            >
              <option
                  v-for="role in availableRoles"
                  :key="role.roleId"
                  :value="role.roleId"
              >
                {{ formatRoleName(role.roleName) }}
              </option>
            </select>
            <button
                @click="addRole(adminId)"
                class="btn btn-add"
                :disabled="!selectedRoleId[adminId]"
            >
              新增角色
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const adminRoles = ref({})
    const adminInfo = ref({})
    const loading = ref(false)
    const error = ref(null)
    const sortKey = ref('adminId')
    const sortOrder = ref('asc')
    const selectedRoleId = ref({})

    const availableRoles = [
      // { roleId: 1, roleName: 'SUPER_ADMIN' },
      { roleId: 2, roleName: 'GENERAL_ADMIN' },
      { roleId: 3, roleName: 'STOCK_ADMIN' },
      { roleId: 4, roleName: 'ORDER_ADMIN' },
      { roleId: 5, roleName: 'DELIVERY_ADMIN' },
      { roleId: 6, roleName: 'MANAGE_GENERAL_ADMIN' }
    ]

    const sortedAdminRoles = computed(() => {
      const adminIds = Object.keys(adminRoles.value)
      const sorted = adminIds.sort((a, b) => {
        const modifier = sortOrder.value === 'desc' ? -1 : 1
        return (Number(a) - Number(b)) * modifier
      })

      return sorted.reduce((acc, id) => {
        acc[id] = adminRoles.value[id]
        return acc
      }, {})
    })

    const fetchAdminRoles = async () => {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        const [rolesResponse, accountsResponse] = await Promise.all([
          axios.get('/api/v1/admin/accounts/roles', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/v1/admin/accounts', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        adminRoles.value = rolesResponse.data
        adminInfo.value = accountsResponse.data.reduce((acc, account) => {
          acc[account.adminId] = account
          return acc
        }, {})
      } catch (err) {
        error.value = err.response?.data?.message || '獲取資料失敗'
      } finally {
        loading.value = false
      }
    }

    const addRole = async (adminId) => {
      const roleId = selectedRoleId.value[adminId]
      if (!roleId) return

      try {
        const token = localStorage.getItem('token')
        await axios.post(
            `/api/v1/admin/accounts/${adminId}/roles/${roleId}`,
            null,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        await fetchAdminRoles()
        selectedRoleId.value[adminId] = ''  // 重置選擇
      } catch (err) {
        error.value = err.response?.data?.message || '新增角色失敗'
      }
    }

    const removeRole = async (adminId, roleId) => {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(
            `/api/v1/admin/accounts/${adminId}/roles/${roleId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        await fetchAdminRoles()
      } catch (err) {
        error.value = err.response?.data?.message || '移除角色失敗'
      }
    }

    const hasRole = (adminId, roleId) => {
      return adminRoles.value[adminId]?.some(role => role.roleId === roleId)
    }

    const formatRoleName = (roleName) => {
      const roleNameMap = {
        'SUPER_ADMIN': '超級管理員',
        'GENERAL_ADMIN': '商品管理人員',
        'STOCK_ADMIN': '庫存管理人員',
        'ORDER_ADMIN': '訂單管理人員',
        'DELIVERY_ADMIN': '物流管理人員',
        'MANAGE_GENERAL_ADMIN': '經理'
      }
      return roleNameMap[roleName] || roleName
    }

    const sort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${date.getHours() >= 12 ? '下午' : '上午'}${String(date.getHours() % 12 || 12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    }

    // 初始化
    fetchAdminRoles()

    return {
      adminRoles,
      loading,
      error,
      sortKey,
      sortOrder,
      selectedRoleId,
      availableRoles,
      sortedAdminRoles,
      formatRoleName,
      addRole,
      removeRole,
      hasRole,
      sort,
      adminInfo,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.admin-roles {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
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

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-remove-role {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 0 4px;
  font-size: 1.2em;
  line-height: 1;
}

.btn-remove-role:hover {
  color: #f44336;
}

.no-role {
  color: #757575;
  font-style: italic;
}

.action-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add {
  background-color: #2196f3;
  color: white;
}

.error {
  color: #f44336;
  padding: 12px;
  margin: 12px 0;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>