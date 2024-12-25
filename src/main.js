import { createApp } from 'vue'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFacebookF, faInstagram, faLine } from '@fortawesome/free-brands-svg-icons'

// 直接定義 store
const store = createStore({
    state: {
        permissions: 0,
        token: localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refreshToken') || ''
    },
    mutations: {
        SET_PERMISSIONS(state, permissions) {
            state.permissions = parseInt(permissions)
        },
        SET_TOKEN(state, { accessToken, refreshToken }) {
            state.token = accessToken
            state.refreshToken = refreshToken
            localStorage.setItem('token', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
        },
        CLEAR_AUTH(state) {
            state.permissions = 0
            state.token = ''
            state.refreshToken = ''
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
        }
    },
    actions: {
        loginSuccess({ commit }, response) {
            // 直接使用參數，不需要 response.data
            const { permissions, accessToken, refreshToken } = response
            commit('SET_PERMISSIONS', permissions)
            commit('SET_TOKEN', { accessToken, refreshToken })
        },
        logout({ commit }) {
            commit('CLEAR_AUTH')
        }
    }
})

library.add(faFacebookF, faInstagram, faLine)

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(store)
app.use(ElementPlus)
app.use(router)
app.mount('#app')