import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api/v1',
    timeout: 5000,
    withCredentials: true
})

// 請求攔截器
request.interceptors.request.use(
    config => {
        console.log('Request Config:', config)  // 添加請求日誌
        config.headers['Content-Type'] = 'application/json'
        return config
    },
    error => {
        console.log('Request Error:', error)  // 添加錯誤日誌
        return Promise.reject(error)
    }
)

// 響應攔截器
request.interceptors.response.use(
    response => {
        console.log('Response:', response)
        return response
    },
    error => {
        console.log('Response Error:', {
            error,
            response: error.response,
            data: error.response?.data
        })

        const message = error.response?.data?.message ||
            error.message ||
            '未知錯誤'

        ElMessage.error(message)
        return Promise.reject(error)
    }
)

export default request