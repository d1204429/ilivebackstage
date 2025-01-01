<template>
    <router-link to="/home" class="home-btn">
        <span>回首頁</span>
      </router-link>
    <div class="admin-table">
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
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in sortedAdmins" :key="admin.adminId">
            <td>{{ admin.adminId }}</td>
            <td>{{ admin.username }}</td>
            <td>{{ admin.email }}</td>
            <td>{{ formatDate(admin.createdAt) }}</td>
            <td>{{ formatDate(admin.updatedAt) }}</td>
            <td>
              <span :class="getStatusClass(admin.status)">
                {{ getStatusText(admin.status) }}
              </span>
            </td>
            <td>
              <button 
                v-if="admin.status !== 1"
                @click="activateAccount(admin.adminId)"
                class="btn btn-activate"
              >
                啟用
              </button>
              <button 
                v-if="admin.status !== 2"
                @click="disableAccount(admin.adminId)"
                class="btn btn-disable"
              >
                註銷
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import router from '@/router'
import axios from 'axios'
  
  export default {
    data() {
      return {
        admins: [],
        loading: false,
        error: null,
        sortKey: 'adminId',

      }
    },
    computed: {
      sortedAdmins() {
        return [...this.admins].sort((a, b) => {
          let modifier = this.sortOrder === 'desc' ? -1 : 1
          if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier
          if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier
          return 0
        })
      }
    },
    async created() {
      await this.fetchAdmins()
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
      async fetchAdmins() {
        this.loading = true
        this.error = null
        try {
          const token = localStorage.getItem('token')
          const response = await axios.get('/api/v1/admin/accounts', {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.admins = response.data
        } catch (err) {
          this.error = err.response?.data?.message || '獲取管理員列表失敗'
        } finally {
          this.loading = false
        }
      },
      async activateAccount(id) {
        try {
          const token = localStorage.getItem('token')
          await axios.post(`/api/v1/admin/accounts/${id}/activate`, null, {
            headers: { Authorization: `Bearer ${token}` }
          })
          await this.fetchAdmins()
        } catch (err) {
          this.error = err.response?.data?.message || '啟用失敗'
        }
      },
      async disableAccount(id) {
        try {
          const token = localStorage.getItem('token')
          await axios.post(`/api/v1/admin/accounts/${id}/disable`, null, {
            headers: { Authorization: `Bearer ${token}` }
          })
          await this.fetchAdmins()
        } catch (err) {
          this.error = err.response?.data?.message || '註銷失敗'
        }
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleString()
      },
      getStatusText(status) {
        const statusMap = {
          0: '未啟用',
          1: '啟用中',
          2: '已停用'
        }
        return statusMap[status] || '未知'
      },
      getStatusClass(status) {
        return {
          'status-inactive': status === 0,
          'status-active': status === 1,
          'status-disabled': status === 2
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-table {
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
  
  .btn-activate {
    background-color: #4caf50;
    color: white;
  }
  
  .btn-disable {
    background-color: #f44336;
    color: white;
  }
  
  .status-inactive {
    color: #ff9800;
    background-color: #fff3e0;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .status-active {
    color: #4caf50;
    background-color: #e8f5e9;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .status-disabled {
    color: #f44336;
    background-color: #ffebee;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .error {
    color: #f44336;
    padding: 12px;
    margin: 12px 0;
    background-color: #ffebee;
    border-radius: 4px;
  }
  </style>