<template>
  <div class="safe-email-wrapper">
    <el-input
        v-model="emailValue"
        v-bind="$attrs"
        :class="{ 'is-error': errorMessage }"
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

const emailValue = ref(props.modelValue)
const { validate, errorMessage } = useInputValidation({
  required: true,
  email: true,
  message: '請輸入有效的電子郵件地址'
})

const handleInput = (value) => {
  const cleanedValue = cleanInput(value)
  emailValue.value = cleanedValue
  emit('update:modelValue', cleanedValue)
}

const handleBlur = () => {
  validate(emailValue.value)
  emit('validated', !errorMessage.value)
}

watch(() => props.modelValue, (newValue) => {
  emailValue.value = newValue
})
</script>