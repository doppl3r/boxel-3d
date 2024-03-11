<script setup>
  import { ref } from 'vue';

  // Initialize attributes
  var text = ref('');
  var inputs = ref([]);
  var isOpen = ref(false);
  
  // Add event listener
	window.addEventListener('addPopup', function(e) {
		addPopup(e);
	});

  function addPopup(e) {
    // Assign values from custom event detail
    if (e.detail) {
      isOpen.value = true;
      if (e.detail.text) text.value = e.detail.text;
      if (e.detail.inputs) inputs.value = e.detail.inputs;
      else {
        // Add default close input option
        inputs.value = [{ value: 'Close', type: 'button' }]
      }
    }
  }

  function closePopup() {
    isOpen.value = false;
  }

  function runCallback(callback = function(e){}) {
    callback();
    closePopup();
  }

  function runLastInputCallback() {
    var lastInput = inputs.value[inputs.value.length - 1];
    if (lastInput) runCallback(lastInput.callback);
    else closePopup();
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
            <input :type="input.type" :value="input.value" @click="runCallback(input.callback)">
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