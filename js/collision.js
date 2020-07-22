class Collision {
    constructor() {
        
    }

    checkPlayerCollision(e, a) {
        var pairs = e.pairs;

        // Loop through pairs of collisions
        for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
            var pair = pairs[pairIndex];
            var bodies = [pair.bodyA, pair.bodyB];

            // Switch and compare bodies (bodyA and bodyB)
            for (var bodyIndex = 0; bodyIndex < bodies.length; bodyIndex++) {
                var bodyA = bodies[(bodyIndex + 0) % 2]; // Switch bodyA to bodyB
                var bodyB = bodies[(bodyIndex + 1) % 2]; // Switch bodyB to bodyA
                var objectA = a.level.getObjectByName(bodyA.parent.name);
                var objectB = a.level.getObjectByName(bodyB.parent.name);

                // Check if player is falling
                if (objectA.body.class == 'player') {
                    a.player.allowJump = true;
                }

                // Check bodies if bodyB is not a sensor. This prevents sensors reacting to each other.
                if (bodyB.class != 'sensor') {


                    // Check sensor points
                    if (bodyA.class == 'sensor') {
                        if (objectA.body.class == 'tip') {
                            if (objectB.body.class == 'player') {
                                var tip = objectA.text;
                                app.ui.showTip(tip);
                                objectA.hide(true);
                            }
                        }
                        else if (objectA.body.class == 'bounce') {
                            var force = objectA.scale.y / 2; // Use bounce height
                            if (objectA.body.isStatic == false) { objectA.force(force, objectB, true); } // Yeet bounce cube backwards
                            if (objectB.body.isStatic == false) { objectB.force(force, objectA); }
                        }
                        else if (objectA.body.class == 'checkpoint') {
                            if (objectB.body.class ==  'player') { app.player.saveCheckpoint(objectA.position); }
                        }
                        else if (objectA.body.class == 'spike') {
                            if (objectB.body.class ==  'player') { app.player.kill(); }
                        }
                        else if (objectA.body.class == 'shrink') {
                            if (objectB.body.class ==  'player') {
                                app.player.shrink();
                                objectA.hide(true);
                            }
                        }
                        else if (objectA.body.class == 'grow') {
                            if (objectB.body.class ==  'player') {
                                app.player.grow();
                                objectA.hide(true);
                            }
                        }
                        else if (objectA.body.class == 'resize') {
                            if (objectB.body.class ==  'player') {
                                objectB.setScale(objectA.scale, false);
                            }
                        }
                        else if (objectA.body.class == 'finish') {
                            if (objectB.body.class ==  'player') { app.player.finish(); }
                        }
                    }
                }
            }
        }
    }
}