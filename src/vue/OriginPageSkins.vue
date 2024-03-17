<script setup>
  import { ref, onMounted } from 'vue';
  import skins from '../json/skins.json';

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

  // Run function after being mounted (visible)
  onMounted(function() {
    
  })
</script>

<template>
  <div class="skins dashboard">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>My<strong>Skins</strong></h1>
      <div class="skin-group">
        <template v-for="(skin, key) of skins">
          <div class="skin" :class="{ selected: isSelected(skin) }" :id="skin.id" @click="selectSkin(skin, $event)">
            <div class="image" :style="{ 'background-image': 'url(' + (isSelected(skin) ? settings.skin.url : skin.url) + ')' }"></div>
            <div class="title">{{ skin.title }}</div>
          </div>
        </template>
      </div>
      <div class="buttons">
        <a class="button top-left" @click="$emit('setPage', 'home')" title="Exit to home (ESC)"><img src="/img/svg/home.svg"></a>
      </div>
    </div>
  </div>
</template>