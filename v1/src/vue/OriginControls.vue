<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  var settings = ref(app.storage.getSettings());
  var isVisible = ref(false);
  var isReversed = ref(settings.value.controls.reverse);
  var isDesktop = ref(true);
  var keys = ref({});

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('setMode', setMode);
    window.addEventListener('updateStatsVisibility', updateSettings);
    window.addEventListener('updateControls', updateControls);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('setMode', setMode);
    window.removeEventListener('updateStatsVisibility', updateSettings);
    window.removeEventListener('updateControls', updateControls);
  }

  function keydown(e) {
    // Shrink if input is trusted
    if (e.isTrusted != true) {
      isDesktop.value = false;
    }

    // Ignore events from inputs
    if (e.target.value == null) {
      keys.value[e.code] = true;
    }
  }

  function keyup(e) {
    keys.value[e.code] = false;
  }

  function triggerKeyEvent(e) {
    window.dispatchEvent(new KeyboardEvent(e.type, { 'code': e.code }));
    keys.value[e.code] = (e.type == 'keydown');
  }

  function setMode(e) {
    var mode = e.detail;
    if (mode == 'control') isVisible.value = true;
    else isVisible.value = false;
  }

  function updateSettings() {
    settings.value = app.storage.getSettings();
  }

  function updateControls() {
    updateSettings();
    isReversed.value = settings.value.controls.reverse;
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="controls" v-if="isVisible" :class="{ desktop: isDesktop, reverse: isReversed }">
    <div class="wasd">
      <div class="row">
        <div
          class="key key-up fade-in"
          :class="{ 'active': (keys['KeyW'] || keys['ArrowUp'] || keys['Space']) }"
          @touchstart.prevent="triggerKeyEvent({ type: 'keydown', code: 'KeyW' })"
          @touchend="triggerKeyEvent({ type: 'keyup', code: 'KeyW' })"
        >
          <span class="material-symbols-rounded">shift</span>
        </div>
        <div
          class="key key-left fade-in"
          :class="{ 'active': (keys['KeyA'] || keys['ArrowLeft']) }"
          @touchstart.prevent="triggerKeyEvent({ type: 'keydown', code: 'KeyA' })"
          @touchend="triggerKeyEvent({ type: 'keyup', code: 'KeyA' })"
        >
          <span class="material-symbols-rounded">fast_rewind</span>
        </div>
        <div
          class="key key-right fade-in"
          :class="{ 'active': (keys['KeyD'] || keys['ArrowRight']) }"
          @touchstart.prevent="triggerKeyEvent({ type: 'keydown', code: 'KeyD' })"
          @touchend="triggerKeyEvent({ type: 'keyup', code: 'KeyD' })"
        >
          <span class="material-symbols-rounded">fast_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>