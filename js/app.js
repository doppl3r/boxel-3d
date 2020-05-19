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
        a.quality = 10; // 1=low, 10=high
        a.targetFPS = 60;
        a.interval = 1000 / a.targetFPS;
        a.then = new Date().getTime();
        a.now = a.then;
        a.delta = 0;
        a.ui = new UIController();
        a.mouse = new Mouse();
        a.storage = new StorageManager();
        a.level = new Level();
        a.player = new Player({ x: 0, y: 0, z: 0 });
        a.play = false;
        a.camera = new THREE.PerspectiveCamera(75, a.screenWidth / a.screenHeight, 1, 2000);
        a.camera.tilt = 100;
        a.renderer = new THREE.WebGLRenderer({ antialias: true });
        a.scene = new THREE.Scene();
        a.light = new THREE.HemisphereLight('#ffffff', 1);

        // Add lighting to scene
        a.light.position.set(0, 0, 1);
        a.scene.add(a.light);

        // Update stats
        a.stats.setMode(0);
        a.stats.domElement.classList.add('stats');
        a.document.body.appendChild(a.stats.domElement);

        // Update scene settings
        a.renderer.setSize(a.screenWidth, a.screenHeight);
        a.renderer.setPixelRatio(a.window.devicePixelRatio / (10 / a.quality));
        a.renderer.powerPreference = 'high-performance';
        a.scene.background = new THREE.Color('#1e1e1e');
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
        Matter.Events.on(a.engine, 'collisionStart', function(e) { a.checkPlayerCollision(e, a); });
        a.update(null, a);
        a.render(null, a);
    }

    render = function(e, a) {
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

    update = function(e, a) {
        a.updateCamera(a);

        // Loop through scene for all children
        for (var i = 0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            
            // Update child if it has a collision box
            if (child.body != null) {
                var rect = child.body;
                var x = rect.position.x;
                var y = rect.position.y;
                var z = rect.angle;
                child.setPosition(x, -y, 0, false);
                child.setRotation(-z, false);
                if (child.position.y < -1000) child.resetToOrigin();
            }
        }
    }

    resizeWindow = function(e, a) {
        var screenWidth = a.window.innerWidth;
        var screenHeight = a.window.innerHeight;
        a.camera.aspect = screenWidth / screenHeight;
        a.camera.updateProjectionMatrix();
        a.renderer.setSize(screenWidth, screenHeight);
    }

    keyDown = function(e, a) {
        switch (e.keyCode) {
            case 16: break; //  Shift
            case 17: break; // Ctrl
            case 27: break; // Esc
            case 32: a.player.jump(); break; // Space
            case 38: break; // Up
        }
    }

    keyUp = function(e, a) {

    }

    getObject = function(e, a) {
        var raycaster = new THREE.Raycaster();
        var vec = new THREE.Vector3();
        var object;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0);
        raycaster.setFromCamera(vec, a.camera);
        var intersects = raycaster.intersectObjects(a.scene.children, true);
        if (intersects.length > 0) object = intersects[0].object;
        return(object);
    }

    getMousePosition = function(e, a) {                
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

    deselectScene = function(a) {
        a.selectedObject = null;
        for (var i=0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            if (child.body != null) {
                child.select(false);
            }
        }
    }

    resetScene = function(a) {
        a.updateCamera(a);
        a.ui.showObjectOptions(false);
        for (var i=0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            if (child.body != null) {
                child.resetToOrigin();
                a.update(null, a);
            }
        }
    }

    updateCamera = function(a) {
        a.camera.position.x = a.player.position.x;
        a.camera.position.y = a.player.position.y + a.camera.tilt;
        a.camera.lookAt(a.player.position.x, a.player.position.y, a.player.position.z);
    }

    checkPlayerCollision = function(e, a) {
        var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerBody = null;
            var objectBody = null;

            // Check if player is touching object
            if (pair.bodyA.class == 'player') {
                playerBody = pair.bodyA;
                objectBody = pair.bodyB;
            }
            else if (pair.bodyB.class == 'player') {
                playerBody = pair.bodyB;
                objectBody = pair.bodyA;
            }

            // Update jump status if playerBody exists in collision check
            if (playerBody != null) {
                // Check if player is falling
                if (a.player.body.velocity.y >= 0) {
                    a.player.allowJump = true;
                }
            }
        }
    }
}
var app = new App();