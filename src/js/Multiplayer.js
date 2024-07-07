import { Group } from 'three';

/*
  The Multiplayer class manages the 3D object states
  provided by a Network dispatcher.
*/

class Multiplayer {
  constructor(network) {
    this.players = new Group();
    this.isHost = false;
  }

  update(delta, alpha) {
    
  }

  render(delta, alpha) {

  }

  setHost(isHost) {
    this.isHost = isHost;
  }
}

export { Multiplayer };