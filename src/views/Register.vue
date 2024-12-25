//@ /views/Register.vue
<template>

  <div class="register-container">
    <div class="image-text animate__animated animate__flip">
      <p>iLive後台註冊</p>
    </div>
    <el-card class="register-card">
      <div class="register-title">
        <h2>註冊帳號</h2>
      </div>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
      >
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="請輸入帳號"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="請輸入密碼"
              prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="請輸入電子郵件"
              prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              :loading="loading"
              type="primary"
              class="register-button"
              @click="handleRegister"
          >
            註冊
          </el-button>
        </el-form-item>

        <div class="text-center">
          <router-link to="/login" class="login-link">
            返回登入
          </router-link>
        </div>
      </el-form>

      <!-- 註冊規則提示 -->
      <div class="register-tips">
        <p>帳號格式：i + 7碼數字</p>
        <p>密碼規則：8-12碼，須包含大小寫字母及特殊符號(!@#$%&)</p>
        <p>信箱格式：請輸入有效的電子郵件地址</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import { cleanInput } from '@/utils/security'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref(null)

const registerForm = ref({
  username: '',
  password: '',
  email: ''
})

const registerRules = {
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { pattern: /^i\d{7}$/, message: '帳號格式：i + 7碼數字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 8, max: 12, message: '密碼長度為8-12碼', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%&])[A-Za-z\d!@#$%&]{8,12}$/,
      message: '密碼須包含大小寫字母及特殊符號(!@#$%&)',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件地址', trigger: 'blur' }
  ]
}

const handleRegister = () => {
  if (!registerFormRef.value) return

  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const registerData = {
          username: cleanInput(registerForm.value.username),
          passwordHash: cleanInput(registerForm.value.password),
          email: cleanInput(registerForm.value.email)
        }

        console.log('註冊資料:', registerData)

        await register(registerData)

        ElMessage.success('註冊成功，請等待管理員啟用帳號')
        router.push('/login')
      } catch (error) {
        console.error('註冊錯誤:', error)
        ElMessage.error(error.response?.data?.message || '註冊失敗')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 248, 231, 0.8), rgba(240, 240, 240, 0.8));
  backdrop-filter: blur(10px); /* 背景模糊效果 */
}

.register-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.85); /* 半透明背景 */
  border-radius: 15px; /* 圓角 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* 立體陰影效果 */
  padding: 20px 30px;
}

.el-form {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.85)); /* 柔和的漸層背景 */
  border-radius: 12px; /* 更圓潤的邊角 */
  padding: 20px; /* 增加內部空間 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 柔和的陰影效果 */
  border: 1px solid rgba(230, 230, 230, 0.8); /* 淡灰色邊框 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 增加互動效果 */
}

el-form:hover {
  transform: translateY(-5px); /* 懸停時的浮動效果 */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* 懸停時陰影變強 */
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
}

.register-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: bold;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #409EFF;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.register-button:hover {
  background-color: #66b1ff;
  transform: scale(1.05); /* 按鈕微放大效果 */
}

.text-center {
  text-align: center;
  margin-top: 10px;
}

.login-link {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
}

.login-link:hover {
  color: #66b1ff;
}

.register-tips {
  margin-top: 20px;
  padding: 10px;
  background-color: rgba(244, 244, 245, 0.9); /* 更柔和的透明背景 */
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* 輕微陰影 */
}

.register-tips p {
  margin: 5px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.image-text {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  margin-right: 100px;
}

.image-text p {
  font-size: 9em;
  background-image: url("https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmlld3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60");
  background-size: cover;
  background-clip: text;
  background-position: center center;
  color: transparent;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2); /* 增加立體感 */
}
</style>
/style>