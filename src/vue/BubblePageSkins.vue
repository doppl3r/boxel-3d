<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import skins from '../json/skins.json';

  var emit = defineEmits(['setPage']);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
  }

  // Set initial variables
  var settings = ref(app.storage.getSettings());

  function selectSkin(skin, e) {
    settings.value.skin = skin;
    if (skin.id == 680) {
      // Open custom skin options
      window.dispatchEvent(new CustomEvent('addPopup', {
        detail: {
          text: 'Custom Skin',
          inputs: [
            { class: 'button', type: 'file', style: 'width: 100%', accept: 'image/png, image/jpeg', callback: changeImage },
            { type: 'button', value: 'Close' }
          ]
        }
      }));
    }
    else {
      // Immediately change skin
      app.player.setSkin({ id: skin.id, url: skin.url });
      app.updateSettings(settings.value);
    }

    // Scroll to element
    scrollToSkin(e.target);
  }

  function changeImage(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onloadend = function() {
        var skin = { id: 680, title: file.name, url: reader.result };
        settings.value.skin = skin;
        app.player.setSkin(skin, app);
        app.updateSettings(settings.value);
        window.dispatchEvent(new CustomEvent('closePopup'));
      }
      reader.readAsDataURL(file);
    }
  }

  function isSelected(skin) {
    return skin.id == settings.value.skin.id;
  }

  function scroll(e) {
    var parent = getScrollParent(e.target);
    parent.scrollLeft += e.deltaX + e.deltaY;
  }

  function getScrollParent(node) {
    if (node == null) return null;
    if (node.scrollWidth > node.clientWidth) return node;
    else return getScrollParent(node.parentNode);
  }

  function scrollToSkin(el) {
    if (el == null) el = document.querySelector("[class*='selected']");
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  function exitSkins() {
    emit('setPage', 'home');
  }

  function keydown(e) {
    if (e.code == 'Escape') {
      exitSkins();
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSkin()
    addEventListeners();
  })

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="page">
    <div class="background">
      <img src="/img/svg/background-purple.svg">
    </div>
    <div class="nav">
      <a class="button fade-in" @click="exitSkins" title="Exit to home (ESC)">
        <span class="material-symbols-rounded">undo</span>
      </a>
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="content fade-in">
      <h1>Skins</h1>
      <p>Select your player skin</p>
      <div class="carousel" @wheel="scroll($event)">
        <template v-for="(skin, key) of skins">
          <div class="item" :class="{ selected: isSelected(skin) }" :id="skin.id" @click="selectSkin(skin, $event)">
            <img :src="isSelected(skin) ? settings.skin.url : skin.url">
            <p class="text">{{ skin.title }}</p>
          </div>
        </template>
      </div>
    </div>
    <div class="footer">
      <a class="button center fade-in" @click="openReviewLink">
        <span class="material-symbols-rounded">check_box</span>
        Select
      </a>
    </div>
  </div>
</template>