/*
  Executes single or multiple functions at a recurring frequency. The first
  function loop determines the shared alpha value for all sibling functions.

  Tip: Add your physics function first (ex: 30hz), then add the rendering
  function at a higher frequency (ex: -1 = unlimited). Use the alpha value
  to interpolate rendered objects between engine steps.

  Clock credit: mrdoob
*/

class Loop {
  constructor() {
    this.callbacks = [];
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.speed = 1;
    this.running = false;
  }

  add(tick = 60, callback = function(){}) {
    // Add callback function to array of functions
    this.callbacks.push({
      rate: 1 / tick,
      sum: 1 / tick,
      alpha: 0,
      callback: callback // Execute function after each interval
    });
  }

  update(loop) {
    if (this.running == true) {
      // Request visual update function before next repaint
      requestAnimationFrame(function(){ loop.update(loop); });

      // Check if functions exist
      if (this.callbacks.length > 0) {
        var delta = this.getDelta();
        var alpha = this.callbacks[0].sum / this.callbacks[0].rate; // Set alpha relative to first interval

        // Loop through array of functions (descending order)
        for (var i = this.callbacks.length - 1; i >= 0; i--) {
          this.callbacks[i].sum += delta;

          // Trigger this.callbacks[i] callback
          if (this.callbacks[i].sum >= this.callbacks[i].rate || this.callbacks[i].rate == -1) {
            this.callbacks[i].sum %= this.callbacks[i].rate;
            this.callbacks[i].callback({
              delta: (this.callbacks[i].rate == -1) ? delta : this.callbacks[i].rate,
              alpha: alpha
            });
          }
        }
      }
    }
  }

  start() {
    this.startTime = this.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
    this.update(this);
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;

    // Update the elapsed time if the clock is running
    if (this.running) {
      const newTime = this.now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff * this.speed;
  }

  now() {
    return (typeof performance === 'undefined' ? Date : performance).now();
  }
}

export { Loop };