<template>
  <router-link to="/home" class="home-btn">
    <span>回首頁</span>
  </router-link>
  <div class="user-table">
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <table v-else>
      <thead>
      <tr>
        <th @click="sort('userId')" class="sortable">
          ID
          <span v-if="sortKey === 'userId'" class="sort-icon">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
        </th>
        <th>用戶名</th>
        <th>電子郵件</th>
        <th>姓名</th>
        <th>電話</th>
        <th>地址</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in sortedUsers" :key="user.userId">
        <td>{{ user.userId }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.fullName }}</td>
        <td>{{ user.phoneNumber }}</td>
        <td>{{ user.address }}</td>
        <td>
          <button @click="openEditModal(user)" class="btn btn-edit">
            編輯
          </button>
          <button @click="openResetPasswordModal(user)" class="btn btn-reset">
            重設密碼
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- 編輯用戶彈窗 -->
  <div v-if="showEditModal" class="modal">
    <div class="modal-content">
      <h2>編輯用戶</h2>
      <form @submit.prevent="handleEditSubmit">
        <div class="form-group">
          <label>電子郵件</label>
          <input v-model="editForm.email" type="email" required />
        </div>
        <div class="form-group">
          <label>姓名</label>
          <input v-model="editForm.fullName" type="text" required />
        </div>
        <div class="form-group">
          <label>電話</label>
          <input v-model="editForm.phoneNumber" type="tel" required />
        </div>
        <div class="form-group">
          <label>地址</label>
          <input v-model="editForm.address" type="text" required />
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-save">儲存</button>
          <button type="button" @click="closeEditModal" class="btn btn-cancel">取消</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 成功提示彈窗 -->
  <div v-if="successMessage" class="modal">
    <div class="modal-content success-modal">
      <div class="success-icon">✓</div>
      <p>{{ successMessage }}</p>
    </div>
  </div>

  <!-- 重設密碼彈窗 -->
  <div v-if="showPasswordModal" class="modal">
    <div class="modal-content">
      <h2>重設密碼</h2>
      <form @submit.prevent="handlePasswordReset">
        <div class="form-group">
          <label>新密碼</label>
          <input v-model="newPassword" type="password" required />
          <p class="password-hint">密碼需包含大小寫字母、數字，長度至少8位</p>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-save">確認</button>
          <button type="button" @click="closePasswordModal" class="btn btn-cancel">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import router from '@/router'
import axios from 'axios'

export default {
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      successMessage: null,
      sortKey: 'userId',
      sortOrder: 'asc',
      showEditModal: false,
      showPasswordModal: false,
      currentUser: null,
      editForm: {
        email: '',
        fullName: '',
        phoneNumber: '',
        address: ''
      },
      newPassword: ''
    }
  },
  computed: {
    sortedUsers() {
      return [...this.users].sort((a, b) => {
        let modifier = this.sortOrder === 'desc' ? -1 : 1
        if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier
        if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier
        return 0
      })
    }
  },
  async created() {
    await this.fetchUsers()
  },
  methods: {
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data
      } catch (err) {
        this.error = err.response?.data?.message || '獲取用戶列表失敗'
      } finally {
        this.loading = false
      }
    },
    openEditModal(user) {
      this.currentUser = user
      this.editForm = {
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        address: user.address
      }
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.currentUser = null
      this.editForm = {
        email: '',
        fullName: '',
        phoneNumber: '',
        address: ''
      }
    },
    async handleEditSubmit() {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`/api/v1/admin/users/${this.currentUser.userId}`, this.editForm, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.fetchUsers()
        this.closeEditModal()
        this.showSuccessMessage('更新用戶資料成功')
      } catch (err) {
        this.error = err.response?.data?.message || '更新用戶資料失敗'
      }
    },
    openResetPasswordModal(user) {
      this.currentUser = user
      this.showPasswordModal = true
    },
    closePasswordModal() {
      this.showPasswordModal = false
      this.currentUser = null
      this.newPassword = ''
    },
    showSuccessMessage(message) {
      this.successMessage = message
      setTimeout(() => {
        this.successMessage = null
      }, 1000)
    },

    async handlePasswordReset() {
      try {
        const token = localStorage.getItem('token')
        await axios.put(
            `/api/v1/admin/users/${this.currentUser.userId}/reset-password`,
            { newPassword: this.newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        this.closePasswordModal()
        this.showSuccessMessage('密碼重設成功')
      } catch (err) {
        this.error = err.response?.data?.message || '重設密碼失敗'
      }
    }
  }
}
</script>

<style scoped>
.user-table {
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

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 4px;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-reset {
  background-color: #FF9800;
  color: white;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
}

.error {
  color: #f44336;
  padding: 12px;
  margin: 12px 0;
  background-color: #ffebee;
  border-radius: 4px;
}

.success-modal {
  max-width: 300px;
  text-align: center;
  padding: 24px;
}

.success-icon {
  color: #4CAF50;
  font-size: 48px;
  margin-bottom: 16px;
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.password-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>