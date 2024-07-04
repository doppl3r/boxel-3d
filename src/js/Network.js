import { EventDispatcher, MathUtils } from 'three';
import { Peer } from 'peerjs';

class Network extends EventDispatcher {
  constructor() {
    super();

    // Create map of connections
    this.connections = new Map();
  }

  update(delta, alpha) {

  }

  render(delta, alpha) {

  }

  open(id) {
    // Generate new id
    if (id == null) id = MathUtils.generateUUID();

    // Reset peer if already created
    if (this.peer) this.peer.destroy();

    // Initialize peer with unique id
    this.peer = new Peer(id); // Generate random ID
    this.addPeerListeners(this.peer);
  }

  connect(id) {
    // Create connection
    var connection = this.peer.connect(id);
    this.addConnectionListeners(connection);

    // Clear connections before connecting to peer
    this.connections.clear();
  }

  disconnect() {
    this.peer.disconnect();
  }

  addPeerListeners(peer) {
    peer.on('open', function(id) {
      // Confirm connection is ready
      this.dispatchEvent({ type: 'peer_open', id: id });
    }.bind(this));

    // Add event listeners to host from client(s)
    peer.on('connection', function(connection) {
      this.addConnectionListeners(connection);
      this.dispatchEvent({ type: 'peer_connection', connection: connection })
    }.bind(this));

    // Listen to peer close
    peer.on('close', function() {
      this.connections.clear(); // Clear connections map
      this.dispatchEvent({ type: 'peer_close' });
    }.bind(this))

    // Listen to peer disconnection
    peer.on('disconnected', function() {
      this.dispatchEvent({ type: 'peer_disconnected' });
    }.bind(this));

    // Listen to peer errors
    peer.on('error', function(error){
      this.dispatchEvent({ type: 'peer_error', error: error });
    }.bind(this));
  }

  addConnectionListeners(connection) {
    // Dispatch connection open
    connection.on('open', function() {
      this.connections.set(connection.peer, connection); // Add to connections map using peer id
      this.dispatchEvent({ type: 'connection_open' });
    }.bind(this));

    // Dispatch connection close
    connection.on('close', function() {
      this.connections.delete(connection.peer); // Remove from connections map using peer id
      this.dispatchEvent({ type: 'connection_close' });
    }.bind(this));

    // Dispatch connection data
    connection.on('data', function(data) {
      this.dispatchEvent({ type: 'connection_data', data: data });
    }.bind(this));

    // Dispatch connection error
    connection.on('error', function(error) {
      this.dispatchEvent({ type: 'connection_error', error: error });
    });
  }

  on(type, listener) {
    // Shorthand add listener
    this.addEventListener(type, listener);
  }

  off(type, listener) {
    // Shorthand remove listener
    this.removeEventListener(type, listener);
  }

  isOnline() {
    return this.peer != null && this.peer.open == true;
  }
}

export { Network };