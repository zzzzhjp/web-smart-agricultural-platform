<template>
    <div class="header-container">
        <div class="header-title">
            {{ props.title }}
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title: string
    }>(),
    {
        title: ''
    }
)
</script>

<style scoped>
.header-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4.7vw;
  background-image: url('@/assets/images/header_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.header-title {
  width: max-content;
  margin: 0 auto;
  font-size: 2vw;
  letter-spacing: 0.2vw;
  color: #ededed;
}
</style>