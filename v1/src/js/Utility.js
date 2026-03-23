import { Capacitor } from '@capacitor/core';

class Utility {
  constructor() {

  }

  randomNumber(min, max) {  
    return Math.random() * (max - min) + min; 
  }
  
  getVectorFromAngle(angle = 0, decimal = 1) {
    var pi = Math.PI;
    var decimal = 1e3;
    var degrees = -angle * (180/pi);
    var x = Math.round(Math.cos((90 - degrees) * (pi / 180)) * decimal) / decimal;
    var y = Math.round(Math.sin((90 - degrees) * (pi / 180)) * decimal) / decimal;
    return { x: x, y: y };
  }
  
  getAngleFromVector(vector){
    var angle = Math.atan2(vector.y, vector.x);
    var degrees = 180*angle/Math.PI;  //degrees
    return this.degreesToRadians((360 + Math.round(degrees)) % 360);
  }
  
  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }
  
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  isJSON(str) {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
  }

  isExtension() {
    return window.chrome?.extension != undefined;
  }

  isDesktopApp() {
    return window.desktop != null;
  }

  isNativeApp() {
    return Capacitor.isNativePlatform();
  }

  isFullscreen() {
    return document.fullscreenElement != null;
  }

  openLink(url, target = '_blank') {
    if (window.chrome?.tabs) window.chrome.tabs.create({ url: url });
    else if (window.desktop?.openExternal && target === '_blank') window.desktop.openExternal(url);
    else window.open(url, target);
  }
}

export { Utility };