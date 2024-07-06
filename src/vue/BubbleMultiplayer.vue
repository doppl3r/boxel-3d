<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  var tab = ref('chat');
  var isOpen = ref(false);

  function addEventListeners() {
    // Add peer events
    app.network.on('peer_open', onPeerOpen);
    app.network.on('peer_close', onPeerClose);
    app.network.on('peer_disconnected', onPeerDisconnected);
    app.network.on('connection_open', onConnectionOpen);
    app.network.on('connection_close', onConnectionClose);
    app.network.on('connection_data', onConnectionData);
  }
  
  function removeEventListeners() {
    app.network.off('peer_open', onPeerOpen);
    app.network.off('peer_close', onPeerClose);
    app.network.off('peer_disconnected', onPeerDisconnected);
    app.network.off('connection_open', onConnectionOpen);
    app.network.off('connection_close', onConnectionClose);
    app.network.off('connection_data', onConnectionData);
  }

  function onPeerOpen(e) {
    console.log(e);
    isOpen.value = true;
  }
  
  function onPeerClose(e) {
    console.log(e);
    isOpen.value = false;
  }

  function onPeerDisconnected(e) {
    console.log(e);
  }
  
  function onConnectionOpen(e) {
    console.log(e);
  }
  
  function onConnectionClose(e) {
    console.log(e);
  }
  
  function onConnectionData(e) {
    console.log(e);
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  })
</script>
<template>
  <div class="multiplayer" v-if="isOpen == true">
    <div class="container">
      <div class="tabs">
        <div class="tab" :class="{ 'selected': tab == 'chat' }">
          <span class="material-symbols-rounded">chat</span>
        </div>
        <div class="tab" :class="{ 'selected': tab == 'lobby' }">
          <span class="material-symbols-rounded">group</span>
        </div>
      </div>
      <div class="content">
        <div class="panel">
  
        </div>
      </div>
    </div>
  </div>
</template>