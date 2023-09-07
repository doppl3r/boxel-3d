import { CircleGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Bodies, Body, Constraint, World } from 'matter-js';

class Rope extends Group {
    constructor() {
        super();
        this.radius = 4; // controls width and joint body size
    }

    addJoints(bodyA, bodyB, pointB) {
        var p1 = bodyA.position;
        var p2 = pointB;
        var length = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        var joints = 4;
        var spacing = Math.ceil(length / (this.radius * 2) / joints);
        var minLength = 16 / joints;
        var speed = 1 / joints;

        for (var i = 1; i <= joints; i++) {
            var isLastJoint = (i == joints);
            var percent = i / joints;
            var jointPosition = { 
                x: p1.x + ((p2.x - p1.x) * percent),
                y: p1.y + ((p2.y - p1.y) * percent)
            };
            
            // Update bodyA to previous joint
            if (i > 1) { bodyA = this.children[this.children.length - 1].body; }

            // Update joint options
            var options = {
                bodyA: bodyA,
                bodyB: bodyB,
                isLastJoint: isLastJoint,
                minLength: minLength,
                position: jointPosition,
                radius: this.radius,
                spacing: spacing,
                speed: speed,
                texture: this.texture
            };

            // Add new joint
            var joint = new Joint(options);
            this.add(joint);
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
            if (child.line2 != null) {
                points.push(pointA.x, -pointA.y, 0);
                points.push(pointB.x + child.offset.x, -(pointB.y + child.offset.y), 0);
                child.line2Geometry.setPositions(points);
                child.line2.computeLineDistances();
            }

            // Update circle mesh
            if (child.circleMesh != null) {
                child.circleMesh.position.set(pointB.x, -pointB.y, 0);
            }
        }
    }
}

class Joint extends Group {
    constructor(options) {
        super();
        this.addLineMesh(options);
        //this.addCircleMesh(options);
        this.addBody(options);
        this.addConstraint(options);
    }

    addLineMesh(options) {
        // Line mesh
        this.speed = options.speed; // Shrink speed
        this.minLength = options.minLength;
        
        // Add new fat line
        this.line2Geometry = new LineGeometry();
        this.line2Material = new LineMaterial({ color: '#ffffff', dashed: false, linewidth: 1 / 128, dashScale: 1, dashSize: 8, gapSize: 2 });
        this.line2 = new Line2(this.line2Geometry, this.line2Material);
        this.add(this.line2);
    }

    addCircleMesh(options) {
        // Circle mesh
        this.circle = new CircleGeometry(options.radius, 12); // radius, segments
        this.circleMaterial = new MeshBasicMaterial({ color: '#ffffff', opacity: 1.0, transparent: true });
        this.circleMesh = new Mesh(this.circle, this.circleMaterial);
        this.add(this.circleMesh);
    }

    removeCircleMesh() {
        this.remove(this.circleMesh);
    }

    addBody(options) {
        // Physical body
        this.part = Bodies.circle(options.position.x, options.position.y, options.radius, { isSensor: true });
        this.body = Body.create({ parts: [this.part], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0 });
        World.add(app.engine.world, this.body);
    }

    removeBody() {
        World.remove(app.engine.world, this.body);
    }

    addConstraint(options) {
        // Constraint
        var bodyB = this.body;
        var pointB = { x: 0, y: 0 };

        // Update last joint properties
        if (options.isLastJoint == true) {
            this.removeBody();
            this.removeCircleMesh();
            bodyB = options.bodyB;
            pointB = {
                x: -(bodyB.position.x - options.position.x),
                y: -(bodyB.position.y - options.position.y)
            };
        }

        // Configure constraint options
        this.offset = pointB; // Used for last joint
        this.constraint = Constraint.create({ bodyA: options.bodyA, bodyB: bodyB, mass: 0, pointB: pointB, stiffness: 1.5, shrink: true });
        World.add(app.engine.world, this.constraint);
    }

    removeConstraint() {
        World.remove(app.engine.world, this.constraint);
    }

    shrink() {
        if (this.constraint.shrink == true) {
            if (this.constraint.length > this.minLength) {
                this.constraint.length -= this.speed;
            }
            else {
                this.constraint.length = this.minLength;
                this.constraint.shrink = false;
            }
        }
    }
}

export { Rope };