class App {
    constructor() {
        var a = this;
        a.window = window;
        a.document = document;
        a.BOX_SIZE = 16;
        a.snap = 1; // Drag snapping
        a.engine = Matter.Engine.create();
        a.screenWidth = a.window.innerWidth;
        a.screenHeight = a.window.innerHeight;
        a.stats = new Stats();
        a.ui = new UIController();
        a.mouse = new Mouse();
        a.audio = new Audio();
        a.storage = new StorageManager();
        a.collision = new Collision();
        a.level = new Level();
        a.levelHistory = new LevelHistory();
        a.player = new Player({ x: 0, y: 0, z: 0 });
        a.play = false;
        a.camera = new THREE.PerspectiveCamera(75, a.screenWidth / a.screenHeight, 1, 2000);
        a.camera.tilt = 50;
        a.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        a.scene = new THREE.Scene();
        a.light = new THREE.HemisphereLight('#ffffff', '#000000', 1);
        a.settings = a.storage.getSettingsFromStorage();
        a.quality = a.settings.quality; // 1=low, 10=high
        a.targetFPS = 60;
        a.interval = 1000 / a.targetFPS;
        a.then = new Date().getTime();
        a.now = a.then;
        a.delta = 0;

        // Add lighting to scene
        a.light.position.set(0.25, 0.5, 1);
        a.scene.add(a.light);

        // Update stats
        a.stats.setMode(0);
        a.stats.domElement.classList.add('stats');
        a.document.body.appendChild(a.stats.domElement);

        // Update scene settings
        a.renderer.setSize(a.screenWidth, a.screenHeight);
        a.renderer.powerPreference = 'high-performance';
        a.updateQuality(a.quality, a);
        a.camera.position.x = 0;
        a.camera.position.y = 0;
        a.camera.position.z = 200;
        a.document.body.appendChild(a.renderer.domElement);

        // Get list of levels
        a.ui.appendListOfLevels(a);

        // Add level to scene
        a.scene.add(a.level);

        // Add event listeners and render app
        a.canvas = a.renderer.domElement;
        a.canvas.classList.add('disabled'); // Default hidden with CSS
        a.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
        a.canvas.addEventListener('mousedown', function(e){ a.mouse.mouseDown(e, a); }, false);
        a.canvas.addEventListener('mousemove', function(e){ a.mouse.mouseMove(e, a); }, false);
        a.canvas.addEventListener('mouseup', function(e){ a.mouse.mouseUp(e, a); }, false);
        a.canvas.addEventListener('wheel', function(e){ a.mouse.wheel(e, a); }, false);
        a.window.addEventListener('resize', function(e) { a.resizeWindow(e, a); });
        a.window.addEventListener('keydown', function(e) { a.keyDown(e, a); });
        a.window.addEventListener('keyup', function(e) { a.keyUp(e, a); });
        Matter.Events.on(a.engine, 'collisionStart', function(e) { a.collision.checkPlayerCollision(e, a); });
        a.update(null, a);
        a.render(null, a);
    }

    render(e, a) {
        a.now = new Date().getTime();
        a.delta = a.now - a.then;
        if (a.delta > a.interval) {
            // Update if play is true
            if (a.play == true) {
                a.update(null, a);
                Matter.Engine.update(a.engine);
            }
            a.then = a.now - (a.delta % a.interval);
            a.stats.update();
        }
        a.renderer.render(a.scene, a.camera);
        requestAnimationFrame(function(e) { a.render(e, a); });
    }

    update(e, a) {
        a.updateCamera(a);

        // Loop through scene for all children
        var index = a.level.children.length - 1;
        while (index >= 0) {
            var child = a.level.children[index];

            // Update child if it has a collision box
            if (child.body != null) {
                var rect = child.body;
                var x = rect.position.x;
                var y = rect.position.y;
                var z = child.position.z;
                var rotation = rect.angle;
                child.setPosition({ x: x, y: -y, z: z }, false);
                child.setRotation(-rotation, false);
                if (child.position.y < -1000) {
                    if (child.getClass() == 'player') child.kill();
                    else a.level.removeObject(child, a);
                }
            }
            index--; // Update iterator
        }
    }

    resizeWindow(e, a) {
        var screenWidth = a.window.innerWidth;
        var screenHeight = a.window.innerHeight;
        a.camera.aspect = screenWidth / screenHeight;
        a.camera.updateProjectionMatrix();
        a.renderer.setSize(screenWidth, screenHeight);
    }

    keyDown(e, a) {
        switch (e.keyCode) {
            case 16: break; //  Shift
            case 17: break; // Ctrl
            case 27: break; // Esc
            case 32: a.player.jump(); break; // Space
            case 38: break; // Up
        }
    }

    keyUp(e, a) {

    }

    getObject(e, a) {
        var raycaster = new THREE.Raycaster();
        var vec = new THREE.Vector3();
        var object;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0);
        raycaster.setFromCamera(vec, a.camera);
        var intersects = raycaster.intersectObjects(a.scene.children, true);
        if (intersects.length > 0) {
            // Parent #1 = Shapes, Parent #2 = Cube
            object = intersects[0].object.parent.parent;
        }
        return(object);
    }

    newObject(type, options) {
        var object;
        switch(type) {
            case('player'): object = new Player(options); break;
            case('tip'): object = new Tip(options); break;
            case('bounce'): object = new Bounce(options); break;
            case('checkpoint'): object = new Checkpoint(options); break;
            case('spike'): object = new Spike(options); break;
            case('shrink'): object = new Shrink(options); break;
            case('grow'): object = new Grow(options); break;
            case('finish'): object = new Finish(options); break;
            default: object = new Cube(options);
        }
        return object;
    }

    getMousePosition(e, a) {                
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse
        var distance = 0;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0.5);
        vec.unproject(a.camera);
        vec.sub(a.camera.position).normalize();
        distance = ( 0 - a.camera.position.z ) / vec.z;
        pos.copy(a.camera.position).add(vec.multiplyScalar(distance));
        return(pos);
    }

    deselectScene(a) {
        a.selectedObject = null;
        for (var i=0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            if (child.body != null) {
                child.select(false);
            }
        }
    }

    resetScene(a) {
        a.updateCamera(a);
        a.ui.showObjectOptions(false);
        a.level.removeParticles(a);
        for (var i=0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            if (child.body != null) {
                child.resetToOrigin();
                a.update(null, a); // TODO confirm static disappearing glitch
            }
        }
    }

    updateCamera(a) {
        a.camera.position.x = a.player.position.x;
        a.camera.position.y = a.player.position.y + a.camera.tilt;
        a.camera.lookAt(a.player.position.x, a.player.position.y, a.player.position.z);
    }

    updateSettings(settings, a) {
        a.audio.setVolume(settings.audio);
        a.updateQuality(settings.quality, a);
        a.ui.toggleTheme(settings.theme);
        a.storage.setSettingsFromStorage(settings);
    }

    updateQuality(quality, a) {
        if (quality <= 0) quality = 1;
        a.quality = quality;
        a.renderer.setPixelRatio(a.window.devicePixelRatio / (10 / a.quality));
    }
}
var app = new App();