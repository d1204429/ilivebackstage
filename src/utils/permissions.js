// utils/permissions.js

export const PERMISSION_BITS = {
    MANAGE_USERS: 1,      // 用戶管理
    MANAGE_PRODUCTS: 2,   // 商品管理
    MANAGE_ORDERS: 4,     // 訂單管理
    MANAGE_PROMOTIONS: 8, // 促銷管理
    ACTIVATE_ACCOUNTS: 16,// 帳號啟用
    VIEW_DASHBOARD: 32,   // 查看儀表板
    MANAGE_DELIVERY: 64   // 送貨管理
}

export const MODULE_PERMISSIONS = {
    '1': {
        module: '32 | 16',  // VIEW_DASHBOARD | ACTIVATE_ACCOUNTS
        items: {
            '1-1': '127',   // 僅超級管理員
            '1-2': '127',   // 僅超級管理員
            '1-3': '126 | 42 | 34 | 36 | 96'  // 授權管理員、一般管理員、庫存管理員、訂單管理員、配送管理員
        }
    },
    '2': {
        module: '32 | 2',  // VIEW_DASHBOARD | MANAGE_PRODUCTS
        items: {
            '2-1': '34',  // 庫存管理員
            '2-2': '42',  // 一般管理員
            '2-3': '34',  // 庫存管理員
            '2-4': '34'   // 庫存管理員
        }
    },
    '3': {
        module: '32 | 4 | 64',  // VIEW_DASHBOARD | MANAGE_ORDERS | MANAGE_DELIVERY
        items: {
            '3-1': '36',  // 訂單管理員
            '3-2': '96',  // 配送管理員
            '3-3': '36'   // 訂單管理員
        }
    },
    '4': {
        module: '32 | 8',  // VIEW_DASHBOARD | MANAGE_PROMOTIONS
        items: {
            '4-1': '42',  // 一般管理員
            '4-2': '42',  // 一般管理員
            '4-3': '42',  // 一般管理員
            '4-4': '42'   // 一般管理員
        }
    }
}

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    GENERAL_ADMIN: 'GENERAL_ADMIN',
    STOCK_ADMIN: 'STOCK_ADMIN',
    ORDER_ADMIN: 'ORDER_ADMIN',
    DELIVERY_ADMIN: 'DELIVERY_ADMIN',
    MANAGE_GENERAL_ADMIN: 'MANAGE_GENERAL_ADMIN'
}

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: 127,       // 1+2+4+8+16+32+64 全部權限
    [ROLES.GENERAL_ADMIN]: 42,     // 32+8+2 儀表板+促銷管理+商品管理
    [ROLES.STOCK_ADMIN]: 34,       // 32+2 儀表板+商品管理
    [ROLES.ORDER_ADMIN]: 36,       // 32+4 儀表板+訂單管理
    [ROLES.DELIVERY_ADMIN]: 96,    // 32+64 儀表板+送貨管理
    [ROLES.MANAGE_GENERAL_ADMIN]: 126 // 64+32+2+4+8+16 除權限設定和角色管理外的所有功能
}

export const hasPermission = (userPermissions, requiredPermissions) => {
    // 超級管理員特判
    if (userPermissions === 127) return true;

    // 轉換為數字陣列
    const permissionArray = String(requiredPermissions).split('|').map(p => parseInt(p.trim()));

    // 檢查用戶是否擁有任一所需權限
    return permissionArray.some(permission =>
        (userPermissions & permission) === permission
    );
}

// store 配置
export const authStore = {
    state: {
        permissions: 0,
        token: localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refreshToken') || ''
    },

    mutations: {
        SET_PERMISSIONS(state, permissions) {
            state.permissions = permissions
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
            console.log('Login response:', response)
            const { permissions, accessToken, refreshToken } = response.data
            console.log('Setting permissions:', permissions)
            commit('SET_PERMISSIONS', parseInt(permissions))
            commit('SET_TOKEN', { accessToken, refreshToken })
        },
        logout({ commit }) {
            commit('CLEAR_AUTH')
        }
    }
}