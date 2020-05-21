class Collision {
    constructor() {
        
    }

    checkPlayerCollision(e, a) {
        var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerPart = null;
            var objectPart = null;
            var playerBody = null;
            var objectBody = null;

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
                playerBody = playerPart.parent;
                objectBody = objectPart.parent;

                // Check if player is falling
                if (a.player.body.velocity.y >= 0) { a.player.allowJump = true; }

                // Check spike collision
                if (objectPart.class == 'sensor') {
                    if (objectBody.class == 'jump') {
                        console.log('jump');
                    }
                    else if (objectBody.class == 'spike') {
                        console.log('kill player');
                    }
                }
            }
        }
    }
}