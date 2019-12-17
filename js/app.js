var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
scene.background = new THREE.Color(0xf8d4de);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0xdc265a } );
var cube = new THREE.Mesh( geometry, material );
cube.position.y -= 2;

console.log(cube);

scene.add( cube );

camera.position.z = 5;

var animate = function () {
    requestAnimationFrame( animate );

    //cube.rotation.x += 0.01;
    cube.position.y += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();