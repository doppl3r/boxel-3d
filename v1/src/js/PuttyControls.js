import { BufferGeometry, Controls, Float32BufferAttribute, Group, Line, LineBasicMaterial, Points, PointsMaterial } from 'three';
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
    this.material = new PointsMaterial({ color: '#0000ff', depthTest: false, depthWrite: false, transparent: true, size: 8, sizeAttenuation: true });
    this.pointA = new Points(this.geometry, this.material);
    this.pointB = new Points(this.geometry, this.material);
    this.pointA.renderOrder = Infinity;
    this.pointB.renderOrder = Infinity;
    this.pointA.position.x = -0.5;
    this.pointB.position.x = 0.5;

    // Define line
    this.lineGeometry = new BufferGeometry().setFromPoints([this.pointA.position, this.pointB.position]);
    this.lineMaterial = new LineBasicMaterial({ color: '#0000ff', depthTest: false, depthWrite: false, transparent: true });
    this.line = new Line(this.lineGeometry, this.lineMaterial);
    this.line.renderOrder = Infinity;

    // Create points group
    this.group = new Group();
    this.group.visible = false;
    this.group.add(this.pointA, this.pointB, this.line);

    // Initialize drag controls
    this.dragControls = new DragControls([this.pointA, this.pointB], camera, domElement);
    this.dragControls.raycaster.params.Points.threshold = 4;
    this.dragControls.raycaster.params.Line.threshold = 0.1;
    this.dragControls.addEventListener('drag', this.onDrag);
    this.dragControls.addEventListener('dragend', this.onDragEnd);
    this.dragControls.addEventListener('hoveron', this.onHoverOn);
    this.dragControls.addEventListener('hoveroff', this.onHoverOff);

    // Define properties
    defineProperty('axis', 'X');
    defineProperty('angleLocked', true);
    defineProperty('distanceLocked', true);
  }

  onDrag = event => {
    // Update line position
    const positions = this.lineGeometry.attributes.position;
    positions.setXYZ(0, this.pointA.position.x, this.pointA.position.y, this.pointA.position.z);
    positions.setXYZ(1, this.pointB.position.x, this.pointB.position.y, this.pointB.position.z);
    positions.needsUpdate = true;
  }

  onDragEnd = event => {
    
  }

  onHoverOff = event => {
    event.object.material.color.set('#0000ff');
  }

  onHoverOn = event => {
    event.object.material.color.set('#ffff00');
  }

  attach(object) {
    this.object = object;
    this.group.visible = true;
    this.group.position.copy(object.position);
    this.group.rotation.copy(object.rotation);
    this.group.scale.copy(object.scale);
  }

  detach() {
    this.object = undefined;
    this.group.visible = false;
  }

  getHelper() {
    return this.group;
  }
}

export { PuttyControls };