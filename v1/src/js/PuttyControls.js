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
const _vectorCross = new Vector3();
const _vectorDelta = new Vector3();
const _vectorMidpoint = new Vector3();
const _vectorAxisDirection = new Vector3();
const _vectorCurrentStable = new Vector3();
const _vectorTargetStable = new Vector3();
const _vectorWorld = new Vector3();
const _vectorWorldForward = new Vector3(0, 0, 1);
const _vectorWorldSnapped = new Vector3();
const _vectorWorldUp = new Vector3(0, 1, 0);
const _quaternionAlign = new Quaternion();
const _quaternionTwist = new Quaternion();
const _quaternionFinal = new Quaternion();
const _axisLocalPrimary = new Vector3();
const _axisLocalStable = new Vector3();
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
    return _axisSettings[this.axis];
  }

  getAxisDirection() {
    _vectorAxisDirection.copy(this.getAxisSettings().localPrimaryAxis);
    if (this.object) _vectorAxisDirection.applyQuaternion(this.object.quaternion);
    return _vectorAxisDirection.normalize();
  }

  getAxisHalfExtent(object) {
    const axisSettings = this.getAxisSettings();
    const scaleKey = axisSettings.scaleKey;
    return (object?.scale?.[scaleKey] || 0) / 2;
  }

  updateLineFromPoints() {
    const linePositions = this.lineGeometry.attributes.position;
    linePositions.setXYZ(0, this.pointA.position.x, this.pointA.position.y, this.pointA.position.z);
    linePositions.setXYZ(1, this.pointB.position.x, this.pointB.position.y, this.pointB.position.z);
    linePositions.needsUpdate = true;
  }

  updateObjectFromPoints() {
    if (!this.object) return;

    // Calculate the midpoint and direction between the two points.
    _vectorDelta.subVectors(this.pointB.position, this.pointA.position);
    const pointDistance = _vectorDelta.length();
    if (pointDistance <= 0.000001) return;
    _vectorMidpoint.copy(this.pointA.position).add(this.pointB.position).multiplyScalar(0.5);
    this.object.position.copy(_vectorMidpoint);
    
    // Align the object's primary axis with the line direction.
    const lineDirection = _vectorDelta.divideScalar(pointDistance);
    _axisLocalPrimary.copy(this.getAxisSettings().localPrimaryAxis).normalize();
    _quaternionAlign.setFromUnitVectors(_axisLocalPrimary, lineDirection);

    // Remove roll/twist by nudging a secondary axis toward world-up.
    _axisLocalStable.copy(this.getAxisSettings().localStableAxis).normalize();
    _vectorCurrentStable.copy(_axisLocalStable).applyQuaternion(_quaternionAlign);

    // Project the current and target stable vectors onto a plane orthogonal to the line direction.
    _vectorTargetStable.copy(_vectorWorldUp).projectOnPlane(lineDirection);
    if (_vectorTargetStable.lengthSq() < 0.000001) _vectorTargetStable.copy(_vectorWorldForward).projectOnPlane(lineDirection);
    if (_vectorTargetStable.lengthSq() < 0.000001) _vectorTargetStable.set(1, 0, 0).projectOnPlane(lineDirection);
    _vectorTargetStable.normalize();

    // Project the current stable vector onto the same plane to find the twist angle difference.
    _vectorCurrentStable.projectOnPlane(lineDirection);
    if (_vectorCurrentStable.lengthSq() < 0.000001) _vectorCurrentStable.copy(_vectorTargetStable);
    _vectorCurrentStable.normalize();

    // Determine the twist angle and apply it as a second rotation after the initial alignment.
    let twistAngle = _vectorCurrentStable.angleTo(_vectorTargetStable);
    _vectorCross.crossVectors(_vectorCurrentStable, _vectorTargetStable);
    if (_vectorCross.dot(lineDirection) < 0) twistAngle = -twistAngle;

    // Apply the combined rotation to the object.
    _quaternionTwist.setFromAxisAngle(lineDirection, twistAngle);
    _quaternionFinal.copy(_quaternionTwist).multiply(_quaternionAlign);
    this.object.quaternion.copy(_quaternionFinal);

    // Update the object scale
    this.object.scale[this.getAxisSettings().scaleKey] = pointDistance;
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
    this.updateLineFromPoints();

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

    // Calculate axis direction and object half extent for positioning the points.
    const axisDirection = this.getAxisDirection();
    const halfExtent = this.getAxisHalfExtent(object);

    // Place points at the object's world-space edge positions for the active axis.
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

    this.updateLineFromPoints();
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