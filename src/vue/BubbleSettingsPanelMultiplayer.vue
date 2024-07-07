<script setup>
  var props = defineProps(['settings']);

  function connect(e) {
    // Remove listener
    app.network.off('peer_open', connect);

    // Disconnect if toggled off
    if (e.target.checked == false) {
      app.network.disconnect();
      return;
    }
    
    // Connect to network
    if (isOnline()) {
      console.log('connecting...');
      app.network.connect(props['settings'].connection, {
        label: props['settings'].name
      });
    }
    else {
      // Create peer then connect to host
      console.log('creating peer...')
      app.network.on('peer_open', connect);
      app.network.open(props['settings'].peer);
    }
  }

  function isOnline() {
    return app.network.isOnline();
  }

  function toggleHost() {
    if (isOnline()) {
      app.network.destroy();
    }
    else {
      app.network.open(props['settings'].peer);
      app.multiplayer.setHost(true);
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
    <p>Multiplayer Settings</p>
    <div class="group">
      <div class="option">
        <label for="name">Your name</label>
        <input type="text" id="name" :value="settings.name" @change="$emit('updateSettings', $event)">
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="connection">Paste friend code</label>
        <input type="text" id="connection" :value="settings.connection" @change="$emit('updateSettings', $event)" placeholder="ex: 4630cba6-b969-46f3-8d32-e77324054612">
      </div>
      <div class="option">
        <input type="checkbox" id="join-multiplayer" @change="connect($event)">
        <label for="join-multiplayer">Join Server</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="peer-id">Share friend code</label>
        <input type="text" id="peer-id" :value="settings.peer" @click="copyInput($event)" readonly>
      </div>
      <div class="option">
        <input type="checkbox" id="host-multiplayer" :checked="isOnline()" @change="toggleHost($event)">
        <label for="host-multiplayer">Host Server</label>
      </div>
    </div>
  </div>
</template>