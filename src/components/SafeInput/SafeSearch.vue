<template>
  <div class="safe-search-wrapper">
    <el-input
        v-model="searchValue"
        v-bind="$attrs"
        :class="{ 'is-error': errorMessage }"
        clearable
        @input="handleInput"
        @clear="handleClear"
        @blur="handleBlur"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useInputValidation } from './composables/useInputValidation'
import { cleanInput } from '@/utils/security'
import debounce from 'lodash/debounce'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  debounceTime: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchValue = ref(props.modelValue)
const { validate, errorMessage } = useInputValidation({
  maxLength: 50,
  message: '搜尋內容不能超過50個字符'
})

const debouncedEmit = debounce((value) => {
  emit('search', value)
}, props.debounceTime)

const handleInput = (value) => {
  const cleanedValue = cleanInput(value)
  searchValue.value = cleanedValue
  emit('update:modelValue', cleanedValue)
  if (cleanedValue && validate(cleanedValue)) {
    debouncedEmit(cleanedValue)
  }
}

const handleClear = () => {
  searchValue.value = ''
  errorMessage.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

const handleBlur = () => {
  validate(searchValue.value)
}

watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})
</script>

<style scoped>
.safe-search-wrapper {
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