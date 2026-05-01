import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { BufferGeometry, Color, Controls, Float32BufferAttribute, Group, Line, LineBasicMaterial, Points, PointsMaterial, Quaternion, Vector3 } from 'three';

/*
  Putty Controls lets you scale and rotate an object between two points.
*/

// Initialize module-scoped variables
const _changeEvent = { type: 'change' };
const _objectChangeEvent = { type: 'objectChange' };
const _vector = new Vector3();
const _vectorAxisDirection = new Vector3();
const _vectorWorld = new Vector3();
const _vectorWorldSnapped = new Vector3();
const _vectorLineDirection = new Vector3();
const _vectorLineAnchor = new Vector3();
const _vectorScale = new Vector3();
const _vectorOffset = new Vector3();
const _axisSettings = {
  X: {
    color: '#ff0000',
    colorHover: '#990000',
    scaleKey: 'x',
    localPrimaryAxis: new Vector3(1, 0, 0)
  },
  Y: {
    color: '#00ff00',
    colorHover: '#009900',
    scaleKey: 'y',
    localPrimaryAxis: new Vector3(0, 1, 0)
  },
  Z: {
    color: '#0000ff',
    colorHover: '#000099',
    scaleKey: 'z',
    localPrimaryAxis: new Vector3(0, 0, 1)
  }
};

