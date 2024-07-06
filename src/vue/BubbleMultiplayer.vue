<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  var tab = ref('chat');
  var isOpen = ref(false);
  var message = ref('');
  var messages = ref([]);
  var players = ref()

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

    // Tell host their server is ready
    if (e.target.isHost == true) {
      addMessage({
        name: 'Server',
        text: 'Server is ready!',
        time: new Date().toLocaleTimeString()
      })
    }
  }
  
  function onPeerClose(e) {
    console.log(e);
    isOpen.value = false;

    // Tell host their server is closed
    if (e.target.isHost == true) {
      addMessage({
        name: 'Server',
        text: 'Server is closed!',
        time: new Date().toLocaleTimeString()
      })
    }
  }

  function onPeerDisconnected(e) {
    console.log(e);
  }
  
  function onConnectionOpen(e) {
    console.log(e);

    if (isHost()) {
      var data = {
        type: 'message',
        name: 'Server',
        text: e.connection.label + ' has connected!',
        time: new Date().toLocaleTimeString()
      }
      sendMessage(data);
    }
  }
  
  function onConnectionClose(e) {
    console.log(e);
    
    // Send message to all connections about a closed connection
    var data = {
      type: 'message',
      name: 'Server',
      text: e.connection.label + ' has disconnected.',
      time: new Date().toLocaleTimeString()
    };
    
    // Let guess know the host disconnected
    if (isHost()) {
      sendMessage(data);
    }
    else {
      data.text = 'The host has disconnected.'
      addMessage(data);
    }
  }
  
  function onConnectionData(e) {
    console.log(e);
    if (e.data.type == 'message') {
      // Add message to messages
      addMessage(e.data);
      
      // Send all guests the message
      if (isHost()) {
        // Send guest message to other guests
        e.data.name = e.connection.label;
        app.network.connections.forEach(function(connection) {
          connection.send(e.data);
        })
      }
    }
  }

  function sendMessage(data) {
    // Send message to the host for distribution
    var settings = app.storage.getSettings();
    if (data == null) {
      data = {
        type: 'message',
        name: settings.name,
        text: message.value.value,
        time: new Date().toLocaleTimeString()
      };
      message.value.value = ''; // Clear message
    }

    // Add message immediately for the host
    if (isHost()) {
      addMessage(data);
    }

    // Send message to all connections (host has many, guest has 1)
    app.network.connections.forEach(function(connection) {
      connection.send(data);
    });
  }

  function addMessage(data) {
    // Receive message from event and add to messages array
    messages.value.push(data);
  }

  function isHost() {
    return app.network.isHost;
  }

  function kickPlayer(id) {

  }

  function goToPlayer(id) {

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
        <div class="tab" :class="{ 'selected': tab == 'chat' }" @click="tab = 'chat'" title="Chat">
          <span class="material-symbols-rounded">chat</span>
        </div>
        <div class="tab" :class="{ 'selected': tab == 'lobby' }" @click="tab = 'lobby'" title="Lobby">
          <span class="material-symbols-rounded">group</span>
        </div>
      </div>
      <div class="content">
        <div class="panel" v-if="tab == 'chat'">
          <ul class="messages">
            <li class="message" v-for="message in messages" :title="message.time">
              <span class="name">{{ message.name }}: </span>
              <span class="text">{{ message.text }}</span>
            </li>
          </ul>
          <input type="text" ref="message" placeholder="Message" @keydown.enter="sendMessage(null)">
          <button @click="sendMessage(null)">
            <span class="material-symbols-rounded">send</span>
          </button>
        </div>
        <div class="panel" v-if="tab == 'lobby'">
          <ul class="players">
            <li class="player" v-for="player in players">
              <span class="name">{{ player.name }}</span>
              <span class="action material-symbols-rounded" @click="kickPlayer(player.id)" v-if="isHost()">cancel</span>
              <span class="action material-symbols-rounded" @click="goToPlayer(player.id)">near_me</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>