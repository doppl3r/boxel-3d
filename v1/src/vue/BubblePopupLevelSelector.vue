<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  const search = ref('');
  var isOpen = ref(true);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('openPopup', openPopup);
	  window.addEventListener('closePopup', closePopup);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('openPopup', openPopup);
	  window.removeEventListener('closePopup', closePopup);
    window.removeEventListener('keydown', keydown);
  }

  function openPopup(e) {
    isOpen.value = true;
  }

  function closePopup() {
    isOpen.value = false;
  }

  function keydown(e) {
    if (isOpen.value == true) {
      
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
  <Transition name="fade">
    <div class="level-selector" v-if="isOpen == true">
      <div class="level-selector__background" @click="closePopup()"></div>
      <div class="level-selector__container">
        <div class="level-selector__packs">
          <div class="level-selector__packs-header">{{ i18n.t('popup.text.level_packs') }}</div>
          <ul class="level-selector__packs-list">

          </ul>
        </div>
        <div class="level-selector__levels">
          <div class="level-selector__levels-header">
            <input class="level-selector__search" v-model="search" :placeholder="`${ i18n.t('popup.text.search') }...`" type="text">
          </div>
          <ul class="level-selector__levels-list">

          </ul>
        </div>
        <div class="level-selector__info">
          <div class="level-selector__info-header">{{ i18n.t('popup.text.info') }}</div>
        </div>
        <a class="level-selector__close" @click="closePopup()" :title="i18n.t('popup.button.close')">
          <span class="material-symbols-rounded">close</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .level-selector {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    .level-selector__background {
      background-color: rgba(#000000, 0.5);
      height: inherit;
      left: 0;
      position: absolute;
      top: 0;
      width: inherit;
    }

    .level-selector__container {
      position: relative;

      .level-selector__packs {
        .level-selector__packs-header {

        }

        .level-selector__packs-list {

        }
      }

      .level-selector__levels {
        .level-selector__levels-header {
          .level-selector__search { // <input>

          }
        }

        .level-selector__levels-list { // <ul>

        }
      }

      .level-selector__info {
        .level-selector__info-header {

        }
      }

      .level-selector__close {

      }
    }
  }
</style>