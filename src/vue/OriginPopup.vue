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
      if (e.detail.inputs) inputs.value = e.detail.inputs;
    }
  }

  function closePopup() {
    isOpen.value = false;
  }

  function runCallback(callback, $event) {
    if (callback == null) callback = closePopup;
    callback($event);
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
            <input :id="'popup-' + input.type + '-' + index" :type="input.type" :value="input.value" :min="input.min" :max="input.max" :step="input.step" @click="runCallback(input.callback, $event)">
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