import { HemisphereLight, PerspectiveCamera, Scene } from 'three';
import { Composite, Bodies, Body, Engine, Events } from 'matter-js';
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
import { Mouse } from './Mouse.js';
import { LevelEditor } from './LevelEditor.js';
import { Multiplayer } from './Multiplayer.js';
import { Network } from './Network.js';

class App {
  constructor() {
    this.window = window;
    this.document = document;
    this.BOX_SIZE = 16;
    this.screenWidth = this.window.innerWidth;
    this.screenHeight = this.window.innerHeight;
    this.engine = Engine.create();
    this.util = new Utility();
    this.state = 'home';
    this.animation = new Animation();
    this.storage = new StorageManager();
    this.collision = new Collision();
    this.player = new Player({ x: 0, y: 0, z: 0 });
    this.play = false;
    this.fov = 75; // Default 75
    this.scene = new Scene();
    this.mouse = new Mouse();

    // Set global variables for mods
    this.window.Matter = { Composite: Composite, Bodies: Bodies, Body: Body };
    
    // Set time components
    this.timer = new Timer();
    this.loop = new Loop();
    this.then = new Date().getTime();
    this.now = this.then;
    this.delta = 0;
    
    // Initialize level components
    this.assets = new Assets();
    this.level = new Level();
    this.levelHistory = new LevelHistory();
    this.scene.add(this.level);
    
    // Initialize camera
    this.camera = new PerspectiveCamera(this.fov, this.screenWidth / this.screenHeight, 1, 2000);
    this.camera.tilt = 0;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.zDefault = 180;
    this.camera.position.z = this.camera.position.zDefault;

    // Add lighting to scene
    this.light = new HemisphereLight('#ffffff', '#000000', 1 * Math.PI); // PI was added after three.js r155
    this.light.position.set(0.25, 0.5, 1);
    this.scene.add(this.light);

    // Add background to scene
    this.background = new Background();
    this.scene.add(this.background);

    // Initialize network
    this.network = new Network();
    this.multiplayer = new Multiplayer(this.network);
    this.scene.add(this.multiplayer.players);
  }

  init(canvas, callback = function(){}) {
    this.graphics = new Graphics(canvas);
    this.graphics.setCamera(this.camera);
    this.graphics.setScene(this.scene);
    this.graphics.setSelectedObjects([this.level]);
    
    // Initialize level editor
    this.levelEditor = new LevelEditor(this.camera, canvas);
    this.scene.add(this.levelEditor.controlsTransform.getHelper());

    // Add event listeners
    this.canvas = canvas;
    this.canvas.classList.add('hidden'); // Default hidden with CSS
    this.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
    this.canvas.addEventListener('pointerdown', function(e){ this.mouse.mouseDown(e, this); }.bind(this), false);
    this.canvas.addEventListener('pointermove', function(e){ this.mouse.mouseMove(e, this); }.bind(this), false);
    this.canvas.addEventListener('pointerup', function(e){ this.mouse.mouseUp(e, this); }.bind(this), false);
    this.canvas.addEventListener('wheel', function(e){ this.mouse.wheel(e, this); }.bind(this), false);
    this.window.addEventListener('resize', function(e) { this.resizeWindow(e, this); }.bind(this));
    Events.on(this.engine, 'collisionStart', function(e) { this.collision.checkPlayerCollision(e, this); }.bind(this));
    
    // Load assets, then load game
    this.assets.load(function() {
      this.load(callback);
      this.updateSettings(null, this); // Update settings
    }.bind(this));
  }

  load(callback = function(){}) {
    var storageSettings = app.storage.getSettings(app);

    // Start music
    this.assets.audio.play(storageSettings.music, { queue: true });

    // Initialize background with model
    this.background.setTarget(this.player);
    this.background.init();

    // Start game loop
    this.resizeWindow(null, this);

    // Add physics loop
    this.loop.add(function(data) {
      this.updateEngine(data.delta, data.alpha);
    }.bind(this), 60);

    // Add graphic loop
    this.loop.add(function(data) {
      this.updateRender(data.delta, data.alpha);
    }.bind(this), -1);

    // Add network loop
    this.multiplayer.setTick(8);
    this.loop.add(function(data) {
      this.updateNetwork(data.delta, data.alpha);
    }.bind(this), 8);

    // Start loop
    this.loop.start();

    // Run game callback
    callback();
  }

  updateEngine(delta) {
    // Update engine to loop engine rate
    if (this.play == true) {
      // Update player object
      this.player.updateControls();
      this.player.updateForce();
      this.player.renderSpeed(this);
      this.player.updateRope();

      // Update world engine
      Engine.update(this.engine, delta * 1000);
    }
  }

  updateRender(delta, alpha) {
    // Loop through scene for all children
    if (this.play == true) {
      // Update from new position
      this.updateChildren(delta, alpha)
      this.updateCamera(this);
      this.timer.render();
      
      // Update game objects
      this.background.update(delta, alpha, app.motion == false);
      this.animation.update(delta, alpha);
      this.graphics.update(delta);
    }

    // Update network animations (tweens)
    this.multiplayer.render(delta, alpha);
  }

