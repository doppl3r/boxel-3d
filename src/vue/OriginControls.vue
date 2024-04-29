<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  var keys = ref({});
  var isVisible = ref(false);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('setMode', setMode);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('setMode', setMode);
  }

  function keydown(e) {
    keys.value[e.code] = true;
  }

  function keyup(e) {
    keys.value[e.code] = false;
  }

  function triggerKeyEvent(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { 'code': key }));
    keys.value[key] = (type == 'keydown');
  }

  function setMode(e) {
    var mode = e.detail;
    if (mode == 'control') isVisible.value = true;
    else isVisible.value = false;
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="controls" v-if="isVisible">
    <div class="wasd">
      <div class="row">
        <div class="key fade-in" :class="{ 'active': (keys['KeyA'] || keys['ArrowLeft']) }" @pointerdown="triggerKeyEvent('keydown', 'KeyA')" @pointerup="triggerKeyEvent('keyup', 'KeyA')" @pointerout="triggerKeyEvent('keyup', 'KeyA')">
          <span class="material-symbols-rounded">arrow_back</span>
        </div>
        <div class="key fade-in" :class="{ 'active': (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) }" @pointerdown="triggerKeyEvent('keydown', 'KeyW')" @pointerup="triggerKeyEvent('keyup', 'KeyW')" @pointerout="triggerKeyEvent('keyup', 'KeyW')">
          <span class="material-symbols-rounded">arrow_upward</span>
        </div>
        <div class="key fade-in" :class="{ 'active': (keys['KeyD'] || keys['ArrowRight']) }" @pointerdown="triggerKeyEvent('keydown', 'KeyD')" @pointerup="triggerKeyEvent('keyup', 'KeyD')" @pointerout="triggerKeyEvent('keyup', 'KeyD')">
          <span class="material-symbols-rounded">arrow_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>