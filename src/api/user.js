// api/user.js
import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/admin/login',
        method: 'post',
        data: {
            username: data.username,
            passwordHash: data.passwordHash
        }
    })
}

export function logout() {
    return request({
        url: '/admin/logout',
        method: 'post'
    })
}

export function register(data) {
    return request({
        url: '/admin/register',
        method: 'post',
        data: data
    })
}