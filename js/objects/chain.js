class Chain extends THREE.Group {
    constructor() {
        super();
        this.radius = 2;
        this.joints = 8;
    }

    addLinks(bodyA, pointB) {
        var length = Math.sqrt(Math.pow((bodyA.position.x - pointB.x), 2) + Math.pow((bodyA.position.y - pointB.y), 2));

        for (var i = 0; i < this.joints; i++) {
            var a = i / this.joints;
            var b = (i + 1) / this.joints;
            
            // Change bodyA if a link exists
            if (this.children.length > 0) {
                bodyA = this.children[this.children.length - 1];
            }

            var options
            var link = new Link(options);
        }
        console.log(length);
    }
    
    removeLinks() {
        console.log('remove');
        
    }
    
    updateLinks() {
        console.log('update');
        
    }
}

class Link extends THREE.Group {
    constructor(options) {
        // Line mesh
        this.line = new MeshLine();
        this.lineMaterial = new MeshLineMaterial({ color: '#ffffff', lineWidth: 8 });
        this.lineMesh = new THREE.Mesh(this.line, this.lineMaterial);
        this.add(this.lineMesh);
        
        // Circle mesh
        this.circle = new THREE.CircleGeometry(8, 12); // radius, segments
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' });
        this.circleMesh = new THREE.Mesh(this.circle, this.circleMaterial);
        this.add(this.circleMesh);

        // TODO: add body (circle) and constraint (line)

        //this.circle = Matter.Bodies.circle(); // TODO
        //this.body = Matter.Body.create({ parts: [this.circle], friction: 0.0, frictionAir: 0.0, frictionStatic: 0.0, restitution: 0.0 });
    }
}