class PuttyControls extends Controls {
  constructor(camera, domElement) {
    // Inherit Three.js core Controls class
    super(camera, domElement);
    this.camera = camera;
    this.domElement = domElement;

    // Add reactive properties
    const defineProperty = (name, value) => {
      Object.defineProperty(this, name, {
        get: () => value,
        set: newValue => {
          if (value !== newValue) {
            value = newValue;
            this.dispatchEvent({ type: name + '-changed', value: newValue });
            this.dispatchEvent({ type: name + '-change', value: newValue });
            this.dispatchEvent(_changeEvent);
          }
        }
      });
    }

    // Define points material
    this.pointMaterial = new PointsMaterial({ depthTest: false, depthWrite: false, transparent: true, size: 8, sizeAttenuation: false, vertexColors: true });
    
    // Define pointA
    const pointGeometryA = new BufferGeometry();
    pointGeometryA.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    pointGeometryA.setAttribute('color', new Float32BufferAttribute([1, 0, 0], 3));
    this.pointA = new Points(pointGeometryA, this.pointMaterial);
    this.pointA.renderOrder = Infinity;
    this.pointA.position.x = -0.5;
    
    // Define pointB
    const pointGeometryB = new BufferGeometry();
    pointGeometryB.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    pointGeometryB.setAttribute('color', new Float32BufferAttribute([1, 0, 0], 3));
    this.pointB = new Points(pointGeometryB, this.pointMaterial);
    this.pointB.renderOrder = Infinity;
    this.pointB.position.x = 0.5;

    // Define line
    this.lineGeometry = new BufferGeometry().setFromPoints([this.pointA.position, this.pointB.position]);
    this.lineMaterial = new LineBasicMaterial({ color: '#ff0000', depthTest: false, depthWrite: false, transparent: true });
    this.line = new Line(this.lineGeometry, this.lineMaterial);
    this.line.renderOrder = Infinity;

    // Create points group
    this.group = new Group();
    this.group.visible = false;
    this.group.add(this.line, this.pointA, this.pointB);

    // Override updateMatrixWorld to update thresholds every frame
    const originalUpdateMatrixWorld = this.group.updateMatrixWorld.bind(this.group);
    this.group.updateMatrixWorld = force => {
      this.updateThresholds();
      originalUpdateMatrixWorld(force);
    };

    // Initialize drag controls (points first for priority)
    this.dragControls = new DragControls([this.pointA, this.pointB, this.line], camera, domElement);
    
    // Override raycaster intersectObjects to prioritize points over line
    const originalIntersect = this.dragControls.raycaster.intersectObjects.bind(this.dragControls.raycaster);
    this.dragControls.raycaster.intersectObjects = (objects, recursive, intersects) => {
      const results = originalIntersect(objects, recursive, intersects);
      const pointHits = results.filter(r => r.object.isPoints);

      // Return points instead of line
      if (pointHits.length > 0) {
        if (intersects) {
          intersects.length = 0;
          intersects.push(...pointHits);
        }
        return pointHits;
      }
      return results;
    };

    // Add event listeners for dragging and hovering
    this.dragControls.addEventListener('dragstart', this.onDragStart);
    this.dragControls.addEventListener('drag', this.onDrag);
    this.dragControls.addEventListener('dragend', this.onDragEnd);
    this.dragControls.addEventListener('hoveron', this.onHoverOn);
    this.dragControls.addEventListener('hoveroff', this.onHoverOff);

    // Define properties
    defineProperty('axis', 'X');
    defineProperty('enabled', true);
    defineProperty('lockRatio', false);
    defineProperty('lockRotation', false);
    defineProperty('maxX', Infinity);
    defineProperty('maxY', Infinity);
    defineProperty('maxZ', Infinity);
    defineProperty('minX', -Infinity);
    defineProperty('minY', -Infinity);
    defineProperty('minZ', -Infinity);
    defineProperty('snap', null);
    defineProperty('threshold', 0.01);

    // Keep DragControls interactivity in sync with PuttyControls enabled state.
    this.dragControls.enabled = this.enabled;
    this.addEventListener('enabled-change', event => { this.dragControls.enabled = event.value; });
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

  updateThresholds() {
    if (!this.object || !this.camera) return;

    // Scale thresholds based on camera distance (adjust multiplier as needed)
    const scaleFactor = this.camera.position.distanceTo(this.object.position) * this.threshold;
    this.dragControls.raycaster.params.Points.threshold = scaleFactor;
    this.dragControls.raycaster.params.Line.threshold = scaleFactor;
  }

  updatePointsFromLine() {
    const linePositions = this.lineGeometry.attributes.position;
    
    // Convert first vertex position to world space, then to pointA local space
    _vector.set(linePositions.getX(0), linePositions.getY(0), linePositions.getZ(0));
    this.line.localToWorld(_vector);
    this.pointA.parent.worldToLocal(_vector);
    this.pointA.position.copy(_vector);
    
    // Convert second vertex position to world space, then to pointB local space
    _vector.set(linePositions.getX(1), linePositions.getY(1), linePositions.getZ(1));
    this.line.localToWorld(_vector);
    this.pointB.parent.worldToLocal(_vector);
    this.pointB.position.copy(_vector);
  }

  updateLineFromPoints() {
    // Update line from pointA world-to-local position
    _vector.copy(this.pointA.position);
    this.pointA.parent.localToWorld(_vector);
    this.line.worldToLocal(_vector);
    this.lineGeometry.attributes.position.setXYZ(0, _vector.x, _vector.y, _vector.z);
    
    // Update line from pointB world-to-local position
    _vector.copy(this.pointB.position);
    this.pointB.parent.localToWorld(_vector);
    this.line.worldToLocal(_vector);
    this.lineGeometry.attributes.position.setXYZ(1, _vector.x, _vector.y, _vector.z);
    
    // Recompute line geometry
    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.computeBoundingSphere();
  }

  updateObjectFromPoints() {
    if (!this.object) return;
    
    // Position the object at the midpoint between the two points
    this.object.position.set(
      (this.pointA.position.x + this.pointB.position.x) / 2,
      (this.pointA.position.y + this.pointB.position.y) / 2,
      (this.pointA.position.z + this.pointB.position.z) / 2
    );
    
    // Scale the object based on the distance between points
    const distance = this.pointA.position.distanceTo(this.pointB.position);
    const axisSettings = this.getAxisSettings();
    
    // Scale uniformly in all directions while maintaining proportions
    if (this.lockRatio) {
      const scaleFactor = distance / _vectorOffset.length();
      this.object.scale.set(
        _vectorScale.x * scaleFactor,
        _vectorScale.y * scaleFactor,
        _vectorScale.z * scaleFactor
      );
    } else {
      // Scale only along the active axis
      this.object.scale[axisSettings.scaleKey] = distance;
    }
    
    // Rotate the object so the current axis points from pointA toward pointB
    const direction = new Vector3().subVectors(this.pointB.position, this.pointA.position).normalize();
    const quaternion = new Quaternion().setFromUnitVectors(axisSettings.localPrimaryAxis, direction);
    this.object.quaternion.copy(quaternion);
  }

  onDragStart = event => {
    if (!this.object) return;
    
    // Store the initial line direction and anchor point for lockRotation
    _vectorLineDirection.subVectors(this.pointB.position, this.pointA.position).normalize();
    _vectorLineAnchor.copy((event.object === this.pointA ? this.pointB : this.pointA).position);
    _vectorScale.copy(this.object.scale);
    _vectorOffset.subVectors(this.pointB.position, this.pointA.position);
    
    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_changeEvent);
  }

