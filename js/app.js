var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
scene.background = new THREE.Color(0xf8d4de);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var player = new Player();

player.position.y -= 2;
scene.add(player);
camera.position.z = 5;

var animate = function () {
    requestAnimationFrame(animate);
    player.rotation.z -= 0.01;
    renderer.render(scene, camera);
};

animate();

// Resize render size
window.addEventListener( 'resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});