  updateChildren(delta, alpha) {
    // Loop through all children and update all 3D objects
    var index = this.level.children.length - 1;
    while (index >= 0) {
      var child = this.level.children[index];

      // Update child if it has a collision box
      if (child.body != null && child.isFrozen() == false) {
        child.update(delta, alpha);
      }
      index--; // Update iterator
    }
  }

  updateNetwork(delta, alpha) {
    // Update network
    this.multiplayer.update(delta, alpha);
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
    a.level.resetLevel();
    a.updateRender(null, 0);
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
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
    a.assets.audio.setMasterVolume(settings.volume, 'master');
    a.assets.audio.setMasterVolume(settings.volumeEffects, 'effects');
    a.assets.audio.setMasterVolume(settings.volumeMusic, 'music');
    a.updateQuality(settings.quality, a);
    a.mouse.setSnap(settings.snap);
    a.player.setSkin(settings.skin, a);
    a.player.setInputBuffer(settings.buffer, a);
    a.storage.setSettings(settings); // Store locally
    a.updateCameraMotion(settings.motion, a);
    window.dispatchEvent(new CustomEvent('updateStatsVisibility'));
    window.dispatchEvent(new CustomEvent('updateScale', { detail: settings.scale }));
  }

  updateGravity(angle) { // between -1, and 1 directionally
    var vector = this.util.getVectorFromAngle(angle);
    var gravity = app.engine.world.gravity;
    var scale = 1;
    gravity.x = vector.x;
    gravity.y = vector.y;

    // Animate camera
    if (angle != null && app.motion == true) {
      angle *= -1;
      if (angle < 0) app.camera.rotation.z = (app.camera.rotation.z - (Math.PI * 2)) % (Math.PI * 2);
      scale = (Math.abs((angle + Math.PI) % (Math.PI)) / (Math.PI / 2)) + 1; // 0deg = 1, 90deg = 2
      app.animation.tween({ object: app.camera.rotation, to: { z: angle }, duration: 250 }).start();
      app.background.animateScale(scale);
    }
    else {
      app.camera.rotation.z = 0;
      app.background.animateScale(1);
    }
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
    window.dispatchEvent(new CustomEvent('setPage', { detail: 'level-picker' }));
    window.dispatchEvent(new CustomEvent('closePopup'));
  }

  startLevel() {
    app.play = true;
    app.timer.start();

    // Play jump sound
    this.assets.audio.play('jump');
  }

  async playLevel(options) {
    // Resolve missing JSON data
    if (options.json == null) {
      // Resolve missing path by title
      if (options.path == null) {
        options.path = '../json/levels/' + options.title + '.json';
      }
  
      // Fetch level json data
      try {
        const response = await fetch(options.path);
        options.json = await response.json();
      }
      catch (error) {
        console.error(error);
      }
    }

    // Load level if json exists
    if (options.json) {
      var storageSettings = app.storage.getSettings(app);
      var title = options.json.name;
      var description = app.level.getDescriptionByTitle(title)
      var author = app.level.getAuthorByTitle(title);
      var theme = app.level.getTheme(options.json.theme);
      if (theme == null) theme = app.level.getPackTheme(title);
      if (storageSettings.theme == 'origin' || theme == null) theme = app.level.getTheme('classic');
      app.level.entityFactory.color = theme.color;

      // Set optional fog
      if (theme.fog) {
        app.graphics.fog.color.set(theme.fog.color);
        app.graphics.fog.near = theme.fog.near || 0.01;
        app.graphics.fog.far = theme.fog.far || 240;
      }
      else {
        app.graphics.fog.color.set('#ffffff');
        app.graphics.fog.near = app.graphics.fog.far = 9999;
      }

      app.background.setTheme(theme.model);
      app.updateGravity();
      app.play = true;
      app.timer.reset();
      app.level.clearLevel(app);
      app.level.importFromJSON(options.json, app);
      app.level.publishedFileId = options.publishedFileId; // Steam level ID
      app.background.visible = true;
      app.startLevel();
      app.resetScene();

      // Dispatch level start event
      window.dispatchEvent(new CustomEvent('levelStart', {
        detail: {
          title: title,
          description: description
        }
      }));
      
      // Send event to show credits
      setTimeout(function() {
        if (author) {
          window.dispatchEvent(new CustomEvent('setCredit', { detail: { text: 'Level by ' + author }}));
        }
      }, 500);
    }

    // Return level existence state
    return options.json;
  }

  pauseLevel() {
    app.timer.pause();
    app.play = false;
  }

  resumeLevel() {
    app.timer.start();
    app.play = true;
    window.dispatchEvent(new CustomEvent('closePopup'));
  }

  showCanvas() {
    app.canvas.classList.remove('hidden');
  }

  hideCanvas() {
    app.canvas.classList.add('hidden');
  }
}

export { App };