<script setup>
  import { nextTick, onMounted, onUnmounted, ref } from 'vue';

  const menu = ref();
  const actions = ref([{ text: 'Cancel', icon: 'cancel' }]);
  const props = defineProps({ game: Object });
  const style = ref({ animationDuration: '0.15s', left: '0px', top: '0px' })
  const isVisible = ref(false);

  function showContextMenu(e) {
    e.preventDefault();
    isVisible.value = true;
    updatePosition(e);
    
    // Ex: document.dispatchEvent(new CustomEvent('contextmenu', { detail: [] }));
    if (e.detail) actions.value = e.detail;
  }

  function closeContextMenu(e) {
    e.preventDefault();
    isVisible.value = false;
  }

  function select(e, action) {
    if (action.callback) action.callback(e);
    closeContextMenu(e);
  }

  async function updatePosition(e) {
    // Wait for DOM element to render
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
    style.value.left = left + 'px';
    style.value.top = top + 'px';
  }
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    // Add event listener
    document.addEventListener('contextmenu', showContextMenu);
    document.addEventListener('pointerup', closeContextMenu);
  });

  onUnmounted(function() {
    document.removeEventListener('contextmenu', showContextMenu);
    document.removeEventListener('pointerup', closeContextMenu);
  });
</script>

<template>
  <transition name="fade">
    <ul ref="menu" v-show="isVisible" :style="style">
      <li v-for="action in actions">
        <button @click.prevent="select($event, action)">
          <span class="material-symbols-rounded" v-if="action.icon">{{ action.icon }}</span>
          {{ action.text }}
        </button>
      </li>
    </ul>
  </transition>
</template>

<style lang="scss" scoped>
  .fade-enter-active {
    animation-name: fade-in;
  }
  .fade-leave-active {
    animation-name: fade-in;
    animation-direction: reverse;
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(1em); }
    100% { opacity: 1; transform: translateY(0em); }
  }

  ul {
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

    li {
      list-style: none;

      button {
        align-items: center;
        background-color: transparent;
        border-radius: 0.25em;
        border-width: 0;
        cursor: pointer;
        display: flex;
        font-family: inherit;
        font-size: 1em;
        gap: 0.25em;
        line-height: 1.5em;
        padding: 0 0.25em;
        width: 100%;
  
        &:hover {
          background-color: #FFA217;
        }
  
        .material-symbols-rounded {
          font-size: 1em;
        }
      }
    }
  }
</style>