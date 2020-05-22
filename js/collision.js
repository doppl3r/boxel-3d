class Collision {
    constructor() {
        
    }

    checkPlayerCollision(e, a) {
        var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var parts = [ pair.bodyA, pair.bodyB ];

            for (var j = 0; j < parts.length; j++) {
                var partA = parts[(j + 0) % 2];
                var partB = parts[(j + 1) % 2];
                var objectA = a.level.getObjectByName(partA.parent.name);
                var objectB = a.level.getObjectByName(partB.parent.name);
                
                // Check if player is falling
                if (objectA.body.class == 'player') {
                    if (a.player.body.velocity.y >= 0) { 
                        a.player.allowJump = true; 
                    }
                }
                
                if (partA.class == 'sensor') {
                    if (objectA.body.class == 'tip') {
                        console.log('tip');
                    }
                    else if (objectA.body.class == 'bounce') {
                        var angle = objectA.body.angle;
                        var force = objectA.scale.y / 2; // Use bounce height
                        if (objectB.body.isStatic == false) objectB.force(force, angle);
                        if (objectA.body.isStatic == false) objectA.force(-force, angle); // Newton's Third Law
                        
                    }
                    else if (objectA.body.class == 'checkpoint') {
                        console.log('player checkpoint');
                    }
                    else if (objectA.body.class == 'spike') {
                        console.log('kill player');
                    }
                    else if (objectA.body.class == 'shrink') {
                        console.log('shrink player');
                    }
                    else if (objectA.body.class == 'grow') {
                        console.log('grow player');
                    }
                    else if (objectA.body.class == 'finish') {
                        console.log('finish level');
                    }
                }
            }
        }
    }
}