<template>
  <Transition name="slide-fade">
    <div 
      v-if="show" 
      class="error-notification-wrapper"
      @click.self="handleClose"
    >
      <div 
        class="error-notification"
        :class="{ expanded: isHovered }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="error-content">
          <div class="error-text">{{ message }}</div>
        </div>
        <div class="error-footer">
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div 
          class="progress-bar" 
          :style="{ animationPlayState: isHovered ? 'paused' : 'running' }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const isHovered = ref(false)
let timer: number | null = null

const handleMouseEnter = () => {
  isHovered.value = true
  stopTimer()
}

const handleMouseLeave = () => {
  isHovered.value = false
  startTimer()
}

const handleClose = () => {
  isHovered.value = false
  emit('close')
}

const startTimer = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    handleClose()
  }, 5000)
}

const stopTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 监听 show 的变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    startTimer()
  } else {
    stopTimer()
  }
})
</script>

<style scoped>
.error-notification-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 20px;
  pointer-events: none;
  z-index: 9999;
}

.error-notification {
  position: relative;
  background: #8B0000;
  color: white;
  padding: 12px 15px;
  border-radius: 4px;
  width: 300px;
  max-height: 60px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: max-height 0.3s ease;
  pointer-events: auto;
}

.error-notification.expanded {
  max-height: 200px;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 30px;
}

.error-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin: 0;
}

.error-notification.expanded .error-text {
  white-space: normal;
  overflow: visible;
}

.error-footer {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  animation: progress 5s linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0; }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style> 