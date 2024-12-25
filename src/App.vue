<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<script setup>
// 如果需要處理全局狀態或邏輯，可以在這裡添加
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

#app {
  height: 100%;
}
</style>