<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 左側留空 -->
      <div class="footer-left"></div>

      <!-- 版權宣告 置中 -->
      <div class="copyright">
        <p>Copyright © {{ currentYear }} FCU. All rights reserved.</p>
      </div>

      <!-- 社群媒體連結 靠右 -->
      <div class="social-links">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://line.me" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-line"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { Share, PictureFilled, Message } from '@element-plus/icons-vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #E9EDC9;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* 三列布局：左空白、中間內容、右圖標 */
  align-items: center;
}

.footer-left {
  /* 左側占位 */
  visibility: hidden;
}

.copyright {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  padding: 0 1rem;
}

.social-links {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end; /* 靠右對齊 */
}

.social-links a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-links a:hover {
  color: #1890ff;
  transform: translateY(-2px);
}

.el-icon {
  font-size: 1.5rem; /* 增大圖標尺寸 */
}

/* 響應式設計 */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr; /* 在小屏幕上改為單列 */
    gap: 1rem;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }

  .footer-left {
    display: none; /* 在小屏幕上隱藏左側占位 */
  }
}
</style>