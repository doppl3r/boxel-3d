import { BackSide, BoxGeometry, Color, Group, InstancedMesh, Mesh, MeshStandardMaterial, ShaderMaterial, SphereGeometry, Vector3 } from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

class Background extends Group {
	constructor(options) {
		super();

		// Merge options
		options = Object.assign({
			name: 'background',
			position: { x: 0, y: 0, z: 0 },
			radius: 1
		}, options);
		
		// Initialize with options
		this.options = options; // Store for getOptions for pre-mesh transformations
		this.init(options);
	}

	init(options) {
		// Empty existing meshes
		this.clear();

		// Assign default values
		this.name = options.name;

		// Add sphereMesh
		this.addSphereMesh();
		this.addCubeMesh();
	}

	update(delta, alpha) {
		// Update rotation and position
		if (this.target){
			this.rotation.y = this.target.position.x / 1000;
			//this.rotation.y += delta * 0.125;
			this.position.copy(this.target.position);
		}
	}

	addSphereMesh() {
		var geometry = new SphereGeometry(this.options.radius, 16, 16);

		// Update bounding box for shader material
		geometry.computeBoundingBox();

		// Configure shader material gradient
		var material = new ShaderMaterial({
			uniforms: {
				top: {  value: new Color("#4A0941") },
				bottom: { value: new Color("#190618") },
				min: { value: geometry.boundingBox.min },
				max: { value: geometry.boundingBox.max },
				scale: { value: 1 }
			},
			vertexShader: `
				uniform vec3 min;
				uniform vec3 max;
				varying vec2 vUv;
				void main() {
					vUv.y = (position.y - min.y) / (max.y - min.y);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 bottom;
				uniform vec3 top;
				uniform float scale;
				varying vec2 vUv;
				void main() {
					gl_FragColor = vec4(mix(bottom, top, smoothstep(0.5 - (scale / 2.0), 0.5 + (scale / 2.0), vUv.y)), 1.0);
				}
			`,
			side: BackSide
		});
		
		// Copy options position and return mesh
		var mesh = new Mesh(geometry, material);
		mesh.position.set(this.options.position.x, this.options.position.y, this.options.position.z);
		mesh.name = 'background-mesh';
		this.add(mesh);
	}

	addCubeMesh() {
		// Initialize sampler from background mesh
		var mesh = this.getObjectByName('background-mesh');
		var sampler = new MeshSurfaceSampler(mesh);
		var object = new Group();
		var count = 100;
		var range = 0.4;

		// Create noise from alea seed
		sampler.build();

		// Create geometry and material
		var geometry = new BoxGeometry(1, 1, 1); // radius, width segments, height segments
		var material = new MeshStandardMaterial({
			color: '#620460',
			flatShading: true
		});

		// Generate cloud instanced meshes (great for performance)
		var clouds = new InstancedMesh(geometry, material, count);
		for (var i = 0; i <= count; i++) {
			// Update position and push to flat array
			sampler.sample(object.position);

			// Update scale + position
			if (object.position.y < -this.options.radius * range || object.position.y > this.options.radius * range) {
				var scale = ((Math.random() * 0.5) + 0.5) * (this.options.radius * 0.125); // Range = 0.5 to 1.0 scale
				var rotation = new Vector3().random().multiplyScalar(Math.PI);
				object.scale.set(scale, scale, scale);
				object.lookAt(new Vector3(0, 0, 0));
				object.rotateOnAxis({ x: 1, y: 0, z: 0 }, Math.PI / 4)
				object.updateMatrix();
				clouds.setMatrixAt(i, object.matrix);
			}
			else count++;
		}

		// Add cloud clouds to background group
		clouds.scale.multiplyScalar(0.5);
		this.add(clouds);
	}

	setTarget(target) {
		this.target = target;
	}
}

export { Background };