import { Group } from 'three';
import { Player } from './entities/Player.js';

/*
  The Multiplayer class manages the 3D object states
  provided by a Network dispatcher.
*/

class Multiplayer {
  constructor(network) {
    this.network = network;
    this.players = new Group();

    // Add peer events
    this.network.on('peer_open', this.onPeerOpen.bind(this));
    this.network.on('peer_close', this.onPeerClose.bind(this));
    this.network.on('peer_disconnected', this.onPeerDisconnected.bind(this));
    this.network.on('connection_open', this.onConnectionOpen.bind(this));
    this.network.on('connection_close', this.onConnectionClose.bind(this));
    this.network.on('connection_data', this.onConnectionData.bind(this));
  }

  update(delta, alpha) {
    // Send all guests new data
    if (this.isHost()) {
      this.sendHostDataToGuests();
    }
  }

  render(delta, alpha) {

  }

  onPeerOpen(e) {
    //console.log(e);
  }

  onPeerClose(e) {
    //console.log(e);
    this.players.clear();
  }
  
  onPeerDisconnected(e) {
    //console.log(e);
    this.players.clear();
  }

  onConnectionOpen(e) {
    //console.log(e);
    if (this.isHost()) {
      this.addPlayerFromConnection(e.connection)
    }
  }

  onConnectionClose(e) {
    //console.log(e);
    this.removePlayerFromConnection(e.connection);
  }

  onConnectionData(e) {
    //console.log(e);
    if (e.data.type == 'players') {
      if (this.isHost()) {
        this.updatePlayerFromGuest(e.data);
      }
      else {
        this.updatePlayersFromHost(e.data);
      }
    }
  }

  updatePlayerFromGuest(data) {
    // Get player from data received (guests only send 1 array item)
    var player = this.getPlayer(data.players[0].uuid);
    this.updatePlayer(player, data.players[0]);
  }

  updatePlayersFromHost(data) {
    // Loop through all players from data
    for (var i = data.players.length - 1; i >= 0; i--) {
      // Only update other player data
      if (data.players[i].uuid != app.player.uuid) {
        // Add player if the player does not exist from host
        var player = this.getPlayer(data.players[i].uuid);
        if (player == null) player = this.addPlayer(data.players[i].uuid);

        // Update player data now that it exists
        this.updatePlayer(player, data.players[i]);

        // Send guest data back to host
        this.sendGuestDataToHost();
      }
    }
  }

  setHost(hostId) {
    this.host = hostId;
  }

  isHost() {
    return this.host != null;
  }

  sendHostDataToGuests() {
    // Populate data with host player
    var data = {
      type: 'players',
      players: [this.playerToJSON(app.player)],
      time: new Date().toLocaleTimeString()
    }

    // Add all players to data players list
    for (var i = this.players.children.length - 1; i >= 0; i--) {
      var player = this.players.children[i];
      data.players.push(this.playerToJSON(player));
    }

    // Send all connections the host data
    this.network.connections.forEach(function(connection) {
      connection.send(data);
    });
  }

  sendGuestDataToHost() {
    // Initialize data from guest player
    var data = {
      type: 'players',
      players: [this.playerToJSON(app.player)],
      time: new Date().toLocaleTimeString()
    }

    // Send new guest data back to host connection (1)
    this.network.connections.forEach(function(connection) {
      connection.send(data);
    });
  }

  addPlayerFromConnection(connection) {
    return this.addPlayer(connection.metadata.uuid);
  }

  removePlayerFromConnection(connection) {
    return this.removePlayer(connection.metadata.uuid);
  }

  getPlayer(uuid) {
    // Return player
    var player = this.players.getObjectByProperty('uuid', uuid);
    return player;
  }

  addPlayer(uuid) {
    // Check if player exists first
    var player = this.getPlayer(uuid);
    
    // Create new player entity if it doesn't exist
    if (player == null) {
      player = new Player();
      player.uuid = uuid; // Assign 3D uuid from connection player uuid
      player.light.removeFromParent();
      this.players.add(player);
    }

    // Return player after being added
    return player;
  }

  updatePlayer(player, data) {
    // Update player properties
    player.setPosition(data.position);
    player.setRotation(data.rotation.z);
    player.setScale(data.scale);
  }

  removePlayer(uuid) {
    // Remove and return player if it exists
    var player = this.players.getObjectByProperty('uuid', uuid);
    if (player) player.removeFromParent();
    return player;
  }

  playerToJSON(player) {
    return {
      uuid: player.uuid,
      position: { x: player.position.x, y: player.position.y, z: 0 },
      rotation: { x: 0, y: 0, z: player.rotation.z },
      scale: { x: player.scale.z, y: player.scale.y, z: player.scale.z }
    }
  }
}

export { Multiplayer };