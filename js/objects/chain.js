class Chain {
    constructor() {
        
    }

    add(bodyA, pointB) {
        
    }

    remove() {
        
    }

    update(pointA, bodyB) {
        
    }
}

class Link {
    constructor(options) {
        this.material = new MeshLineMaterial({ color: '#ffffff', lineWidth: 8 });
        this.line = new MeshLine();
        this.mesh = new THREE.Mesh(this.line, this.material);
        this.circle = Matter.Bodies.circle(); // TODO
        this.body = Matter.Body.create({ parts: [this.circle], friction: 0.0, frictionAir: 0.0, frictionStatic: 0.0, restitution: 0.0 });
    }
}