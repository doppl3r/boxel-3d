<script setup>
  import { nextTick, onMounted, onUnmounted, ref } from 'vue';

  const menu = ref();
  const items = ref([{ text: 'Cancel', icon: 'cancel' }]);
  const props = defineProps({ game: Object });
  const position = ref({ left: '0px', top: '0px' });
  const isVisible = ref(false);
  const isActive = ref(false);

  function onClick(e) {
    e.preventDefault();
    // Update menu visibility
    if (e.button == 2) {
      isVisible.value = true;
      updatePosition(e);
    }
    else {
      // Close menu if not active
      if (isActive.value == false) {
        isVisible.value = false;
      }
    }
  }

  function select(item) {
    if (item.callback) item.callback();
    isVisible.value = false;
  }

  async function updatePosition(e) {
    await nextTick();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const width = menu.value.offsetWidth;
    const height = menu.value.offsetHeight;
    let left = e.clientX;
    let top = e.clientY;

    // Resolve offscreen position
    if (left + width > screenWidth) left = screenWidth - width;
    if (top + height > screenHeight) top = screenHeight - height;

    // Assign CSS style rules
    position.value.left = left + 'px';
    position.value.top = top + 'px';
  }

  function onContextMenu(e) {
    e.preventDefault();
    
    // Ex: document.dispatchEvent(new CustomEvent('contextmenu', { detail: [] }));
    if (e.detail) items.value = e.detail;
  }
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    // Add event listener
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('pointerup', onClick);
  });

  onUnmounted(function() {
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('pointerup', onClick);
  });
</script>

<template>
  <transition name="fade">
    <ul class="menu" ref="menu" v-show="isVisible" :style="position" @mouseover="isActive = true" @mouseleave="isActive = false">
      <li class="item" v-for="item in items" @click="select(item)" title="{{ item.text }}">
        <span class="material-symbols-rounded" v-if="item.icon">{{ item.icon }}</span>
        {{ item.text }}
      </li>
    </ul>
  </transition>
</template>

<style lang="scss" scoped>
  .fade-enter-active {
    animation: fade-in 0.15s;
  }
  .fade-leave-active {
    animation: fade-in 0.15s reverse;
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(1em); }
    100% { opacity: 1; transform: translateY(0em); }
  }

  .menu {
    border-radius: 0.5em;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    box-shadow: 0 0.25em 0 #000000;
    padding: 0.5em;
    position: fixed;
    left: 3.25em;
    margin: 0;
    top: 1em;
    transform: translateY(0em);
    width: 10em;
    
    .item {
      align-items: center;
      border-radius: 0.25em;
      cursor: pointer;
      display: flex;
      font-size: 1em;
      gap: 0.25em;
      line-height: 1.5em;
      padding: 0 0.25em;

      &:hover {
        background-color: #FFA217;
      }

      .material-symbols-rounded {
        font-size: 1em;
      }
    }
  }
</style>