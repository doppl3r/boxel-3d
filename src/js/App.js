import { Color, Fog, HemisphereLight, PerspectiveCamera, Scene } from 'three';
import { Engine, Events } from 'matter-js';
import { Animation } from './Animation.js';
import { Utility } from './Utility.js';
import { Timer } from './Timer.js';
import { Assets } from './Assets.js';
import { Loop } from './Loop.js';
import { Graphics } from './Graphics.js';
import { StorageManager } from './StorageManager.js';
import { Collision } from './Collision.js';
import { Background } from './Background.js';
import { Level } from './Level.js';
import { LevelHistory } from './LevelHistory.js';
import { Player } from './entities/Player.js';
import { UIController } from './UIController.js';
import { Mouse } from './Mouse.js';
import { Keyboard } from './Keyboard.js';
import { LevelEditor } from './LevelEditor.js';

class App {
  constructor() {
    
  }

  init(canvas, callback = function(){}) {
    this.window = window;
    this.document = document;
    this.BOX_SIZE = 16;
    this.engine = Engine.create();
    this.util = new Utility();
    this.screenWidth = this.window.innerWidth;
    this.screenHeight = this.window.innerHeight;
    this.ui = new UIController();
    this.state = 'home';
    this.animation = new Animation();
    this.timer = new Timer();
    this.mouse = new Mouse();
    this.keyboard = new Keyboard();
    this.storage = new StorageManager();
    this.collision = new Collision();
    this.player = new Player({ x: 0, y: 0, z: 0 });
    this.play = false;
    this.fov = 75; // Default 75
    this.camera = new PerspectiveCamera(this.fov, this.screenWidth / this.screenHeight, 1, 2000);
    this.camera.tilt = 0;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.zDefault = 180;
    this.camera.position.z = this.camera.position.zDefault;
    this.scene = new Scene();
    this.scene.fog = new Fog('#dc265a', 400, 1250);
    this.scene.background = new Color('#1a1a1a');
    this.graphics = new Graphics(canvas);
    this.graphics.setCamera(this.camera);
    this.graphics.setScene(this.scene);
    this.graphics.setSelectedObjects([this.player]);
    this.loop = new Loop();
    this.light = new HemisphereLight('#ffffff', '#000000', 1);
    this.light.intensity = 1 * Math.PI; // PI was added after three.js r155
    this.then = new Date().getTime();
    this.now = this.then;
    this.delta = 0;

    // Initialize level editor
    this.level = new Level();
    this.levelHistory = new LevelHistory();
    this.levelEditor = new LevelEditor(this.camera, this.graphics.renderer.domElement);
    this.scene.add(this.levelEditor.controlsTransform);

    // Add lighting to scene
    this.light.position.set(0.25, 0.5, 1);
    this.scene.add(this.light);

    // Add level to scene
    this.scene.add(this.level);

    // Add background
    this.background = new Background({ radius: 1000 });
    this.background.setTarget(this.player);
    this.scene.add(this.background);

    // Add event listeners and render app
    var _this = this;
    this.canvas = canvas;
    this.canvas.classList.add('hidden'); // Default hidden with CSS
    this.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
    this.canvas.addEventListener('mousedown', function(e){ _this.mouse.mouseDown(e, _this); }, false);
    this.canvas.addEventListener('mousemove', function(e){ _this.mouse.mouseMove(e, _this); }, false);
    this.canvas.addEventListener('mouseup', function(e){ _this.mouse.mouseUp(e, _this); }, false);
    this.canvas.addEventListener('wheel', function(e){ _this.mouse.wheel(e, _this); }, false);
    this.window.addEventListener('resize', function(e) { _this.resizeWindow(e, _this); });
    this.window.addEventListener('keydown', function(e) { _this.keyboard.keyDown(e, _this); });
    this.window.addEventListener('keyup', function(e) { _this.keyboard.keyUp(e, _this); });
    Events.on(this.engine, 'collisionStart', function(e) { _this.collision.checkPlayerCollision(e, _this); });
    
    var _this = this;
    this.assets = new Assets();
    this.assets.load(function() {
      _this.load(callback);
      _this.updateSettings(null, _this); // Update settings
    });
  }

  load(callback = function(){}) {
    // Start music
    this.assets.audio.play('theme', true);

    // Start game loop
    this.resizeWindow(null, this);

    // Add physics loop
    this.loop.add(60, function(data) {
      this.updateEngine(data.delta, data.alpha);
    }.bind(this));

    // Add graphic loop
    this.loop.add(-1, function(data) {
      this.updateRender(data.delta, data.alpha);
    }.bind(this));

    // Start loop
    this.loop.start();

    // Run game callback
    callback();
  }

