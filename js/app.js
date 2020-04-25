var BOX_SIZE = 16;
var X_START_POS = 0;
var Y_START_POS = 0;
var engine = Matter.Engine.create();
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var stats = new Stats();
//var screenWidth = 640;
//var screenHeight = 360;
var renderer = new THREE.WebGLRenderer({ antialias: true });
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
renderer.setPixelRatio(window.devicePixelRatio);
renderer.powerPreference = 'high-performance';
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
var floor = new Cube();
floor.setPosition(0, -BOX_SIZE * 4, 0);
floor.scaleCube(BOX_SIZE * 24, BOX_SIZE, BOX_SIZE);
floor.setStatic(true);
floor.setColor('#620460');
scene.add(floor);
Matter.World.add(engine.world, floor.rectangle);

// Main render function
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    stats.update();
}

Matter.Events.on(engine, "beforeUpdate", function() {
    //player.rectangle.force.x = 0.000025;
    //Matter.Body.applyForce(player.rectangle, player.rectangle.position, { x: 0.00001, y: 0 });
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
    
});

// Run the engine and render
Matter.Engine.run(engine);
render();

// Add event listeners
window.addEventListener('resize', function(){
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenWidth, screenHeight );
});

window.addEventListener('mousedown', function(e) {
    player.jump();
    var pos = getMousePosition(e);

    var floor = new Cube();
    floor.setPosition(pos.x, pos.y, 0);
    floor.scaleCube(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    floor.setStatic(true);
    floor.setColor('#620460');
    scene.add(floor);
    Matter.World.add(engine.world, floor.rectangle);
}, false);

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