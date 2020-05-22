class Collision {
    constructor() {
        
    }

    checkPlayerCollision(e, a) {
        var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerPart = null;
            var objectPart = null;
            var player = null;
            var object = null;

            // Check if player is touching object
            if (pair.bodyA.parent.class == 'player') {
                playerPart = pair.bodyA;
                objectPart = pair.bodyB;
            }
            else if (pair.bodyB.parent.class == 'player') {
                playerPart = pair.bodyB;
                objectPart = pair.bodyA;
            }

            // Update jump status if playerPart exists in collision check
            if (playerPart != null) {
                // Set body objects
                player = a.level.getObjectByName(playerPart.parent.name);
                object = a.level.getObjectByName(objectPart.parent.name);

                // Check if player is falling
                if (a.player.body.velocity.y >= 0) { a.player.allowJump = true; }

                // Check spike collision
                if (objectPart.class == 'sensor') {
                    if (object.body.class == 'tip') {
                        console.log('tip');
                    }
                    else if (object.body.class == 'bounce') {
                        var angle = object.body.angle;
                        var force = object.scale.y / 2; // Use bounce height
                        player.force(force, angle);
                    }
                    else if (object.body.class == 'checkpoint') {
                        console.log('player checkpoint');
                    }
                    else if (object.body.class == 'spike') {
                        console.log('kill player');
                    }
                    else if (object.body.class == 'shrink') {
                        console.log('shrink player');
                    }
                    else if (object.body.class == 'grow') {
                        console.log('grow player');
                    }
                    else if (object.body.class == 'finish') {
                        console.log('finish level');
                    }
                }
            }
        }
    }
}