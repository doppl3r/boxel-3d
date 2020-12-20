class Rope extends THREE.Group {
    constructor() {
        super();
        this.radius = 8;
        this.joints = 4;
        this.speed = 1 / this.joints;
    }

    addJoints(bodyA, pointB) {
        var p1 = bodyA.position;
        var p2 = pointB;

        for (var i = 1; i <= this.joints; i++) {
            var percent = i / this.joints;
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
                speed: this.speed
            };

            // Add new joint
            var joint = new Joint(options);
            this.add(joint);
        }

        // Add joints to level group
        app.level.add(this);

        // Set last body to static
        Matter.Body.setStatic(this.children[this.children.length - 1].body, true);
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
    
    updateJoints() {
        for (var i = 0; i < this.children.length; i++) {
            var points = [];
            var child = this.children[i];
            var pointA = child.constraint.bodyA.position;
            var pointB = child.constraint.bodyB.position;
            
            // Shrink every joint
            //child.shrink();

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
        this.lineMaterial = new MeshLineMaterial({ color: '#ffffff', lineWidth: options.radius * 2, opacity: 0.5, transparent: true });
        this.lineMesh = new THREE.Mesh(this.line, this.lineMaterial);
        this.add(this.lineMesh);
    }

    addCircleMesh(options) {
        // Circle mesh
        this.circle = new THREE.CircleGeometry(options.radius, 12); // radius, segments
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' });
        this.circleMesh = new THREE.Mesh(this.circle, this.circleMaterial);
        this.add(this.circleMesh);
    }

    addBody(options) {
        // Physical body
        this.part = Matter.Bodies.circle(options.position.x, options.position.y, options.radius);
        this.body = Matter.Body.create({ parts: [this.part], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0, mass: 0 });
    }

    removeBody() {
        Matter.World.remove(app.engine.world, this.body);
    }

    addConstraint(options) {
        // Constraint
        this.constraint = Matter.Constraint.create({
            bodyA: options.bodyA,
            bodyB: this.body
        });
        Matter.World.add(app.engine.world, this.constraint);
    }

    removeConstraint() {
        Matter.World.remove(app.engine.world, this.constraint);
    }

    shrink() {
        if (this.constraint.length > 0) {
            this.constraint.length -= this.speed;
            this.speed += 0.0125;
        }
        else this.constraint.length = 0;
    }
}