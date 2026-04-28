import { BufferGeometry, Controls, Object3D, Float32BufferAttribute, Points, PointsMaterial } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

/*
  The putty controls class lets you scale and rotate an object between two points.
*/

// Initialize module-scoped variables
const _changeEvent = { type: 'change' };

class PuttyControls extends Controls {
  constructor(camera, domElement) {
    // Inherit Three.js core Controls class
    super(camera, domElement);

    // Add reactive properties
    const defineProperty = (name, value) => {
      Object.defineProperty(this, name, {
        get: () => value,
        set: newValue => {
          if (value !== newValue) {
            value = newValue;

            // Dispatch change event
            this.dispatchEvent({ type: name + '-changed', value: newValue });
            this.dispatchEvent(_changeEvent);
          }
        }
      });
    }

    // Define points
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    this.material = new PointsMaterial({ color: '#ffffff', depthTest: false, depthWrite: false, transparent: true, size: 8, sizeAttenuation: true });
    this.pointA = new Points(this.geometry, this.material);
    this.pointB = new Points(this.geometry, this.material);
    this.pointA.renderOrder = Infinity;
    this.pointB.renderOrder = Infinity;
    this.points = new Object3D();
    this.points.visible = false;
    this.points.add(this.pointA, this.pointB);

    // Initialize drag controls
    this.dragControls = new DragControls(this.points.children, camera, domElement);
    this.dragControls.raycaster.params.Points.threshold = 4;

    // Define properties
    defineProperty('axis', 'X');
    defineProperty('angleLocked', true);
    defineProperty('distanceLocked', true);
  }

  attach(object) {
    this.object = object;
    this.points.visible = true;
  }

  detach() {
    this.object = undefined;
    this.points.visible = false;
  }

  getHelper() {
    return this.points;
  }
}

export { PuttyControls };