import { TextureLoader } from 'three';
import json from '../json/textures.json';

class Textures {
  constructor(manager) {
    this.cache = {};
    this.loader = new TextureLoader(manager);
  }

  load() {
    var _this = this;
    for (const [key, value] of Object.entries(json)) {
      this.loader.load(value.url, function(texture) {
        // Load model from gltf.scene Object3D (includes SkinnedMesh)
        _this.cache[key] = texture;
        _this.cache[key]['name'] = key;
        _this.cache[key].magFilter = value.magFilter || 1006; // LinearFilter (default) = 1006, NearestFilter = 1003
      });
    }
  }

  generateCheckered() {
    var canvas =  document.createElement('canvas');
    var context = canvas.getContext('2d');
    var texture = new Texture(canvas);

    // Initialize values
    canvas.width = 16;
    canvas.height = 16;
    context.fillColor = 'rgba(0, 0, 0, 0.5)';

    // Draw the 8x8 grid twice (with offset makes it 16x16 pattern)
    for (var i = 0; i < 2; i++) {
      // Loop through rows
      for (var row = 0; row < canvas.height / 2; row++) {
        // Loop through columns
        for (var col = 0; col < canvas.width / 2; col++) {
          // Draw 1x1 pixels with empty spaces
          context.rect((col * 2) + i, (row * 2) + i, 1, 1);
        }
      }
    }

    // Fill context with rectangles
    context.fill();

    // Return newly generated texture
    texture.needsUpdate = true;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }
}

export { Textures };