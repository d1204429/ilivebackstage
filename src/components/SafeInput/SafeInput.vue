<template>
  <div class="safe-input-wrapper">
    <el-input
        v-model="inputValue"
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
  },
  validation: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'validated'])

const inputValue = ref(props.modelValue)
const { validate, errorMessage } = useInputValidation(props.validation)

const handleInput = (value) => {
  const cleanedValue = cleanInput(value)
  inputValue.value = cleanedValue
  emit('update:modelValue', cleanedValue)
}

const handleBlur = () => {
  validate(inputValue.value)
  emit('validated', !errorMessage.value)
}

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})
</script>

<style scoped>
.safe-input-wrapper {
  position: relative;
}

.error-message {
  position: absolute;
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.is-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}
</style>
