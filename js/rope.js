class Rope extends THREE.Group {
    constructor() {
        super();
        this.radius = 8;
    }

    addJoints(bodyA, pointB) {
        var p1 = bodyA.position;
        var p2 = pointB;
        var length = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        //var joints = Math.floor(length / (this.radius * 2)) / 2;
        var joints = 1;
        var speed = 1 / joints;

        for (var i = 1; i <= joints; i++) {
            var percent = i / joints;
            var jointPosition = { 
                x: p1.x + ((p2.x - p1.x) * percent),
                y: p1.y + ((p2.y - p1.y) * percent)
            };
            
            // Update bodyA to previous joint
            if (i > 1) { bodyA = this.children[this.children.length - 1].body; }

            // Update joint options
            var options = {
                position: jointPosition,
                bodyA: bodyA,
                radius: this.radius,
                speed: speed
            };

            // Add new joint
            var joint = new Joint(options);
            this.add(joint);
        }

        // Set last body to static
        if (this.children.length > 0) {
            Matter.Body.setStatic(this.children[this.children.length - 1].body, true);
        }
    }
    
    removeJoints() {
        var length = this.children.length;
        var index = length - 1;

        // Loop through each child
        while (index >= 0) {
            var child = this.children[index];
            child.removeConstraint();
            child.removeBody();
            this.remove(child);
            index--;
        }
    }

    resetToOrigin() {
        this.removeJoints();
    }
    
    updateJoints() {
        for (var i = 0; i < this.children.length; i++) {
            var points = [];
            var child = this.children[i];
            var pointA = child.constraint.bodyA.position;
            var pointB = child.constraint.bodyB.position;
            
            // Shrink every joint
            child.shrink();

            // Update line mesh
            points.push(new THREE.Vector3(pointA.x,- pointA.y, 0));
            points.push(new THREE.Vector3(pointB.x, -pointB.y, 0));
            child.line.setPoints(points);

            // Update circle mesh
            child.circleMesh.position.set(pointB.x, -pointB.y, 0);
        }
    }
}

class Joint extends THREE.Group {
    constructor(options) {
        super();
        this.addLineMesh(options);
        this.addCircleMesh(options);
        this.addBody(options);
        this.addConstraint(options);
    }

    addLineMesh(options) {
        // Line mesh
        this.speed = options.speed; // Shrink speed
        this.line = new MeshLine();
        this.lineMaterial = new MeshLineMaterial({ color: '#ffffff', lineWidth: options.radius * 2, opacity: 1, transparent: true });
        this.lineMesh = new THREE.Mesh(this.line, this.lineMaterial);
        this.add(this.lineMesh);
    }

    addCircleMesh(options) {
        // Circle mesh
        this.circle = new THREE.CircleGeometry(options.radius, 12); // radius, segments
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', opacity: 1, transparent: true });
        this.circleMesh = new THREE.Mesh(this.circle, this.circleMaterial);
        this.add(this.circleMesh);
    }

    addBody(options) {
        // Physical body
        this.part = Matter.Bodies.circle(options.position.x, options.position.y, options.radius);
        this.body = Matter.Body.create({ parts: [this.part], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0 });
        this.body.collisionFilter.category = 1;
        Matter.World.add(app.engine.world, this.body);
    }

    removeBody() {
        Matter.World.remove(app.engine.world, this.body);
    }

    addConstraint(options) {
        // Constraint
        this.constraint = Matter.Constraint.create({ bodyA: options.bodyA, bodyB: this.body, radius: options.radius, shrink: true, mass: 0, stiffness: 1.5 });
        Matter.World.add(app.engine.world, this.constraint);
    }

    removeConstraint() {
        Matter.World.remove(app.engine.world, this.constraint);
    }

    shrink() {
        if (this.constraint.shrink == true) {
            if (this.constraint.length > this.constraint.radius * 2) {
                this.constraint.length -= this.speed;
                //this.speed += 0.0125;
            }
            else {
                this.constraint.length = this.constraint.radius * 2;
                this.constraint.shrink = false;
            }
        }
    }
}