import { Clock, PCFSoftShadowMap, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import Stats from './Stats.js';

class Loop {
    constructor(scene, camera, canvas) {
        this.stats = new Stats();
        this.clock = new Clock();
		this.clock.scale = 1;
		this.setRenderFPS(-1); // Set -1 for unlimited
		this.setEngineFPS(30); // Keep low for better performance
        this.renderer = new WebGLRenderer({ alpha: true, canvas: canvas });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.scene = scene;
		this.camera = camera;
		
        // Assign post processing on top of renderer
		this.renderPass = new RenderPass(scene, camera);
		this.outputPass = new OutputPass(); // {} = use default resolution
		this.pixelatedPass = new RenderPixelatedPass(2, scene, camera);
		this.pixelatedPass.normalEdgeStrength = 1; // 0.0 to 2.0, Default = 0.3
		this.pixelatedPass.depthEdgeStrength = 1; // 0.0 to 1.0, Default = 0.4

		// Add effects to composer
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(this.renderPass); // Renderer
		this.composer.addPass(this.pixelatedPass); // Pixelated effect
		this.composer.addPass(this.outputPass); // Gamma correction

        // Initialize callbacks
        this.renderCallback = function(){};
        this.engineCallback = function(){};

		// Append stats to document
		this.showFPS(true);
		document.body.appendChild(this.stats.dom);

        // Add event listeners
        var _this = this;
        document.addEventListener('visibilitychange', function(e) { _this.visibilityChange(e); });
		window.addEventListener('showFPS', function(e) { _this.showFPS(e.detail); })
    }

	start() {
        var _this = this;
        this.renderer.setAnimationLoop(function() {
            _this.update();
        })
    }

    update() {
		// Update time factors
		var delta = this.clock.getDelta() * this.clock.scale;
        var alpha = this.engineDeltaSum / this.engineInterval; // Interpolation factor

		// Refresh renderer on a higher interval
		this.renderDeltaSum += delta;
        if (this.renderDeltaSum > this.renderInterval) {
            this.renderDeltaSum %= this.renderInterval;
            this.composer.render(); // Similar to this.renderer.render(this.scene, this.camera);
			this.renderCallback(this.renderInterval == -1 ? delta : this.renderInterval, alpha);

			// End FPS counter
			this.stats.end();
        }
		
		// Update engine on a lessor interval
        this.engineDeltaSum += delta;
        if (this.engineDeltaSum > this.engineInterval) {
            alpha = (this.engineDeltaSum - delta) / this.engineInterval; // Request new position from engine
            this.engineDeltaSum %= this.engineInterval; // reset with remainder
            this.engineCallback(this.engineInterval, alpha);
        }

		// Begin FPS counter for refresh
		this.stats.begin();
	}

    setRenderCallback(callback) {
        this.renderCallback = callback;
    }

    setEngineCallback(callback) {
        this.engineCallback = callback;
    }

    setSize(width, height) {
		this.renderer.setSize(width, height);
		this.composer.setSize(width, height);
	}

	setRenderFPS(fps) {
		this.renderDeltaSum = 0;
		this.renderTickRate = fps; // Ex: 24 = 24fps, -1 = unlimited
		this.renderInterval = 1 / this.renderTickRate;
	}

	setEngineFPS(fps) {
		this.engineDeltaSum = 0;
		this.engineTickRate = fps; // Calculations per second
		this.engineInterval = 1 / this.engineTickRate;
	}

    pause(play = false) {
		this.play = play;
		this.clock.stop();
		this.clock.elapsedTimePaused = this.clock.getElapsedTime();
	}

	resume(play = true) {
		this.play = play;
		this.clock.start();
		this.clock.elapsedTime = this.clock.elapsedTimePaused || 0;
	}

	visibilityChange(e) {
		if (document.visibilityState == 'visible') this.resume(this.play);
		else this.pause(this.play);
	}

	showFPS(state) {
		// Append stats
		if (state == false) this.stats.dom.style.display = 'none';
		else this.stats.dom.style.display = 'block';
	}

	showShadows(state = true) {
		this.renderer.shadowMap.enabled = state;
		this.scene.traverse(function (child) {
			if (child.material) {
				child.material.needsUpdate = true;
			}
		});
	}

	showPixelPass(state = true) {
		this.pixelatedPass.enabled = state;
	}

	setPixelRatio(ratio = 1) {
		this.renderer.setPixelRatio(ratio);
	}
}

export { Loop };