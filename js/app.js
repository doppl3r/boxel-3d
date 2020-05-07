class App {
    constructor() {
        var a = this;
        a.window = window;
        a.document = document;
        a.BOX_SIZE = 16;
        a.engine = Matter.Engine.create();
        a.screenWidth = a.window.innerWidth;
        a.screenHeight = a.window.innerHeight;
        a.stats = new Stats();
        a.quality = 5; // 1=low, 10=high
        a.targetFPS = 60;
        a.interval = 1000 / a.targetFPS;
        a.then = new Date().getTime();
        a.now = a.then;
        a.delta = 0;
        a.ui = new UIController();
        a.play = false;
        a.renderer = new THREE.WebGLRenderer({ /* antialias: true */ });
        a.camera = new THREE.PerspectiveCamera(75, a.screenWidth / a.screenHeight, 1, 1000);
        a.scene = new THREE.Scene();
        a.light = new THREE.HemisphereLight('#ffffff', 1);

        // Add lighting
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
        a.scene.background = new THREE.Color('#f8d4de');
        a.camera.position.x = 0;
        a.camera.position.y = 0;
        a.camera.position.z = 200;
        a.document.body.appendChild(a.renderer.domElement);

        // Add player
        a.player = new Player({ x: 0, y: 0, z: 0 });
        Matter.World.add(a.engine.world, a.player.rectangle);
        a.scene.add(a.player);

        // Add floor
        a.floor = new Cube({ x: 0, y: -a.BOX_SIZE * 4, z: 0 });
        a.floor.setScale(a.BOX_SIZE * 24, a.BOX_SIZE, a.BOX_SIZE);
        a.floor.setRotation(-(Math.PI / 180) * 10);
        a.floor.setColor('#620460');
        a.scene.add(a.floor);
        Matter.World.add(a.engine.world, a.floor.rectangle);

        // Add event listeners and render app
        a.renderer.domElement.addEventListener('mousedown', function(e){ a.clickCanvas(e, a); }, false);
        a.window.addEventListener('resize', function(e) { a.resizeWindow(e, a); });
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
        a.camera.position.x = a.player.position.x;
        a.camera.position.y = a.player.position.y + 100;
        a.camera.lookAt(a.player.position.x, a.player.position.y, a.player.position.z);
        for (var i = 0; i < a.scene.children.length; i++) {
            var child = a.scene.children[i];
            if (child.rectangle != null) {
                var rect = child.rectangle;
                var x = rect.position.x;
                var y = rect.position.y;
                var z = rect.angle;
                child.setPosition(x, -y, 0, false);
                child.setRotation(-z, false);
                if (child.position.y < -1000) child.resetToOrigin();
            }
        }
    }

    clickCanvas = function(e, a) {
        this.selectedObject = a.getObject(e, a);
        if (this.selectedObject == null) {
            a.deselectScene(a);
            a.ui.showObjectOptions(true);
            var pos = a.getMousePosition(e, a);
            this.selectedObject = new Cube({ x: pos.x, y: pos.y, z: 0 });
            this.selectedObject.setScale(a.BOX_SIZE, a.BOX_SIZE, a.BOX_SIZE);
            this.selectedObject.setColor('#620460');
            a.scene.add(this.selectedObject);
            Matter.World.add(a.engine.world, this.selectedObject.rectangle);
            this.selectedObject.select();
            a.ui.updateObjectOptions();
        }
        else {
            var selected = !this.selectedObject.selected; // Toggle selected
            a.deselectScene(a);
            a.ui.showObjectOptions(selected);
            this.selectedObject.select(selected);
            if (selected == false) this.selectedObject = null;
            a.ui.updateObjectOptions();
        }
    }

    resizeWindow = function(e, a) {
        var screenWidth = a.window.innerWidth;
        var screenHeight = a.window.innerHeight;
        a.camera.aspect = screenWidth / screenHeight;
        a.camera.updateProjectionMatrix();
        a.renderer.setSize(screenWidth, screenHeight);
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
        vec.set(x, y, 0);
        vec.unproject(a.camera);
        vec.sub(a.camera.position).normalize();
        distance = - a.camera.position.z / vec.z;
        pos.copy(a.camera.position).add(vec.multiplyScalar(distance));
        return(pos);
    }

    deselectScene = function(a) {
        for (var i=0; i < a.scene.children.length; i++) {
            var child = a.scene.children[i];
            if (child.rectangle != null) {
                child.select(false);
            }
        }
    }

    resetScene = function(a) {
        a.ui.showObjectOptions(false);
        for (var i=0; i < a.scene.children.length; i++) {
            var child = a.scene.children[i];
            if (child.rectangle != null) {
                child.resetToOrigin();
                a.update(null, a);
            }
        }
    }

    removeObject = function(object, a) {
        Matter.World.remove(a.engine.world, object.rectangle);
        a.scene.remove(object);
    }
}
var app = new App();