<script setup>
  import { useI18n } from 'vue-i18n';
  
  const i18n = useI18n({ useScope: 'global' });
  var props = defineProps(['settings']);

  function connect(e) {
    // Remove listener
    app.network.off('peer_open', connect);
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
      app.network.open(props['settings'].peer);
    }
  }

  function isOnline() {
    return app.network.isOnline();
  }

  function isHost() {
    return app.multiplayer.isHost();
  }

  function toggleHost() {
    if (isHost()) {
      app.network.destroy();
      app.multiplayer.setHost(null);
    }
    else {
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
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.multiplayer.title') }}</p>
    <div class="group">
      <div class="option">
        <button>{{ i18n.t('settings.multiplayer.join') }}</button>
        <button>{{ i18n.t('settings.multiplayer.host') }}</button>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="name">{{ i18n.t('settings.multiplayer.your_name') }}</label>
        <input type="text" id="name" :value="settings.name" @change="$emit('updateSettings', $event)">
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="connection">{{ i18n.t('settings.multiplayer.paste_friend_code') }}</label>
        <input type="text" id="connection" :value="settings.connection" @change="$emit('updateSettings', $event)" placeholder="ex: 4630cba6-b969-46f3-8d32-e77324054612">
      </div>
      <div class="option">
        <input type="checkbox" id="join-multiplayer" :checked="isOnline() && isHost() == false" @change="connect($event)">
        <label for="join-multiplayer">{{ i18n.t('settings.multiplayer.join') }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="peer-id">{{ i18n.t('settings.multiplayer.share_friend_code') }}</label>
        <input type="text" id="peer-id" :value="settings.peer" @click="copyInput($event)" readonly>
      </div>
      <div class="option">
        <input type="checkbox" id="host-multiplayer" :checked="isHost()" @change="toggleHost($event)">
        <label for="host-multiplayer">{{ i18n.t('settings.multiplayer.host') }}</label>
      </div>
    </div>
  </div>
</template>