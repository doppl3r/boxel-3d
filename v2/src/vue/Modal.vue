<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  // Initialize attributes
  var title = ref('');
  var text = ref('');
  var inputs = ref([]);
  var isOpen = ref(false);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('openModal', openModal);
	  window.addEventListener('closeModal', closeModal);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('openModal', openModal);
	  window.removeEventListener('closeModal', closeModal);
    window.removeEventListener('keydown', keydown);
  }

  function openModal(e) {
    isOpen.value = true;

    // Assign values from custom event detail
    if (e.detail) {
      if (e.detail.title) title.value = e.detail.title;
      if (e.detail.text) text.value = e.detail.text;
      if (e.detail.inputs) {
        inputs.value = e.detail.inputs;
        inputs.value.forEach(function(input) {
          // Set input event type (ex: click vs change)
          if (input.type == 'file' || input.type == 'range' || input.type == 'text') input.event = 'change';
          else input.event = 'click';
        })
      }
    }

    // Trigger opened event
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('modalOpened'));
    }, 100);
  }

  function closeModal() {
    isOpen.value = false;

    // Trigger opened event
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('modalClosed'));
    }, 100);
  }

  function runCallback(callback, e) {
    if (callback == null) callback = closeModal;
    callback(e);
  }

  function runLastInputCallback(e) {
    var lastInput = inputs.value[inputs.value.length - 1];
    if (lastInput) runCallback(lastInput.callback, e);
  }

  function keydown(e) {
    if (isOpen.value == true) {
      var jumpKeys = ['Space', 'Enter', 'Escape'];
      if (jumpKeys.indexOf(e.code) > -1) {
        // Close modal
        e.preventDefault();
        runLastInputCallback(e);
      }
    }
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <Transition name="fade-modal">
    <div class="modal" v-if="isOpen == true">
      <div class="background" @click="runLastInputCallback"></div>
      <div class="container">
        <div class="content">
          <h1 class="title" v-if="title != ''">{{ title }}</h1>
          <p class="text">{{ text }}</p>
          <div class="inputs">
            <template v-for="(input, index) of inputs">
              <input :class="input.class" :id="'modal-' + input.type + '-' + index" :type="input.type" :value="input.value" :min="input.min" :max="input.max" :step="input.step" :accept="input.accept" :style="input.style" v-on:[input.event]="runCallback(input.callback, $event)">
            </template>
          </div>
          <a class="close" @click="runLastInputCallback">
            <span>x</span>
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style lang="scss" scoped>
  // Variables
  $border-width: 0.25em;
  $color-blue: #47D2FD;
  $color-green: #00BC57;
  $color-lime: #A3EB2B;
  $color-purple: #9F00FF;
  $color-red: #F52D59;
  $color-yellow: #FFCB4C;

  // Modal fade transition
  .fade-modal-enter-active{
    animation: twist 0.2s;
  }
  .fade-modal-leave-active {
    animation: twist 0.2s reverse;
  }

  // Animations
  @keyframes translateBackground { 0% { background-position: 0em 0em; } 100% { background-position: -8em -8em; } }
  @keyframes grow { 0% { transform: scale(1); } 50% { transform: scale(1.20); } 100% { transform: scale(1); } }
  @keyframes shake { 0% { transform: rotate(0); } 33% { transform: rotate(10deg); } 66% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }
  @keyframes twist {
    0% {
      opacity: 0;
      transform: rotate(15deg) scale(0.75);
    }
    100% {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  }

  .modal {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5em;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;

    /* Scrollbar */
    ::-webkit-scrollbar { width: $border-width; }
    ::-webkit-scrollbar-track { background: rgba(#000000, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb { background: rgba($color-yellow, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(#ffffff, 1); border-radius: 99em; }

    .background {
      //background: radial-gradient(circle, rgba($color-purple, 0) 50%, rgba($color-purple, 1) 100%);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .container {
      display: flex;
      max-height: 100%;
      width: 22.5em; // 360px

      .content {
        align-items: center;
        animation: translateBackground 5s linear;
        animation-iteration-count: infinite;
        background-color: $color-purple;
        background-image: url('/svg/background-stars-purple.svg');
        background-size: 8em;
        background-position: center;
        border-radius: calc($border-width * 4);
        border: $border-width solid #000000;
        box-shadow: 0em $border-width 0em #000000;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 1em 1em 2em;
        position: relative;

        .title {
          background-color: #000000;
          border-radius: 99em;
          color: #ffffff;
          font-size: 1.5em;
          margin: 0 auto 1em;
          padding: $border-width 1em;
        }
        
        .text {
          color: #ffffff;
          font-size: 1.25em;
          overflow-y: auto;
          margin: 0;
          height: 100%;
          max-height: 8em;
          padding-bottom: 0.5em;
          text-align: center;
          text-shadow: 0 0.125em 0 #000000;
          white-space: pre-line;
        }
  
        .inputs {
          position: absolute;
          display: flex;
          column-gap: 0.5em;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 50%);
        }

        input {
          &[type="button"] {
            background-color: $color-red;
            border: $border-width solid #000000;
            border-radius: 99em;
            box-shadow: 0em $border-width 0em #000000;
            color: #000000;
            font-family: inherit;
            padding: 0.5em 1em;

            &:hover {
              animation: shake 0.25s ease-in-out;
              animation-fill-mode: forwards;
            }

            &:last-of-type {
              background-color: $color-yellow;
              margin: 0;
            }
          }
        }
  
        .close {
          background-color: $color-yellow;
          border-radius: 99em;
          border: $border-width solid #000000;
          box-shadow: 0em 0.25em 0em #000000;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 2em;
          width: 2em;
          position: absolute;
          top: 0;
          right: 0;
          margin: -1em -1em 0em 0em;

          &:hover {
            animation: grow 0.25s ease-in-out;
            animation-fill-mode: forwards;
          }
        }
      }
    }
  }
</style>