  onDrag = event => {
    if (!this.object) return;
    
    // Get world position for optional snapping and bounds clamping.
    event.object.getWorldPosition(_vectorWorld);

    // Apply lockRotation constraint
    if (this.lockRotation) {
      // Get vector from anchor to current point position
      _vector.subVectors(_vectorWorld, _vectorLineAnchor);
      
      // Snap projected point by distance (not grid)
      const distance = _vector.dot(_vectorLineDirection);
      _vectorWorld.copy(_vectorLineDirection);
      _vectorWorld.multiplyScalar(this.snap ? Math.round(distance / this.snap) * this.snap : distance);
      _vectorWorld.add(_vectorLineAnchor);
    }
    else {
      // Apply snapping only when rotation is not locked
      if (this.snap) {
        _vectorWorld.set(
          Math.round(_vectorWorld.x / this.snap) * this.snap,
          Math.round(_vectorWorld.y / this.snap) * this.snap,
          Math.round(_vectorWorld.z / this.snap) * this.snap
        );
      }
    }

    // Clamp to bounds if enabled.
    _vectorWorld.set(
      Math.max(this.minX, Math.min(this.maxX, _vectorWorld.x)),
      Math.max(this.minY, Math.min(this.maxY, _vectorWorld.y)),
      Math.max(this.minZ, Math.min(this.maxZ, _vectorWorld.z))
    );

    // Convert back to local space and update position.
    _vectorWorldSnapped.copy(_vectorWorld);
    event.object.parent.worldToLocal(_vectorWorldSnapped);
    event.object.position.copy(_vectorWorldSnapped);

    // Update controlled object and helper visuals.
    if (event.object.isLine) this.updatePointsFromLine();
    else this.updateLineFromPoints();
    this.updateObjectFromPoints();

    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_changeEvent);
    this.dispatchEvent(_objectChangeEvent);
  }

  onDragEnd = event => {
    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_changeEvent);
  }

  onHoverOff = event => {
    // Update line or point vertex color
    const color = this.getAxisSettings().color;
    this.lineMaterial.color.set(color);
    
    // Update point vertex colors
    if (event.object.isPoints) {
      const colorAttr = event.object.geometry.attributes.color;
      const rgb = new Color(color);
      colorAttr.setXYZ(0, rgb.r, rgb.g, rgb.b);
      colorAttr.needsUpdate = true;
    }

    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_changeEvent);
  }

  onHoverOn = event => {
    // Update line or point vertex color
    if (event.object.isLine) {
      this.lineMaterial.color.set(this.getAxisSettings().colorHover);
    }
    else if (event.object.isPoints) {
      const colorAttr = event.object.geometry.attributes.color;
      const rgb = new Color(this.getAxisSettings().colorHover);
      colorAttr.setXYZ(0, rgb.r, rgb.g, rgb.b);
      colorAttr.needsUpdate = true;
    }

    // Bubble up event
    this.dispatchEvent(event);
    this.dispatchEvent(_changeEvent);
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
    this.updateThresholds();
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
    const color = this.getAxisSettings().color;
    const rgb = new Color(color);
    
    // Update both point colors
    const colorAttrA = this.pointA.geometry.attributes.color;
    colorAttrA.setXYZ(0, rgb.r, rgb.g, rgb.b);
    colorAttrA.needsUpdate = true;
    
    const colorAttrB = this.pointB.geometry.attributes.color;
    colorAttrB.setXYZ(0, rgb.r, rgb.g, rgb.b);
    colorAttrB.needsUpdate = true;
    
    this.lineMaterial.color.set(color);
    if (this.object) this.attach(this.object);
  }
}

export { PuttyControls };