  updateRender(delta, alpha) {
    // Loop through scene for all children
    if (this.play == true) {
      // Update engine to loop engine rate
      var index = this.level.children.length - 1;
      while (index >= 0) {
        var child = this.level.children[index];

        // Update child if it has a collision box
        if (child.body != null && child.isFrozen() == false) {
          child.update(delta, alpha);
        }
        index--; // Update iterator
      }

      // Update from new position
      this.updateCamera(this);
      this.timer.render(this);

      // Update background
      this.background.update(delta, alpha);

    }

    // Update 3D renderer
    this.graphics.update(delta);
  }

  updateEngine(delta) {
    // Update engine to loop engine rate
    if (this.play == true) {
      // Update player object
      this.player.updateForce();
      this.player.renderSpeed(this);
      this.player.updateRope();

      // Update world engine
      Engine.update(this.engine, delta * 1000);
    }
  }

  resizeWindow(e, a = app) {
    var screenWidth = a.window.innerWidth;
    var screenHeight = a.window.innerHeight;
    a.camera.aspect = screenWidth / screenHeight;
    a.camera.updateProjectionMatrix();
    a.graphics.setSize(screenWidth, screenHeight);
  }

  resetScene(a = app) {
    app.camera.position.z = app.camera.position.zDefault;
    a.level.removeParticles(a);
    a.level.resetLevel(a);
    a.updateRender(null, a);
    window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: false }));
  }

  updateCamera(a) {
    a.camera.position.x = a.player.position.x;
    a.camera.position.y = a.player.position.y + a.camera.tilt;
    //a.camera.lookAt(a.player.position.x, a.player.position.y, a.player.position.z);
  }

  updateSettings(settings, a = app) {
    // Compare new settings with local storage
    var storageSettings = a.storage.getSettings(a);
    if (settings == null) settings = storageSettings;
    
    // Add missing keys from storage
    Object.keys(storageSettings).forEach(function (key) {
      if (settings[key] == null) {
        settings[key] = storageSettings[key];
      }
    });
    
    // Update application from settings
    a.assets.audio.setMasterVolume(settings.volume);
    a.updateQuality(settings.quality, a);
    a.ui.toggleTheme(settings.theme);
    a.mouse.setSnap(settings.snap);
    a.player.setSkin(settings.skin, a);
    a.storage.setSettings(settings); // Store locally
    a.updateCameraMotion(settings.motion, a);
  }

  updateGravity(angle) { // between -1, and 1 directionally
    var vector = this.util.getVectorFromAngle(angle);
    var gravity = app.engine.world.gravity;
    gravity.x = vector.x;
    gravity.y = vector.y;

    // Animate camera
    if (angle != null && app.motion == true) {
      angle *= -1;
      if (angle < 0) app.camera.rotation.z = (app.camera.rotation.z - (Math.PI * 2)) % (Math.PI * 2);
      app.animation.tween(app.camera.rotation, { z: angle });
    }
    else app.camera.rotation.z = 0;
  }

  updateQuality(quality, a = app) {
    if (quality <= 0) quality = 1;
    a.graphics.setPixelRatio(a.window.devicePixelRatio / (10 / quality));
    //a.graphics.smaaPass.enabled = (quality == 10); // Enable if max graphics
  }

  updateCameraMotion(motion, a = app) {
    a.motion = motion;
  }

  exitCampaign() {
    app.play = false;
    app.resetScene(app);
    app.level.clearLevel(app);
    app.player.removeCheckpoint();
    app.player.setPosition({ x: 0, y: 0, z: 0 });
    window.dispatchEvent(new CustomEvent('setPage', { detail: { page: 'level-picker' }}));
  }

  pause() {
    app.timer.pause();
    app.play = false;
    
    if (app.state == 'level-editor') {
      app.ui.updateLevelOptions();
      app.level.deselectLevel(app);
      app.ui.levelOptions.find('[action="play"]').removeClass('selected');
      app.ui.levelOptions.find('[action="pause"]').addClass('selected');
      app.levelEditor.controlsOrbit.enabled = true;
      app.levelEditor.controlsOrbit.reset();
      app.background.visible = false;
      window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: false }));
    }
    else if (app.state == 'campaign') {
      window.dispatchEvent(new CustomEvent('addPopup', {
        detail: {
          text: 'Paused',
          inputs: [
            { value: 'Exit (E)', type: 'button', callback: function(e) { app.exitCampaign(); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'Retry (R)', type: 'button', callback: function(e) { app.level.retryLevel(); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'Play', type: 'button', callback: function(e) { app.ui.resumeCampaign(); window.dispatchEvent(new CustomEvent('closePopup')); }}
          ]
        }
      }));
    }
  }
}

export { App };