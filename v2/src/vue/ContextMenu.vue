<script setup>
  import { nextTick, ref, watch } from 'vue';

  const props = defineProps({
    event: {
      type: Object,
      default: {
        clientX: 0,
        clientY: 0,
      }
    },
    actions: {
      type: Array,
      default: []
    }
  });
  const style = ref({ animationDuration: '0.15s', left: '0px', top: '0px' });
  const isVisible = ref(false);
  const menu = ref();

  function select(e, action) {
    if (action.callback) action.callback(e);
    isVisible.value = false;
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
    isVisible.value = true;
    updatePosition(props.event);
  });
</script>

<template>
  <div class="contextmenu" v-show="isVisible">
    <div class="background" @click="isVisible = false" @contextmenu.prevent="isVisible = false"></div>
    <Transition name="fade">
      <ul ref="menu" :style="style" v-if="isVisible">
        <li v-for="action in props.actions">
          <button @click.prevent="select($event, action)">
            <span class="material-symbols-rounded" v-if="action.icon">{{ action.icon }}</span>
            {{ action.text }}
          </button>
        </li>
      </ul>
    </Transition>
  </div>
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

  .contextmenu {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    transform: translateY(0em);
    width: 100%;

    .background {
      height: inherit;
      left: inherit;
      position: relative;
      top: inherit;
      width: inherit;
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
    
          &:hover {
            background-color: #FFA217;
          }
        }
      }
    }
  }
</style>