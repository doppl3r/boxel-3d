<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { skins } from '../js/Data.js';

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
    settings.value.skin = { id: skin.id, title: skin.title, url: skin.url };
    if (skin.id == 680) {
      // Open custom skin options
      window.dispatchEvent(new CustomEvent('openPopup', {
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

  function scrollToSkin(el) {
    if (el == null) el = document.querySelector("[class*='selected']");
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function exitSkins() {
    emit('setPage', 'home');
  }

  function keydown(e) {
    if (e.code == 'Escape' || e.code == 'KeyE') {
      e.preventDefault();
      exitSkins();
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSkin()
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'skins' }));
  })

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="skins dashboard">
    <div class="background-cubes"></div>
    <div class="wrapper fade-in">
      <h1>My<strong>Skins</strong></h1>
      <div class="skin-group">
        <div v-for="(skin, key) of skins"
          class="skin"
          :class="{ selected: isSelected(skin) }"
          :id="skin.id"
          :key="key"
          @click="selectSkin(skin, $event)"
        >
          <img :src="skin.url" class="image" />
          <div class="title">{{ skin.title }}</div>
        </div>
      </div>
      <div class="buttons">
        <a class="button top-left" @click="exitSkins" title="Exit to home (ESC)"><img :src="'./svg/home.svg'"></a>
      </div>
    </div>
  </div>
</template>