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
var light = new THREE.HemisphereLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add( light );;

var dataSet = [
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BG","BG","BG",
    "BK","BK","BK","BK","BK","BK","RD","RD","RD","RD","RD","BK","BK","BG","BG","BG",
    "BK","BK","BK","BK","BK","RD","RD","RD","RD","RD","RD","RD","RD","RD","BG","BG",
    "BK","BK","BK","BK","BK","BR","BR","BR","BG","BG","BR","BG","BK","RD","RD","RD",
    "BK","BK","BK","BK","BR","BG","BR","BG","BG","BG","BR","BG","BG","RD","RD","RD",
    "BK","BK","BK","BK","BR","BG","BR","BR","BG","BG","BG","BR","BG","BG","BG","RD",
    "BK","BK","BK","BK","BR","BR","BG","BG","BG","BG","BR","BR","BR","BR","RD","BK",
    "BK","BK","BK","BK","BK","BK","BG","BG","BG","BG","BG","BG","BG","RD","BK","BK",
    "BK","BK","RD","RD","RD","RD","RD","BL","RD","RD","RD","BL","RD","BK","BK","BK",
    "BK","RD","RD","RD","RD","RD","RD","RD","BL","RD","RD","RD","BL","BK","BK","BR",
    "BG","BG","RD","RD","RD","RD","RD","RD","BL","BL","BL","BL","BL","BK","BK","BR",
    "BG","BG","BG","BK","BL","BL","RD","BL","BL","YL","BL","BL","YL","BL","BR","BR",
    "BK","BG","BK","BR","BL","BL","BL","BL","BL","BL","BL","BL","BL","BL","BR","BR",
    "BK","BK","BR","BR","BR","BL","BL","BL","BL","BL","BL","BL","BL","BL","BR","BR",
    "BK","BR","BR","BR","BL","BL","BL","BL","BL","BL","BL","BK","BK","BK","BK","BK",
    "BK","BR","BK","BK","BL","BL","BL","BL","BK","BK","BK","BK","BK","BK","BK","BK"
];

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
scene.background = new THREE.Color(0xf8d4de);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 200;
document.body.appendChild(renderer.domElement);

// create two boxes and a ground
var boxes = [];
for (var i = 0; i < dataSet.length; i++) {
    var x = X_START_POS + (i % BOX_SIZE) * (BOX_SIZE) - (BOX_SIZE * 7);
    var y = Y_START_POS + Math.floor(i / BOX_SIZE) * (BOX_SIZE) - (BOX_SIZE * 20);

    boxes.push(Matter.Bodies.rectangle(x, y, BOX_SIZE, BOX_SIZE, {
        friction: 0.001,
        frictionAir: 0.01,
        restitution: 0.5,
        density: 0.001,
        slop: 0.05
    }));
}

var ground = Matter.Bodies.rectangle(0, BOX_SIZE * 4, BOX_SIZE * 12, BOX_SIZE, {isStatic: true});

// add all of the bodies to the world
Matter.World.add(engine.world, boxes);
Matter.World.add(engine.world, ground);

var bodies = [];
var material = new THREE.MeshPhongMaterial({ color: 0x620460 });

var group = new THREE.Object3D();
scene.add(group);

for (var j = 0; j < engine.world.bodies.length; j++) {
    var b = engine.world.bodies[j];
    var w = b.bounds.max.x - b.bounds.min.x;
    var h = b.bounds.max.y - b.bounds.min.y;

    if (b.isStatic) {
        var geometry = new THREE.BoxGeometry(w, h, BOX_SIZE);
        m = new THREE.Mesh(geometry, material);
    }
    else {
        m = new Player();
        m.rotation.x = Math.PI / 2;
    }

    group.add(m); // 3d items
    bodies.push(m); // 2d items
}

function render() {
    delta += clock.getDelta();
    if (delta > interval) update();
    requestAnimationFrame(render);
}

function update() {
    delta = delta % interval;
    for (var j = 0; j < engine.world.bodies.length; j++) {
        var b = engine.world.bodies[j].position;
        bodies[j].rotation.y = -engine.world.bodies[j].angle;
        bodies[j].position.set(b.x, -b.y, 0);
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