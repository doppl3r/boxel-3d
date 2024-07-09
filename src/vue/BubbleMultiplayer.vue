<script setup>
  import { ref, nextTick, onMounted, onUnmounted } from 'vue';

  var tab = ref('chat');
  var online = ref(false);
  var collapsed = ref(false);
  var notifications = ref(0);
  var message = ref('');
  var messages = ref([]);
  var messageBox = ref();
  var players = ref([]);
  var timeout;

  function addEventListeners() {
    // Add peer events
    app.network.on('peer_open', onPeerOpen);
    app.network.on('peer_close', onPeerClose);
    app.network.on('peer_disconnected', onPeerDisconnected);
    app.network.on('connection_start', onConnectionStart);
    app.network.on('connection_open', onConnectionOpen);
    app.network.on('connection_close', onConnectionClose);
    app.network.on('connection_data', onConnectionData);
    window.addEventListener('levelFinish', onLevelFinish);
  }
  
  function removeEventListeners() {
    app.network.off('peer_open', onPeerOpen);
    app.network.off('peer_close', onPeerClose);
    app.network.off('peer_disconnected', onPeerDisconnected);
    app.network.off('connection_start', onConnectionStart);
    app.network.off('connection_open', onConnectionOpen);
    app.network.off('connection_close', onConnectionClose);
    app.network.off('connection_data', onConnectionData);
    window.removeEventListener('levelFinish', onLevelFinish);
  }

  function onPeerOpen(e) {
    //console.log(e)
    online.value = true;

    // Tell host their server is ready
    if (isHost()) {
      addMessage({
        name: 'Server',
        text: 'Server is ready! 😊',
        time: getTime(),
        color: '#4ca9ff'
      });
    }
  }
  
  function onPeerClose(e) {
    //console.log(e)
    online.value = false;

    // Tell host their server is closed
    if (isHost()) {
      addMessage({
        name: 'Server',
        text: 'Server closed! 😔',
        time: getTime(),
        color: '#ff674c'
      });
    }
  }

  function onPeerDisconnected(e) {
    //console.log(e)
    addMessage({
      name: 'Server',
      text: 'Server disconnected! 😔',
      time: getTime(),
      color: '#ff674c'
    });
  }

  function onConnectionStart(e) {
    if (isHost()) {

    }
    else {
      addMessage({
        name: 'Server',
        text: 'Searching... 🔍',
        time: getTime(),
        color: '#4ca9ff'
      });

      // Wait for error
      timeout = setTimeout(function() {
        addMessage({ name: 'Error', text: 'Host not found. Your connection may be blocked on this network. 😔', time: getTime(), color: '#ff674c' });
      }, 5000);
    }
  }
  
  function onConnectionOpen(e) {
    // Cancel timeout message
    clearTimeout(timeout);

    // Update guests about new connection
    if (isHost()) {
      var data = {
        type: 'message',
        name: 'Server',
        text: e.connection.metadata.name + ' has connected! 👋',
        time: getTime(),
        color: '#4ca9ff'
      }
      sendMessage(data);
    }
  }
  
  function onConnectionClose(e) {
    //console.log(e)
    // Send message to all connections about a closed connection
    var data = {
      type: 'message',
      name: 'Server',
      text: e.connection.metadata.name + ' has disconnected! 👋',
      time: getTime(),
      color: '#4ca9ff'
    };
    
    // Tell guests that a guest disconnected
    if (isHost()) {
      // Send message to all guests
      sendMessage(data);
    }
    else {
      // Tell guests that the host disconnected
      data.name = 'Server';
      data.text = 'The host has disconnected! 😔';
      data.color = '#4ca9ff';
      addMessage(data);
    }

    // Assign lobby players array from multiplayer list
    players.value = app.multiplayer.players.children.slice(0);
  }
  
  function onConnectionData(e) {
    //console.log(e)
    if (e.data.type == 'message') {
      // Add message to messages
      addMessage(e.data);
      
      // Send all guests the message
      if (isHost()) {
        // Send guest message to other guests
        e.data.name = e.connection.metadata.name;
        app.network.connections.forEach(function(connection) {
          connection.send(e.data);
        });
      }
    }
    else if (e.data.type == 'players') {
      // Update players from multiplayer players list
      if (players.value.length != app.multiplayer.players.children.length) {
        players.value = app.multiplayer.players.children.slice(0);
      }
    }
  }

  function onLevelFinish(e) {
    var time = e.detail.time;
    var level = app.level.getDescriptionByTitle(e.detail.level);
    var settings = app.storage.getSettings();
    var data = {
      type: 'message',
      name: settings.name,
      text: 'Finished <em>' + level + '</em> in 🕒<strong>' + time + 's</strong>',
      time: getTime(),
      color: '#4cff64',
      raw: true
    };
    sendMessage(data);
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
        time: getTime(),
        color: '#ffcc4d'
      };
      message.value.value = ''; // Clear message
    }

    // Add message immediately for the host
    if (isHost()) {
      addMessage(data);
    }
    else {
      // Let guest know the host does not exist
      if (app.network.connections.size == 0) {
        data.name = 'Error';
        data.text = 'Host not found! 😔';
        data.color = '#ff674c';
        addMessage(data);
      }
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
    if (tab.value != 'chat' || isCollapsed()) {
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
    return app.multiplayer.isHost();
  }

  function isOnline() {
    return online.value;
  }

  function isCollapsed() {
    return collapsed.value;
  }

  function kickPlayer(player) {
    app.multiplayer.closeConnectionByUUID(player.uuid);
  }

  async function goToPlayer(player) {
    if (player.level != 'My Level') {
      // Change level to target player
      await app.playLevelByTitle(player.level);
      window.dispatchEvent(new CustomEvent('setPage', { detail: 'campaign' }));

      // Set player position
      var target = app.multiplayer.getPlayer({ uuid: player.uuid })
      if (target) app.player.setPosition(target.position, false);
    }
    else {
      addMessage({
        name: 'Server',
        text: player.text + ' is currently picking a level... ⏳',
        time: getTime(),
        color: '#4ca9ff'
      });
    }
  }

  function changeTab(name) {
    // Toggle multiplayer section
    if (name == tab.value) collapsed.value = !collapsed.value;
    else collapsed.value = false;

    // Reset notifications
    if (name == 'chat') {
      notifications.value = 0;
    }

    // Set tab value to name
    tab.value = name;
  }

  function getTime() {
    return new Date().getTime();
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
    <div class="multiplayer" v-if="isOnline()">
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
        <div class="content" :class="{ 'collapsed': isCollapsed() }">
          <div class="panel" v-show="tab == 'chat'">
            <ul class="messages" ref="messageBox">
              <li class="message" v-for="message in messages" :title="message.name">
                <span class="name" :style="{ color: message.color || '#ffffff' }">{{ message.name }}</span>
                <span>: </span>
                <span class="text" v-if="message.raw" v-html="message.text"></span>
                <span class="text" v-else>{{ message.text }}</span>
              </li>
            </ul>
            <div class="message-input">
              <input type="text" ref="message" placeholder="Message" @keydown.enter="sendMessage(null);" @focus="collapsed = false; notifications = 0;" maxlength="128">
              <button @click="sendMessage(null)">
                <span class="material-symbols-rounded">send</span>
              </button>
            </div>
          </div>
          <div class="panel" v-show="tab == 'lobby'">
            <ul class="lobby">
              <li class="player" v-for="player in players">
                <span class="name">{{ player.text }}</span>
                <span class="action material-symbols-rounded" @dblclick="kickPlayer(player)" v-if="isHost()" :title="'Double-click to kick ' + player.text">close</span>
                <span class="action material-symbols-rounded" @click="goToPlayer(player)" :title="'Teleport to ' + player.text">play_arrow</span>
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