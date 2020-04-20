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

var player = new Player();
player.setPosition(0, -BOX_SIZE * 3, 0);
Matter.World.add(engine.world, player.rectangle);
scene.add(player);

// Add floor
for (var i = 0; i < 24; i++) {
    var floor = new Cube();
    floor.setPosition(i * BOX_SIZE + (-BOX_SIZE * 3.5), -BOX_SIZE * 4, 0);
    floor.scaleCube(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    floor.setStatic(true);
    floor.setColor('#620460');
    scene.add(floor);
    Matter.World.add(engine.world, floor.rectangle);
}

// Main render function
function render() {
    requestAnimationFrame(render);
}

Matter.Events.on(engine, "beforeUpdate", function() {
    player.rectangle.force.x = 0.000025;
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    //camera.lookAt(player.position.x, player.position.y, player.position.z);
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
});

// Run the engine and render
Matter.Engine.run(engine);
render();

// Add event listeners
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

window.addEventListener('mousedown', function() {
    player.jump();
}, false);