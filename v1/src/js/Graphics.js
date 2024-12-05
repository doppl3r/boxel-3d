import { Fog, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutlinePass } from './postprocessing/OutlinePass.js';

class Graphics {
  constructor(canvas) {
    // Initialize camera and scene
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
    this.scene = new Scene();
    this.canvas = canvas;

    // Add fog
    this.fog = new Fog('#ffffff', 180, 480);
    this.scene.fog = this.fog;

    // Initialize renderer components
    this.renderer = new WebGLRenderer({ alpha: true, canvas: canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // Initialize CSS2DRenderer
    this.rendererCSS = new CSS2DRenderer();
    this.rendererCSS.domElement.className = 'rendererCSS';
    this.rendererCSS.domElement.style.position = "absolute";
    this.rendererCSS.domElement.style.pointerEvents = "none";
    this.rendererCSS.domElement.style.top = "0px";
    this.rendererCSS.domElement.style.left = "0px";
    this.canvas.after(this.rendererCSS.domElement);

    // Assign post processing on top of renderer
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.outputPass = new OutputPass(); // {} = use default resolution

    // Initialize (optional) effects
    this.outlinePass = new OutlinePass({ x: window.innerWidth, y: window.innerHeight }, this.scene, this.camera);
    this.outlinePass.edgeStrength = 3; // Default 3
		this.outlinePass.edgeGlow = 0; // Default 0
		this.outlinePass.edgeThickness = 1; // Default 1
    this.outlinePass.enabled = true;
		this.outlinePass.visibleEdgeColor.set('#000000');
		this.outlinePass.hiddenEdgeColor.set('#dc265a');
    this.smaaPass = new SMAAPass(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    
    // Disable passes by default
    this.outlinePass.enabled = false;
    this.smaaPass.enabled = false;

    // Add effects to composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass); // Renderer
    this.composer.addPass(this.outlinePass); // Outline
    this.composer.addPass(this.smaaPass); // Anti-aliasing
    this.composer.addPass(this.outputPass); // Gamma/sRGB correction

    // Add window resize logic
    window.addEventListener('resize', function(e) { this.resize(e); }.bind(this));
    this.resize(); // Run resize immediately
  }

  update(delta) {
    this.render();
  }

  render() {
    this.composer.render();
    this.rendererCSS.render(this.scene, this.camera);
  }

  resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.setSize(width, height);
  }

  setSize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.rendererCSS.setSize(width, height);
    this.composer.setSize(width, height);
  }

  setCamera(camera) {
    this.camera = camera;
    this.renderPass.camera = camera;
    this.outlinePass.renderCamera = camera;
  }

  setScene(scene) {
    this.scene = scene;
    this.scene.fog = this.fog;
    this.renderPass.scene = scene;
    this.outlinePass.renderScene = scene;
  }

  setShadows(state = true) {
    this.renderer.shadowMap.enabled = state;
    this.scene.traverse(function (child) {
      if (child.material) {
        child.castShadow = state;
        child.receiveShadow = state;
        child.material.needsUpdate = true;
      }
    });
  }

  setPixelRatio(ratio = 1) {
    this.renderer.setPixelRatio(ratio);
  }

  setSelectedObjects(objects = []) {
    // Set outline selected objects
    this.outlinePass.selectedObjects = objects;
  }
}

export { Graphics };