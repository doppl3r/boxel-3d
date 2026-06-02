import { Easing, Group as Tweens, Tween } from '@tweenjs/tween.js'

// This class utilizes tween.js within /libraries
class Animation {
  constructor() {
    this.tweens = new Tweens();
  }

  update(delta, alpha) {
    this.tweens.update();
  }

  tween(options) {
    // Set default behavior
    options = Object.assign({
      duration: 1000,
      easing: Easing.Quadratic.InOut
    }, options);

    // Create and assign tween to tween group
    var tween = new Tween(options.object, this.tweens).to(options.to, options.duration).dynamic(options.dynamic).easing(options.easing).interpolation(options.interpolation).onStart(options.onStart).onUpdate(options.onUpdate).onComplete(options.onComplete);
    return tween;
  }
}

export { Animation };