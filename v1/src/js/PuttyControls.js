import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import {
  BufferGeometry,
  Controls,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  Quaternion,
  Vector3
} from 'three';

/*
  The putty controls class lets you scale and rotate an object between two points.
*/

// Initialize module-scoped variables
const _changeEvent = { type: 'change' };
const _objectChangeEvent = { type: 'objectChange' };
const _vectorWorld = new Vector3();
const _vectorWorldSnapped = new Vector3();
const _deltaVector = new Vector3();
const _midpointVector = new Vector3();
const _axisDirectionVector = new Vector3();
const _currentStableVector = new Vector3();
const _targetStableVector = new Vector3();
const _crossVector = new Vector3();
const _localPrimaryAxis = new Vector3();
const _localStableAxis = new Vector3();
const _quaternionAlign = new Quaternion();
const _quaternionTwist = new Quaternion();
const _quaternionFinal = new Quaternion();
const _worldUp = new Vector3(0, 1, 0);
const _worldForward = new Vector3(0, 0, 1);
const _axisSettings = {
  X: {
    scaleKey: 'x',
    localPrimaryAxis: new Vector3(1, 0, 0),
    localStableAxis: new Vector3(0, 1, 0)
  },
  Y: {
    scaleKey: 'y',
    localPrimaryAxis: new Vector3(0, 1, 0),
    localStableAxis: new Vector3(0, 0, 1)
  },
  Z: {
    scaleKey: 'z',
    localPrimaryAxis: new Vector3(0, 0, 1),
    localStableAxis: new Vector3(0, 1, 0)
  }
};

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
    this.dragControls.addEventListener('dragstart', this.onDragStart);
    this.dragControls.addEventListener('drag', this.onDrag);
    this.dragControls.addEventListener('dragend', this.onDragEnd);
    this.dragControls.addEventListener('hoveron', this.onHoverOn);
    this.dragControls.addEventListener('hoveroff', this.onHoverOff);

    // Define properties
    defineProperty('axis', 'X');
    defineProperty('snap', null);
  }

  getAxisSettings() {
    return _axisSettings[this.axis] || _axisSettings.X;
  }

  getAxisDirection() {
    const { localPrimaryAxis } = this.getAxisSettings();
    _axisDirectionVector.copy(localPrimaryAxis);
    if (this.object) _axisDirectionVector.applyQuaternion(this.object.quaternion);
    return _axisDirectionVector.normalize();
  }

  getObjectHalfExtent(object) {
    const { scaleKey } = this.getAxisSettings();
    return (object?.scale?.[scaleKey] || 0) / 2;
  }

  syncLineFromPoints() {
    const linePositions = this.lineGeometry.attributes.position;
    linePositions.setXYZ(0, this.pointA.position.x, this.pointA.position.y, this.pointA.position.z);
    linePositions.setXYZ(1, this.pointB.position.x, this.pointB.position.y, this.pointB.position.z);
    linePositions.needsUpdate = true;
  }

  updateObjectFromPoints() {
    if (!this.object) return;

    const { scaleKey, localPrimaryAxis, localStableAxis } = this.getAxisSettings();

    _deltaVector.subVectors(this.pointB.position, this.pointA.position);
    const pointDistance = _deltaVector.length();
    if (pointDistance <= 0.000001) return;

    const lineDirection = _deltaVector.divideScalar(pointDistance);

    _midpointVector.copy(this.pointA.position).add(this.pointB.position).multiplyScalar(0.5);
    this.object.position.copy(_midpointVector);

    // Step 1: align the selected local axis to the A->B line direction.
    _localPrimaryAxis.copy(localPrimaryAxis).normalize();
    _quaternionAlign.setFromUnitVectors(_localPrimaryAxis, lineDirection);

    // Step 2: remove roll/twist by nudging a secondary axis toward world-up.
    _localStableAxis.copy(localStableAxis).normalize();
    _currentStableVector.copy(_localStableAxis).applyQuaternion(_quaternionAlign);

    _targetStableVector.copy(_worldUp).projectOnPlane(lineDirection);
    if (_targetStableVector.lengthSq() < 0.000001) {
      _targetStableVector.copy(_worldForward).projectOnPlane(lineDirection);
    }
    if (_targetStableVector.lengthSq() < 0.000001) {
      _targetStableVector.set(1, 0, 0).projectOnPlane(lineDirection);
    }
    _targetStableVector.normalize();

    _currentStableVector.projectOnPlane(lineDirection);
    if (_currentStableVector.lengthSq() < 0.000001) {
      _currentStableVector.copy(_targetStableVector);
    }
    _currentStableVector.normalize();

    let twistAngle = _currentStableVector.angleTo(_targetStableVector);
    _crossVector.crossVectors(_currentStableVector, _targetStableVector);
    if (_crossVector.dot(lineDirection) < 0) twistAngle = -twistAngle;

    _quaternionTwist.setFromAxisAngle(lineDirection, twistAngle);
    _quaternionFinal.copy(_quaternionTwist).multiply(_quaternionAlign);
    this.object.quaternion.copy(_quaternionFinal);

    this.object.scale[scaleKey] = pointDistance;
  }

  onDragStart = event => {
    this.dispatchEvent(event);
  }

  onDrag = event => {
    // Update snap position
    if (this.snap) {
      // Snap position according to world space
      event.object.getWorldPosition(_vectorWorld);
      _vectorWorldSnapped.set(
        Math.round(_vectorWorld.x / this.snap) * this.snap,
        Math.round(_vectorWorld.y / this.snap) * this.snap,
        Math.round(_vectorWorld.z / this.snap) * this.snap);
      
      // Convert back to local space and update position
      event.object.parent.worldToLocal(_vectorWorldSnapped);
      event.object.position.copy(_vectorWorldSnapped);
    }

    // Update controlled object and helper visuals.
    this.updateObjectFromPoints();
    this.syncLineFromPoints();

    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_objectChangeEvent);
  }

  onDragEnd = event => {
    // Bubble up event
    this.dispatchEvent(event);
  }

  onHoverOff = event => {
    // Update point color
    event.object.material.color.set('#0000ff');

    // Bubble up event
    this.dispatchEvent(event);
  }

  onHoverOn = event => {
    // Update point color
    event.object.material.color.set('#ffff00');

    // Bubble up event
    this.dispatchEvent(event);
  }

  attach(object) {
    this.object = object;
    this.group.visible = true;

    // Place points at the object's world-space edge positions for the active axis.
    const axisDirection = this.getAxisDirection();
    const halfExtent = this.getObjectHalfExtent(object);

    this.pointA.position.set(
      object.position.x - axisDirection.x * halfExtent,
      object.position.y - axisDirection.y * halfExtent,
      object.position.z - axisDirection.z * halfExtent
    );
    this.pointB.position.set(
      object.position.x + axisDirection.x * halfExtent,
      object.position.y + axisDirection.y * halfExtent,
      object.position.z + axisDirection.z * halfExtent
    );

    this.syncLineFromPoints();
  }

  detach() {
    this.object = undefined;
    this.group.visible = false;
  }

  getHelper() {
    return this.group;
  }

  setSnap(snap) {
    this.snap = snap;
  }

  setAxis(axis) {
    this.axis = axis;
    if (this.object) this.attach(this.object);
  }
}

export { PuttyControls };