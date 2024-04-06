import { Group, InstancedMesh, Object3D } from 'three';

class Background extends Group {
  constructor() {
    super();
  }

  init(options) {
    if (options.model) {
      this.scale.set(1280, 1280, 1280);
      var count = 5;
      var object = new Object3D();

      // Traverse model for meshes
      options.model.traverse(function(obj) {
        if (obj.isMesh) {
          var instance = new InstancedMesh(obj.geometry, obj.material, count);
          
          // Update instance translations
          for (var i = 0; i < count; i++) {
            //object.scale.set(scale, scale, scale);
            object.position.set(i - Math.floor(count / 2), 0, 0);
            object.updateMatrix();
            instance.setMatrixAt(i, object.matrix);
          }

          // Add instance
          this.add(instance);
        }
      }.bind(this));
    }
  }

  update(fixed = false) {
    // Update background translations
    if (this.target){
      if (fixed == true) {
        this.position.copy(this.target.position);
      }
      else {
        this.position.y = this.target.position.y;
        this.position.x = this.target.position.x - (this.target.position.x % (this.scale.x));
      }
    }
  }

  setTarget(target) {
    this.target = target;
  }

  animateScale(scale, options) {
    app.animation.tween(this.scale, { x: 1280 * scale, y: 1280 * scale }, options);
  }
}

export { Background };