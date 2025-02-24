<script setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const peerMode = ref('')

  function connect(e) {
    // Remove listener
    app.network.off('peer_open', connect);
    app.network.off('peer_error', error);
    app.multiplayer.setHost(null); // Remove host status

    // Disconnect if toggled off
    if (e.target.checked == false) {
      app.network.destroy();
      return;
    }
    
    // Connect to network
    if (isOnline()) {
      app.network.connect(props['settings'].connection, {
        metadata: {
          name: props['settings'].name,
          uuid: app.player.uuid,
          time: app.multiplayer.getTime()
        }
      });
    }
    else {
      // Create peer then connect to host
      app.network.on('peer_open', connect);
      app.network.on('peer_error', error)
      app.network.open(props['settings'].peer);
    }
  }

  function error(e) {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: e.error.message,
        inputs: [
          { type: 'button', value: 'popup.button.continue', callback: function() { window.dispatchEvent(new CustomEvent('closePopup')); }}
        ]
      }
    }));
  }

  function isOnline() {
    return app.network.isOnline();
  }

  function isHost() {
    return app.multiplayer.isHost();
  }

  function toggleHost() {
    if (isHost()) {
      app.network.off('peer_error', error)
      app.network.destroy();
      app.multiplayer.setHost(null);
    }
    else {
      app.network.on('peer_error', error)
      app.network.open(props['settings'].peer);
      app.multiplayer.setHost(props['settings'].peer);
    }
  }

  function copyInput(e) {
    var input = e.target;
    var text = input.value;
    
    // Update success text for 1 second
    input.value = 'Copied!'
    input.disabled = true;
    navigator.clipboard.writeText(text);
    setTimeout(function() {
      // Revert input values
      input.value = text;
      input.disabled = false;
    }, 1000);
  }

  function changePeerId() {
    return { target: { id: 'peer', value: app.storage.generateHex('') }};
  }
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.multiplayer.title') }}</p>
    <div class="group">
      <div class="option">
        <button :class="{ 'selected': peerMode == 'guest' }" @click="peerMode = 'guest'">
          <span class="material-symbols-rounded">login</span>
          {{ i18n.t('settings.multiplayer.join') }}
        </button>
        <button :class="{ 'selected': peerMode == 'host' }" @click="peerMode = 'host'">
          <span class="material-symbols-rounded">home</span>
          {{ i18n.t('settings.multiplayer.host') }}
        </button>
      </div>
      <template class="group" v-if="peerMode != ''">
        <br>
        <div class="option">
          <label for="name">{{ i18n.t('settings.multiplayer.your_name') }}</label>
          <input type="text" id="name" autocomplete="off" :value="settings.name" @change="$emit('updateSettings', $event)">
        </div>
        <div class="option" v-if="peerMode == 'guest'">
          <label for="connection">{{ i18n.t('settings.multiplayer.paste_friend_code') }}</label>
          <input
            type="text"
            id="connection"
            autocomplete="off"
            maxlength="6"
            :value="settings.connection"
            :placeholder="`ex: DC265A`"
            @change="$emit('updateSettings', $event)"
          >
        </div>
        <div class="option" v-if="peerMode == 'guest'">
          <input type="checkbox" id="join-multiplayer" :checked="isOnline() && isHost() == false" @change="connect($event)">
          <label for="join-multiplayer">{{ i18n.t('settings.multiplayer.join') }}</label>
        </div>
        <div class="option" v-if="peerMode == 'host'">
          <label for="peer">{{ i18n.t('settings.multiplayer.share_friend_code') }}</label>
          <input
            type="text"
            id="peer"
            autocomplete="off"
            maxlength="6"
            readonly
            :class="{ 'hex': settings.peer.length <= 6 }"
            :value="settings.peer"
            @click="copyInput($event)"
          >
        </div>
        <div class="option" v-if="peerMode == 'host'">
          <input type="checkbox" id="host-multiplayer" :checked="isHost()" @change="toggleHost($event)">
          <label for="host-multiplayer">{{ i18n.t('settings.multiplayer.host') }}</label>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  #connection,
  #peer {
    text-transform: uppercase;
    letter-spacing: 0.125em;
  }

  input[type=checkbox]:checked + label {
    animation: initial;
  }

  input[type=checkbox] + label {
    animation: throb 2s ease-in-out infinite;
  }

  @keyframes throb { 0% { transform: scale(1); } 25% { transform: scale(1.20); } 50% { transform: scale(1); } }
</style>