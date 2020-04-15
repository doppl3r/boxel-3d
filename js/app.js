var clock = new THREE.Clock();
var delta = 0;
var fps = 30;
var interval = (1 / fps);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var player = new Player();

scene.background = new THREE.Color(0xf8d4de);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



scene.add(player);
camera.position.z = 5;

function render() {
    delta += clock.getDelta();
    if (delta > interval) update();
    requestAnimationFrame(render);
};

function update() {
    player.rotation.z -= delta;
    delta = delta % interval;
    renderer.render(scene, camera);
}

render();

// Resize renderer
window.addEventListener( 'resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});