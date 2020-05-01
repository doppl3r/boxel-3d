var BOX_SIZE = 16;
var X_START_POS = 0;
var Y_START_POS = 0;
var engine = Matter.Engine.create();
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var stats = new Stats();
var quality = 5; // 1=low, 10=high
var targetFPS = 60;
var interval = 1000 / targetFPS;
var then = new Date().getTime();
var now = then;
var delta = 0;
var renderer = new THREE.WebGLRenderer({ /* antialias: true */ });
var camera = new THREE.PerspectiveCamera(75, screenWidth / screenHeight, 1, 1000);
var scene = new THREE.Scene();
var light = new THREE.HemisphereLight('#ffffff', 1);

// Add lighting
light.position.set(0, 0, 1);
scene.add(light);

// Update stats
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0';
stats.domElement.style.top = '0';
document.body.appendChild(stats.domElement);

// Update scene settings
renderer.setSize(screenWidth, screenHeight);
renderer.setPixelRatio(window.devicePixelRatio / (10 / quality));
renderer.powerPreference = 'high-performance';
scene.background = new THREE.Color(0xf8d4de);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 200;
document.body.appendChild(renderer.domElement);

var player = new Player();
player.setPosition(0, 0, 0);
Matter.World.add(engine.world, player.rectangle);
scene.add(player);

// Add floor
var floor = new Cube();
floor.setPosition(0, -BOX_SIZE * 4, 0);
floor.scaleCube(BOX_SIZE * 24, BOX_SIZE, BOX_SIZE);
floor.setStatic(true);
floor.setColor('#620460');
scene.add(floor);
floor.setRotation((Math.PI / 180) * 10);
Matter.World.add(engine.world, floor.rectangle);

//setInterval(render, interval);

// Main render function
function render() {
    now = new Date().getTime();
    delta = now - then;
    if (delta > interval) {
        update();
        Matter.Engine.update(engine); // Manually Update Engine
        then = now - (delta % interval);
        stats.update();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// Main update function
function update() {
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + 100;
    camera.lookAt(player.position.x, player.position.y, player.position.z);
    for (var i = 0; i < scene.children.length; i++) {
        var child = scene.children[i];
        if (child.rectangle != null) {
            var rect = child.rectangle;
            var x = rect.position.x;
            var y = rect.position.y;
            var z = rect.angle;
            child.setPosition(x, -y, 0);
            child.rotation.z = -z;
            if (child.position.y < -1000) child.resetPosition();
        }
    }
}

function click(event) {
    var object = getObject(event);
    if (object == null) {
        player.jump();
        var pos = getMousePosition(event);
        var floor = new Cube();
        floor.setPosition(pos.x, pos.y, 0);
        floor.scaleCube(BOX_SIZE, BOX_SIZE, BOX_SIZE);
        floor.setStatic(true);
        floor.setColor('#620460');
        scene.add(floor);
        Matter.World.add(engine.world, floor.rectangle);
    }
    else {
        object.setColor("#fff");
    }
}

// Add event listeners
window.addEventListener('resize', resizeWindow);
renderer.domElement.addEventListener('mousedown', click, false);
Matter.Events.on(engine, "beforeUpdate", function() {  });

// Run the engine and render
render();

function resizeWindow() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(screenWidth, screenHeight);
}

function getMousePosition(event) {                
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    var distance = 0;
    var x = (event.clientX / window.innerWidth) * 2 - 1;
    var y = -(event.clientY / window.innerHeight) * 2 + 1;
    vec.set(x, y, 0);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    distance = - camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return(pos);
}

function getObject(event) {
    var raycaster = new THREE.Raycaster();
    var vec = new THREE.Vector3();
    var object;
    var x = (event.clientX / window.innerWidth) * 2 - 1;
    var y = -(event.clientY / window.innerHeight) * 2 + 1;
    vec.set(x, y, 0);
    raycaster.setFromCamera(vec, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) object = intersects[0].object;
    return(object);
}