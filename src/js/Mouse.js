import { Raycaster, Vector3 } from 'three';

class Mouse {
  constructor() {
    this.down = new Vector3();
    this.move = new Vector3();
    this.offset = new Vector3();
    this.up = new Vector3();
    this.drag = false;
    this.mode = 'draw';
    this.snap = 1; // Drag snapping
    this.prevMode = this.mode;
  }
  
  mouseDown(e) {
    this.setTolerance();
    if (app.play == false) { app.levelEditor.mouseDown(e); }
    else {
      var position = this.getPosition(e);
      app.player.jump(position);
      app.player.addRope(position);
    }
  }

  mouseMove(e) {
    if (app.play == false) { app.levelEditor.mouseMove(e); }
  }

  mouseUp(e) {
    if (app.play == false) {
      if (app.state == 'level-editor') {
        app.levelEditor.mouseUp(e);
      }
    }
    app.player.removeRope(); // Always remove rope
  }

  getPosition(e) {
    var raycaster = new Raycaster();
    var pos = new Vector3(); // create once and reuse
    var intersects = [];

    // Check intersection with player "plane" for rope collision
    raycaster.setFromCamera(this.getMouse(e), app.camera);
    intersects = raycaster.intersectObject(app.player, true);

    // Copy and return position
    if (intersects.length > 0) pos.copy(intersects[0].point);
    return(pos);
  }

  clickObject(e) {
    var raycaster = new Raycaster();
    var vec = new Vector3();
    var object;
    var x = (e.clientX / app.window.innerWidth) * 2 - 1;
    var y = -(e.clientY / app.window.innerHeight) * 2 + 1;
    vec.set(x, y, 0);
    raycaster.setFromCamera(vec, app.camera);
    var intersects = raycaster.intersectObjects(app.scene.children, true);

    // Loop through objects selected
    for (var i = 0; i < intersects.length; i++) {
      var obj = intersects[i].object;

      // Traverse meshes with visible material
      if (obj.isMesh && obj.material.visible) {
        // Find parent cube
        obj.traverseAncestors(function(o) {
          if (object == null && o.isCube) object = o;
        });
      }

      // Break loop if object is defined
      if (object) break;
    }
    return(object);
  }

  wheel(e) {
    e.preventDefault();
  }

  setTolerance(value = 0.05) {
    this.tolerance = app.camera.position.z * value;
  }

  setPosition(state, position) {
    if (state == 'down') {
      this.down = position;
      this.move = position; // Reset move
      this.drag = true;
    }
    else if (state == 'move') {
      if (this.drag == true) this.move = position;
    }
    else if (state == 'up') {
      this.up = position;
      this.drag = false;
    }
  }

  setOffset(position) {
    this.offset.x = position.x - this.down.x;
    this.offset.y = position.y - this.down.y;
    this.offset.z = position.z - this.down.z;
  }

  getDragDifference() {
    return { 
      x: Math.round(this.down.x - this.move.x - this.offset.x), 
      y: Math.round(this.down.y - this.move.y - this.offset.y), 
      z: Math.round(this.down.z - this.move.z - this.offset.z)
    }
  }

  getTolerance() {
    var diff = this.getDragDifference();
    return (Math.abs(diff.x + this.offset.x) + Math.abs(diff.y + this.offset.y) > this.tolerance);
  }

  snapToValue(value, step) {
    return Math.round(value / step) * step;
  }
  
  setSnap(snap) {
    this.snap = snap;
  }

  setMode(mode) {
    this.mode = this.prevMode = mode;
  }

  getMode() {
    return this.mode;
  }

  getMouse(e) {
    return {
      x: (e.clientX / app.window.innerWidth) * 2 - 1,
      y: -(e.clientY / app.window.innerHeight) * 2 + 1,
      z: 0.5
    };
  }
}

export { Mouse };