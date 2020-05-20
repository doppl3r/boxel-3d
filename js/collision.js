class Collision {
    constructor() {
        
    }

    checkPlayerCollision(e, a) {
        var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerBody = null;
            var objectBody = null;

            // Check if player is touching object
            if (pair.bodyA.class == 'player') {
                playerBody = pair.bodyA;
                objectBody = pair.bodyB;
            }
            else if (pair.bodyB.class == 'player') {
                playerBody = pair.bodyB;
                objectBody = pair.bodyA;
            }

            // Update jump status if playerBody exists in collision check
            if (playerBody != null) {
                // Check if player is falling
                if (a.player.body.velocity.y >= 0) {
                    a.player.allowJump = true;
                }
            }
        }
    }
}