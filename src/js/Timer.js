class Timer {
  constructor() {
    this.reset();
  }

  start() {
    if (this.pauseTime < this.startTime) { this.reset(); }
    this.resume();
  }

  pause() {
    if (this.isPaused === false) {
      this.pauseTime = Date.now();
      this.isPaused = true;
    }
  }

  reset() {
    var now = Date.now();
    this.startTime = now;
    this.pauseTime = now;
    this.playTime = 0;
    this.lastTime = 0;
    this.isPaused = true;
  }

  resume() { 
    if (this.isPaused === true) {
      var now = Date.now();
      this.playTime += now - this.pauseTime;
      this.pauseTime = now;
      this.isPaused = false;
    }
  }

  getPlayTime() {
    var time = Date.now() - this.startTime - (this.playTime);
    if (time < this.lastTime) {
      time = this.lastTime;
    }
    else {
      this.lastTime = time;
    }
    return time;
  }

  toString() {
    var a = this.getPlayTime();
    var milliseconds = ((a / 1000) % 1).toFixed(3).slice(-3);
    var seconds = (Math.floor((a / 1000)));
    //if (("0"+seconds).length <= 2) seconds = ("0" + seconds).slice(-2);
    return seconds+"."+milliseconds;
  }

  toHTML(time) {
    return '<span>' + time.split('').join('</span><span>') + '</span>';
  }

  render(time) {
    if (time == null) time = app.timer.toString();
    var elem = app.document.getElementById('timer');
    if (elem) elem.innerHTML = app.timer.toHTML(time);
  }
}

export { Timer };