<template>
  <div class="safe-password-wrapper">
    <el-input
        v-model="passwordValue"
        type="password"
        v-bind="$attrs"
        :class="{ 'is-error': errorMessage }"
        show-password
        @input="handleInput"
        @blur="handleBlur"
    />
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useInputValidation } from './composables/useInputValidation'
import { cleanInput } from '@/utils/security'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'validated'])

const passwordValue = ref(props.modelValue)
const { validate, errorMessage } = useInputValidation({
  required: true,
  minLength: 8,
  maxLength: 12,
  pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%&])[A-Za-z\d!@#$%&]{8,12}$/,
  message: '密碼須包含大小寫字母及特殊符號(!@#$%&)'
})

const handleInput = (value) => {
  const cleanedValue = cleanInput(value)
  passwordValue.value = cleanedValue
  emit('update:modelValue', cleanedValue)
}

const handleBlur = () => {
  validate(passwordValue.value)
  emit('validated', !errorMessage.value)
}

watch(() => props.modelValue, (newValue) => {
  passwordValue.value = newValue
})
</script>