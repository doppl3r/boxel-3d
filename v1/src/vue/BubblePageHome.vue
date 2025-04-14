<script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BubbleCarousel from './BubbleCarousel.vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleButtonFullscreen from './BubbleButtonFullscreen.vue';

  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  var emit = defineEmits(['setPage']);
  var manifest = ref();
  var version = ref();
  var versionButtonVisible = ref(app.network.isOnline() == false);
  var messageIndex = getRandomMessageIndex();
  var message = computed(() => getRandomMessage(messageIndex));
  var menuKey = ref(0);
  var menu = computed(() => [
    {
      "title": i18n.t('home.button.skins'),
      "url": "../svg/button-skins.svg",
      "callback": function() { emit('setPage', 'skins') }
    },
    {
      "title": i18n.t('home.button.level_editor'),
      "url": "../svg/button-level-editor.svg",
      "callback": function() {
        // TODO: Replace events after developing Level Editor 2.0
        window.dispatchEvent(new CustomEvent('setTheme', { detail: 'origin' }));
        setTimeout(function() { window.dispatchEvent(new CustomEvent('setPage', { detail: 'level-manager' })); }, 0);
      }
    },
    {
      "title": i18n.t('home.button.multi_player'),
      "url": "../svg/button-multiplayer.svg",
      "callback": function() {
        window.dispatchEvent(new CustomEvent('openSettings', { detail: 'multiplayer' }));
      }
    },
    {
      "title": i18n.t('home.button.play'),
      "url": "../svg/button-play.svg",
      "callback": function() {
        emit('setPage', 'level-picker')
      }
    }
  ]);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('itemSelected', selectMenuItem);
    document.addEventListener('keydown', keydown);
    app.network.on('peer_open', hideVersionButton);
    app.network.on('peer_close', showVersionButton);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('itemSelected', selectMenuItem);
    document.removeEventListener('keydown', keydown);
    app.network.off('peer_open', hideVersionButton);
    app.network.off('peer_close', showVersionButton);
  }

  function keydown(e) {
    if (e.code === 'Escape' || e.code == 'KeyE') {
      e.preventDefault();
      goBack();
    }
  }

  function selectMenuItem(e) {
    var item = e.detail;
    if (item.callback) item.callback();
  }

  async function updateVersion() {
    var response = await fetch('../manifest.json');
    var json = await response.json();
    manifest.value = json;
    version.value = 'v' + json.version;
  }

  function hideVersionButton() {
    versionButtonVisible.value = false;
  }
  
  function showVersionButton() {
    versionButtonVisible.value = true;
  }

  function getRandomMessageIndex() {
    const messages = Object.keys(i18n.messages.value.en.home.messages);
    return Math.floor(Math.random() * messages.length);
  }

  function getRandomMessage(index) {
    const message = i18n.t('home.messages.' + index);
    return message;
  }

  async function openChangelog() {
    const changelog = await fetch('../json/changelog.json').then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { return json; }.bind(this))
    .catch(function(error) { console.error(error); });
    var text = '';

    // Update text from changelog json file
    for (var i = changelog.length - 1; i >= 0; i--) {
      var log = changelog[i];
      text += 'v' + log.version + '\n';

      // Loop through version revisions
      log.revisions.forEach(function(revision) { text += '- ' + revision + '\n'; });
      text += '\n';
    }

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: '<div style="font-size: 0.75em; padding-right: 1em; text-align: left;">' + text + '</div>',
        inputs: [{ type: 'button', value: 'popup.button.close' }]
      }
    }));
  }

  function clickLink(e) {
    e.preventDefault(e);
    if (e.target.href) openLink(e.target.href);
  }

  function openLink(url, target = '_blank') {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, target);
  }

  function goBack() {
    window.location.href = '../index.html';
  }

  function isExtension() {
    return window.chrome?.extension;
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    updateVersion();
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'home' }));
  });
  
  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="page" :key="menuKey">
    <div class="background">
      <img :src="'../svg/background-purple.svg'">
    </div>
    <div class="nav">
      <a class="button left fade-in" @click="goBack" :title="i18n.t('home.button.back')">
        <span class="material-symbols-rounded">undo</span>
      </a>
      <BubbleButtonFullscreen class="button fade-in" :title="i18n.t('home.button.fullscreen')" />
      <BubbleButtonSettings class="button fade-in" />
    </div>
    <div class="content fade-in">
      <h1>BOXEL3D</h1>
      <p v-html="message" @click="clickLink($event)"></p>
      <BubbleCarousel :items="menu" scrolling="no" />
    </div>
    <div class="footer">
      <a class="button fade-in" v-if="versionButtonVisible" :class="{ hidden: version == '' }" @click="openChangelog" :title="i18n.t('home.button.changelog')">
        <span class="material-symbols-rounded">ink_pen</span>
        {{ version }}
      </a>
    </div>
  </div>
</template>