var BOX_SIZE = 16;
var X_START_POS = 0;
var Y_START_POS = 0;
var engine = Matter.Engine.create();
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var quality = 5; // 1=low, 10=high
var stats = new Stats();
var delta = 0;
var fps = 60;
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
//renderer.powerPreference = 'high-performance';
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
//floor.setRotation(0.1);
Matter.World.add(engine.world, floor.rectangle);

// Main render function
function render() {
    delta = (engine.timing.timestamp - this.lastTimeStamp) / (1000 / fps);
    this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
    stats.update();
    console.log(this.delta)
    requestAnimationFrame(render); 
    renderer.render(scene, camera);
}

function update() {
    //player.rectangle.force.x = 0.000025;
    Matter.Body.applyForce(player.rectangle, player.rectangle.position, { x: 0.000025, y: 0 });
    if (player.position.y < -1000) player.resetPosition();
    camera.position.x = player.position.x;
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
        }
    }
}

function click(e) {
    player.jump();
    var pos = getMousePosition(e);
    var floor = new Cube();
    floor.setPosition(pos.x, pos.y, 0);
    floor.scaleCube(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    floor.setStatic(true);
    floor.setColor('#620460');
    scene.add(floor);
    Matter.World.add(engine.world, floor.rectangle);
}

// Add event listeners
window.addEventListener('resize', resizeWindow);
window.addEventListener('mousedown', click, false);
Matter.Events.on(engine, "beforeUpdate", update);

// Run the engine and render
Matter.Engine.run(engine);
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
    vec.set(x, y, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    distance = - camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return(pos);
}