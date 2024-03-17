<script setup>
  import { ref } from 'vue';

  // Initialize attributes
  var text = ref('');
  var inputs = ref([]);
  var isOpen = ref(false);
  
  // Add event listeners
	window.addEventListener('addPopup', function(e) { addPopup(e); });
	window.addEventListener('closePopup', function(e) { closePopup(e); });

  function addPopup(e) {
    // Assign values from custom event detail
    if (e.detail) {
      isOpen.value = true;
      if (e.detail.text) text.value = e.detail.text;
      if (e.detail.inputs) {
        inputs.value = e.detail.inputs;
        inputs.value.forEach(function(input) {
          // Set input event type (ex: click vs change)
          if (input.type == 'file' || input.type == 'range') input.event = 'change';
          else input.event = 'click';
        })
      }
    }
  }

  function closePopup() {
    isOpen.value = false;
  }

  function runCallback(callback, e) {
    if (callback == null) callback = closePopup;
    callback(e);
  }

  function runLastInputCallback() {
    var lastInput = inputs.value[inputs.value.length - 1];
    if (lastInput) runCallback(lastInput.callback);
  }
</script>

<template>
  <Transition name="fade">
    <div class="dialog" v-if="isOpen == true">
      <div class="background" @click="runLastInputCallback"></div>
      <div class="wrapper">
        <p v-html="text"></p>
        <div class="inputs">
          <template v-for="(input, index) of inputs">
            <label v-if="input.label" :for="'popup-' + input.type + '-' + index">{{ input.label }}</label>
            <input :class="input.class" :id="'popup-' + input.type + '-' + index" :type="input.type" :value="input.value" :min="input.min" :max="input.max" :step="input.step" :accept="input.accept" :style="input.style" v-on:[input.event]="runCallback(input.callback, $event)">
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style>
  .fade-enter-active, .fade-leave-active { transition: opacity 0.1s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>