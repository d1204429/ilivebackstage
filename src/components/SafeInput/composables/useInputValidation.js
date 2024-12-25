import { ref } from 'vue'

export const useInputValidation = (validation = {}) => {
    const errorMessage = ref('')

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
    }

    const validate = (value) => {
        errorMessage.value = ''

        if (validation.required && !value) {
            errorMessage.value = validation.message || '此欄位為必填'
            return false
        }

        if (validation.minLength && value.length < validation.minLength) {
            errorMessage.value = `最少需要 ${validation.minLength} 個字符`
            return false
        }

        if (validation.maxLength && value.length > validation.maxLength) {
            errorMessage.value = `不能超過 ${validation.maxLength} 個字符`
            return false
        }

        if (validation.pattern && !validation.pattern.test(value)) {
            errorMessage.value = validation.message || '格式不正確'
            return false
        }

        if (validation.email && !validateEmail(value)) {
            errorMessage.value = validation.message || '請輸入有效的電子郵件地址'
            return false
        }

        return true
    }

    return {
        errorMessage,
        validate
    }
}