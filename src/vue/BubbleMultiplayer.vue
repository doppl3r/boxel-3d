<script setup>
  import { ref, nextTick, onMounted, onUnmounted } from 'vue';

  var tab = ref('chat');
  var isOpen = ref(false);
  var isCollapsed = ref(false);
  var notifications = ref(0);
  var message = ref('');
  var messages = ref([]);
  var messageBox = ref();
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
        time: new Date().toLocaleTimeString(),
        color: '#4CA9FF'
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
        time: new Date().toLocaleTimeString(),
        color: '#4CA9FF'
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
        time: new Date().toLocaleTimeString(),
        color: '#4CA9FF'
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
      time: new Date().toLocaleTimeString(),
      color: '#4CA9FF'
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
      if (message.value.value == '') return; // Prevent sending empty data
      data = {
        type: 'message',
        name: settings.name + (isHost() ? ' [host]' : ''),
        text: message.value.value,
        time: new Date().toLocaleTimeString(),
        color: '#ffcc4d'
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

    // Increment messages if not visible
    if (tab.value != 'chat' || isCollapsed.value == true) {
      notifications.value++;
    }

    // Scroll to message
    scrollToLastMessage();
  }

  async function scrollToLastMessage(force = false) {
    // Scroll to message
    if (messageBox.value) {
      var el = messageBox.value;
      var isScrolledToBottom = (el.scrollTop + 1) > (el.scrollHeight - el.clientHeight);
      await nextTick(); // Wait for element to recalculate height
      if (isScrolledToBottom || force == true) {
        el.scrollTop = el.scrollHeight + 1;
      }
    }
  }

  function isHost() {
    return app.network.isHost;
  }

  function kickPlayer(id) {

  }

  function goToPlayer(id) {

  }

  function changeTab(name) {
    // Toggle multiplayer section
    if (name == tab.value) isCollapsed.value = !isCollapsed.value;
    else isCollapsed.value = false;

    // Reset notifications
    if (name == 'chat') {
      notifications.value = 0;
    }

    // Set tab value to name
    tab.value = name;
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
  <Transition name="fade-multiplayer">
    <div class="multiplayer" v-if="isOpen == true">
      <div class="container">
        <div class="tabs">
          <div class="tab" :class="{ 'selected': tab == 'chat' }" @click="changeTab('chat')" title="Chat">
            <span class="material-symbols-rounded">chat</span>
            <span class="notifications" v-if="notifications > 0">{{ notifications }}</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'lobby' }" @click="changeTab('lobby')" title="Lobby">
            <span class="material-symbols-rounded">group</span>
          </div>
        </div>
        <div class="content" :class="{ 'collapsed': isCollapsed == true }">
          <div class="panel" v-show="tab == 'chat'">
            <ul class="messages" ref="messageBox">
              <li class="message" v-for="message in messages" :title="message.time">
                <span class="name" :style="{ color: message.color || '#ffffff' }">{{ message.name }}</span>
                <span class="text">: {{ message.text }}</span>
              </li>
            </ul>
            <div class="message-input">
              <input type="text" ref="message" placeholder="Message" @keydown.enter="sendMessage(null);" @focus="isCollapsed = false; notifications = 0;" maxlength="128">
              <button @click="sendMessage(null)">
                <span class="material-symbols-rounded">send</span>
              </button>
            </div>
          </div>
          <div class="panel" v-show="tab == 'lobby'">
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
  </Transition>
</template>
<style>
  .fade-multiplayer-enter-active,
  .fade-multiplayer-leave-active { transition: opacity 0.5s ease; }
  .fade-multiplayer-enter-from,
  .fade-multiplayer-leave-to { opacity: 0; }
</style>