var clock = new THREE.Clock();
var delta = 0;
var fps = 12;
var interval = (1 / fps);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var player = new Player();

// Update scene settings
renderer.setSize(window.innerWidth, window.innerHeight);
scene.background = new THREE.Color(0xf8d4de);
scene.add(player);
camera.position.z = 200;
document.body.appendChild(renderer.domElement);

// Render all elements to the screen
function render() {
    delta += clock.getDelta();
    if (delta > interval) update();
    requestAnimationFrame(render);
};

// Update each element
function update() {
    player.rotation.z -= delta;
    delta = delta % interval;
    renderer.render(scene, camera);
}

// Resize renderer
window.addEventListener( 'resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

// Initialize app
render();