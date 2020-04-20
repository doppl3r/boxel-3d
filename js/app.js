var clock = new THREE.Clock();
var delta = 0;
var fps = 60;
var interval = (1 / fps);
var BOX_SIZE = 16;
var X_START_POS = 0;
var Y_START_POS = 0;
var engine = Matter.Engine.create();
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
var scene = new THREE.Scene();
var light = new THREE.HemisphereLight('#ffffff', 1);

// Add lighting
light.position.set(0, 0, 1);
scene.add(light);

// Update scene settings
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
scene.background = new THREE.Color(0xf8d4de);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 200;
document.body.appendChild(renderer.domElement);

// Populate world with cubes
var dataSet = [
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BG","BG","BG",
    "BK","BK","BK","BK","BK","BK","RD","RD","RD","RD","RD","BK","BK","BG","BG","BG",
    "BK","BK","BK","BK","BK","RD","RD","RD","RD","RD","RD","RD","RD","RD","BG","BG",
    "BK","BK","BK","BK","BK","BR","BR","BR","BG","BG","BR","BG","BK","RD","RD","RD",
    "BK","BK","BK","BK","BR","BG","BR","BG","BG","BG","BR","BG","BG","RD","RD","RD",
    "BK","BK","BK","BK","BR","BG","BR","BR","BG","BG","BG","BR","BG","BG","BG","RD",
    "BK","BK","BK","BK","BR","BR","BG","BG","BG","BG","BR","BR","BR","BR","RD","BK",
    "BK","BK","BK","BK","BK","BK","BG","BG","BG","BG","BG","BG","BG","RD","BK","BK"
];
for (var i = 0; i < dataSet.length; i++) {
    var x = X_START_POS + (i % BOX_SIZE) * (BOX_SIZE) - (BOX_SIZE * 7);
    var y = Y_START_POS + Math.floor(i / BOX_SIZE) * (BOX_SIZE) - (BOX_SIZE * 10);
    var cube = new Player();
    cube.setPosition(x, -y, 0);
    Matter.World.add(engine.world, cube.rectangle);
    scene.add(cube);
}

// Add floor
var floor = new Cube();
scene.add(floor);
floor.setPosition(0, -BOX_SIZE * 4, 0);
floor.scaleCube(BOX_SIZE * 12, BOX_SIZE, BOX_SIZE);
floor.setStatic(true);
floor.setColor('#620460');
Matter.World.add(engine.world, floor.rectangle);

// Main render function
function render() {
    delta += clock.getDelta();
    if (delta > interval) update();
    requestAnimationFrame(render);
}

// Main update function
function update() {
    delta = delta % interval;
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
    renderer.render(scene, camera);
}

// Run the engine and render
Matter.Engine.run(engine);
render();

// Add event listeners
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});