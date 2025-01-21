<script setup>
  import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleCarousel from './BubbleCarousel.vue';
  import skins from '../json/skins.json';

  const i18n = useI18n();
  var emit = defineEmits(['setPage']);
  var defaultSkin = ref()

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
    window.addEventListener('itemSelected', updatePlayerSkin);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('itemSelected', updatePlayerSkin);
  }

  // Set initial variables
  var settings = ref(app.storage.getSettings());

  function updatePlayerSkin(e) {
    var skin = e.detail;
    settings.value.skin = skin;
    if (skin.id == 680) {
      // Open custom skin options
      window.dispatchEvent(new CustomEvent('openPopup', {
        detail: {
          text: i18n.t('popup.text.custom_skin'),
          inputs: [
            { type: 'file', label: i18n.t('popup.button.upload'), class: 'button', style: 'width: 100%', accept: 'image/png, image/jpeg', callback: changeImage },
            { type: 'button', value: i18n.t('popup.button.close') }
          ]
        }
      }));
    }
    else {
      // Immediately change skin
      app.player.setSkin({ id: skin.id, url: skin.url });
      app.updateSettings(settings.value);
    }
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

  function exitSkins() {
    emit('setPage', 'home');
  }

  function keydown(e) {
    // Ignore events from inputs
    if (e.target.value == null) {
      var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
      if (jumpKeys.indexOf(e.code) > -1) {
        e.preventDefault(); // Prevent scrolling
        exitSkins();
      }

      if (e.code == 'Escape' || e.code == 'KeyE') {
        e.preventDefault();
        exitSkins();
      }
    }
  }

  function selectSkinFromStorage() {
    var id = settings.value.skin.id;
    skins.forEach(function(skin) {
      if (skin.id == id) {
        defaultSkin.value = skin;
      }
    });
  }

  onBeforeMount(function() {
    selectSkinFromStorage();
  });
  
  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();
  })

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="page">
    <div class="background">
      <img :src="'../svg/background-purple.svg'">
    </div>
    <div class="nav">
      <a class="button fade-in" @click="exitSkins" title="Exit to home (ESC)">
        <span class="material-symbols-rounded">undo</span>
      </a>
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="content fade-in">
      <h1>{{ i18n.t('skins.title') }}</h1>
      <p>{{ i18n.t('skins.description') }}</p>
      <BubbleCarousel :items="skins" :selected="defaultSkin" class="hide-titles" />
    </div>
    <div class="footer">
      <a class="button center fade-in" @click="exitSkins">
        <span class="material-symbols-rounded">check_box</span>
        {{ i18n.t('skins.button.select') }}
      </a>
    </div>
  </div>
</template>