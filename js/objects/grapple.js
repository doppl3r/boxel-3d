class Grapple {
    constructor() {
        this.material = new MeshLineMaterial({ color: '#ffffff', lineWidth: 8 });
        this.line = new MeshLine();
        this.mesh = new THREE.Mesh(this.line, this.material);
    }

    add(pointA, bodyB) {
        // Add graphics
        var points = [];
        this.speed = 1; // Start slow
        points.push(new THREE.Vector3(pointA.x, pointA.y, 0));
        points.push(new THREE.Vector3(bodyB.position.x, -bodyB.position.y, 0));
        this.line.setPoints(points);
        app.level.add(this.mesh);

        // Add physics
        this.constraint = Matter.Constraint.create({ pointA: pointA, bodyB: bodyB });
        Matter.World.add(app.engine.world, this.constraint);
    }

    remove() {
        if (this.constraint != null) {
            app.level.remove(this.mesh);
            Matter.World.remove(app.engine.world, this.constraint);
        }
    }

    update(pointA, bodyB) {
        var points = [];
        this.constraint.length -= this.speed;
        this.speed += 0.025;
        if (this.constraint.length <= 8) this.remove();
        
        points.push(new THREE.Vector3(pointA.x, pointA.y, 0));
        points.push(new THREE.Vector3(bodyB.position.x, -bodyB.position.y, 0));
        this.line.setPoints(points);
    }
}