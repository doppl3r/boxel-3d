<script setup>
  import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

  const props = defineProps({
    event: {
      default: {
        clientX: 0,
        clientY: 0,
      },
      required: true,
      type: Object
    },
    actions: {
      default: [],
      required: true,
      type: Array
    }
  });
  const duration = 150;
  const style = ref({ animationDuration: `${ duration }ms`, left: '0px', top: '0px' });
  const isVisible = ref(false);
  const isOpening = ref(false);
  const menu = ref();

  function select(e, action) {
    if (action.callback) action.callback(e);
    close();
  }

  function open(e) {
    if (isVisible.value == false) {
      isVisible.value = true;
      updatePosition(e);
    }
    else {
      // Reopen if menu is already open
      setTimeout(() => open(e), duration);
    }
  }

  function close(e) {
    // Close only if menu is not opening
    if (isOpening.value == false) {
      isVisible.value = false;
    }
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

  // Listen to prop event changes
  watch(() => props.event, () => {
    open(props.event);
  });

  // Initialize app after canvas has been mounted
  onMounted(function() {
    // Add event listener
    document.addEventListener('pointerup', close);
  });

  onUnmounted(function() {
    // Remove event listeners
    document.removeEventListener('pointerup', close);
  });
</script>

<template>
  <Transition name="fade"
    @before-enter="isOpening = true"
    @after-enter="isOpening = false"
  >
    <ul ref="menu" :style="style" v-if="isVisible">
      <li v-for="action in props.actions">
        <button @click.prevent="select($event, action)" :disabled="action.disabled">
          <span class="material-symbols-rounded" v-if="action.icon">{{ action.icon }}</span>
          {{ action.text }}
        </button>
      </li>
    </ul>
  </Transition>
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
    display: flex;
    flex-direction: column;
    gap: 0.125em;
    left: 3.25em;
    margin: 0;
    min-width: 10em;
    padding: 0.5em;
    position: fixed;
    top: 1em;
    transform: translateY(0em);

    li {
      list-style: none;
      white-space: nowrap;

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

        &[disabled] {
          pointer-events: none;
        }
  
        &:hover {
          background-color: #FFA217;
        }
      }
    }
  }
</style>