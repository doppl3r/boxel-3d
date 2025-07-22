import { MathUtils } from 'three';
import { Utility } from './Utility.js';
import { saveAs } from 'file-saver';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

class StorageManager {
  constructor() {
    this.levelPrefix = 'level_';
  }

  getAllLocalStorage() {
    var a = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      var v = localStorage.getItem(k);
      a[k] = v;
    }
    return a;
  }

  setAllLocalStorage(data) {
    localStorage.clear(); // Empty out old data
    Object.keys(data).forEach(function(key) { localStorage.setItem(key, data[key])})
  }

  getListOfLevels() {
    var levels = [];
    var length = localStorage.length;
    for (var i = 0; i < length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf(this.levelPrefix) >= 0) {
        levels.push({ key: key, level: JSON.parse(localStorage.getItem(key)) });
      }
    }
    levels.sort((a,b) => (a.level.name > b.level.name) ? 1 : ((b.level.name > a.level.name) ? -1 : 0));
    return levels;
  }

  getLevelData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setLevelData(key, level) {
    var index = 1;
    if (key == null) {
      while (localStorage.getItem(this.levelPrefix + index) != null) index++;
      key = 'level_' + index;
    }
    localStorage.setItem(key, JSON.stringify(level));
    return key; // Useful for sharing newly generated level key
  }

  removeLevelData(key) {
    localStorage.removeItem(key);
  }

  updateLevelDataName(key, name) {
    var levelData = this.getLevelData(key);
    levelData.name = name;
    this.setLevelData(key, levelData);
  }

  saveScore(key, score) {
    var scores = this.getScores();
    var oldScore = 999999999; // Default bad score
    var newScore = parseInt(score.replace(/[^\d]/g, ''));
    var hasNewScore = false;
    var data = scores[key];

    // Update old score if it exists
    if (data != null) {
      if (data.indexOf(':') >= 0) data += '0'; // Resolve deprecated ##:##
      oldScore = parseInt(data.replace(/[^\d]/g, ''));
    }

    // Check high score
    if (newScore < oldScore) {
      hasNewScore = true;
      scores[key] = score;
      localStorage.setItem('scores', JSON.stringify(scores));
      this.saveThumbnailAfterPopupOpened(key);
    }

    // Save missing screenshot
    if (this.getThumbnail(key) == null) {
      this.saveThumbnailAfterPopupOpened(key);
    }

    // Return new score state
    return hasNewScore;
  }

  getScores() {
    var scores = localStorage.getItem('scores');
    if (scores == null) {
      scores = '{}';
      localStorage.setItem('scores', scores);
    }
    return JSON.parse(scores); // Return player scores
  }

  saveThumbnail(key) {
    // Store screenshot
    var screenshot = app.storage.screenshot({ width: 200, height: 200, zoom: 1 });
    localStorage.setItem('thumbnail_' + key, screenshot);
  }

  saveThumbnailAfterPopupOpened(key) {
    // Create event function that removes itself when finished
    const saveThumbnailEvent = () => {
      app.storage.saveThumbnail(key);
      window.removeEventListener('popupOpened', saveThumbnailEvent);
    };

    // Add event listeners
    window.addEventListener('popupOpened', saveThumbnailEvent);
  }

  getThumbnail(key) {
    return localStorage.getItem('thumbnail_' + key);
  }

  setSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  getSettings(a = app) {
    var util = new Utility();
    var storageSettings = localStorage.getItem('settings');
    var defaultSettings = { 
      buffer: 100,
      connection: '',
      debug: false,
      controls: {
        reverse: false
      },
      language: 'en',
      levelPacks: '',
      motion: true,
      music: 'boxel-3d-pro',
      name: 'Player',
      peer: this.generateHex(''),
      progress: 1,
      quality: 10,
      scale: 1,
      skin: { id: 466, title: "Smile", url: "../png/smile.png" },
      snap: 8,
      stats: false,
      theme: 'bubble',
      volume: util.isExtension() ? 0 : 0.5,
      volumeMusic: 0.5,
      volumeEffects: 1,
    };
    var settings = defaultSettings; // Use default

    // Replace with local storage settings
    if (storageSettings != null) {
      settings = JSON.parse(storageSettings);
    }
    
    // Check if new child settings are null by looping through default
    for (var key in defaultSettings) {
      if (settings[key] == null) {
        settings[key] = defaultSettings[key];
      }
    }

    // Reformat old settings
    if (settings['peer'].length > 6) settings['peer'] = this.generateHex('');

    // Return settings object
    return settings;
  }

  async saveLevelToFile() {
    app.levelEditor.saveLevel();
    var levelData = app.level.exportToJSON(app);
    var blob = new Blob([JSON.stringify(levelData)], { type: "application/json" });
    var util = new Utility();

    if (util.isNativeApp()) {
      try {
        const version = new Date().getTime();
        const result = await Filesystem.writeFile({
          path: `${ levelData.name } v${ version }.json`,
          data: JSON.stringify(levelData),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        alert('Success! Saved to ' + result.uri);
      }
      catch (err) {
        console.error(err);
        alert(JSON.stringify(err));
      }
    }
    else {
      saveAs(blob, levelData.name);
    }
  }

  screenshot(options) {
    // Set default options
    options = Object.assign({
      width: 640,
      height: 360,
      zoom: 1,
      save: false
    }, options);

    var src = '';
    var widthOrigin = window.innerWidth;
    var heightOrigin = window.innerHeight;
    var zoomOrigin = app.graphics.camera.zoom;
    var pixelRatioOrigin = app.graphics.renderer.getPixelRatio();

    // Update camera and renderer for screenshot
    app.graphics.camera.zoom = options.zoom;
    app.graphics.camera.aspect = options.width / options.height;
    app.graphics.camera.updateProjectionMatrix();
    app.graphics.renderer.setPixelRatio(1);
    app.graphics.renderer.setSize(options.width, options.height);
    app.graphics.renderer.render(app.graphics.scene, app.graphics.camera);
    src = app.graphics.renderer.domElement.toDataURL('image/png');
    
    // Save to file
    if (options.save == true) {
      app.graphics.renderer.domElement.toBlob(blob => saveAs(blob, 'screenshot.png'));
    }
    
    // Reset camera and renderer
    app.graphics.camera.zoom = zoomOrigin;
    app.graphics.camera.aspect = widthOrigin / heightOrigin;
    app.graphics.camera.updateProjectionMatrix();
    app.graphics.renderer.setPixelRatio(pixelRatioOrigin);
    app.graphics.renderer.setSize(widthOrigin, heightOrigin);
    app.graphics.renderer.render(app.graphics.scene, app.graphics.camera);

    // Return src for data save
    return src;
  }

  loadLevelFromFile() {
    var input = document.createElement("input");
    input.setAttribute('type', 'file');
    input.setAttribute('id', 'theFile');
    input.addEventListener('change', handleFileSelect, false);
    function performClick() {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      input.dispatchEvent(evt);
    }
    function handleFileSelect(evt) {
      var files = evt.target.files;
      var f = files[0];
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
          var name = theFile.name.split('.').slice(0, -1).join('.');
          var levelData = JSON.parse(e.target.result);
          levelData.name = name; // Rename level name to file name
          app.level.clearLevel(app);
          app.level.importFromJSON(levelData, app);
        };
      })(f);
      reader.readAsText(f);
    }
    performClick();
  }

  async backupToFile() {
    var local = app.storage.getAllLocalStorage();
    var blob = new Blob([JSON.stringify(local)], { type: "application/json" });
    var util = new Utility();

    if (util.isNativeApp()) {
      try {
        const version = new Date().getTime();
        const result = await Filesystem.writeFile({
          path: `boxel_3d_backup_${ version }.json`,
          data: JSON.stringify(local),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        alert('Success! Saved to ' + result.uri);
      }
      catch (err) {
        console.error(err);
        alert(JSON.stringify(err));
      }
    }
    else {
      saveAs(blob, 'boxel_3d_backup');
    }
  }

  restoreFromFile() {
    // Open confirmation window
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'popup.text.restore_file_data',
        inputs: [
          { value: 'popup.button.restore', type: 'button',
            callback: function() {
              var input = document.createElement("input");
              input.setAttribute('type', 'file');
              input.setAttribute('id', 'theFile');
              input.addEventListener('change', handleFileSelect, false);
              function performClick() {
                var evt = document.createEvent("MouseEvents");
                evt.initEvent("click", true, false);
                input.dispatchEvent(evt);
              }
              function handleFileSelect(evt) {
                var files = evt.target.files;
                var f = files[0];
                var reader = new FileReader();
                reader.onload = (function() {
                  return function(e) {
                    var data = JSON.parse(e.target.result);
                    app.storage.setAllLocalStorage(data);

                    // Open confirmation window
                    window.dispatchEvent(new CustomEvent('openPopup', {
                      detail: {
                        text: 'popup.text.file_data_restored',
                        inputs: [{ value: 'popup.button.continue', type: 'button'}]
                      }
                    }));
                  };
                })(f);
                reader.readAsText(f);
              }
              performClick();
            }
          },
          { value: 'popup.button.cancel', type: 'button' }
        ]
      }
    }));
  }

  backupToChrome(clearChromeStorage = false) {
    // Open confirmation window
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'popup.text.save_data_to_cloud',
        inputs: [
          { value: 'popup.button.backup', type: 'button',
            callback: function() {
              var index = 0;
              if (clearChromeStorage == true) window.chrome?.storage.sync.clear(); //initially clear online storage
              for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                var value = localStorage.getItem(key);
                var obj = {};
                obj[key] = value;
                window.chrome?.storage.sync.set(obj, function() {
                  index++; // Show message on last item
                  if (index == localStorage.length) {
                    // Show confirmation
                    window.dispatchEvent(new CustomEvent('openPopup', {
                      detail: {
                        text: 'popup.text.cloud_data_saved',
                        inputs: [{ value: 'popup.button.continue', type: 'button' }]
                      }
                    }));
                  }
                });
              }
            }
          },
          { value: 'popup.button.cancel', type: 'button' }
        ]
      }
    }));
  }

  restoreFromChrome(clearLocalStorage = false) {
    // Open confirmation window
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'popup.text.restore_cloud_data',
        inputs: [
          { value: 'popup.button.restore', type: 'button',
            callback: function() {
              // Restore
              chrome?.storage.sync.get(null, function(items) {
                if (clearLocalStorage == true) localStorage.clear(); // Empty out old data
                var keys = Object.keys(items);
                for (var i = 0; i < keys.length; i++){
                  var key = keys[i];
                  var value = items[key];
                  localStorage.setItem(key, value);
                }

                // Show confirmation
                window.dispatchEvent(new CustomEvent('openPopup', {
                  detail: {
                    text: 'popup.text.cloud_data_restored',
                    inputs: [{ value: 'popup.button.continue', type: 'button' }]
                  }
                }));
              });
            }
          },
          { value: 'popup.button.cancel', type: 'button' }
        ]
      }
    }));
  }

  generateHex(prefix = '#') {
    // https://stackoverflow.com/questions/1484506/random-color-generator
    return prefix + (Math.random()*0xFFFFFF<<0).toString(16).padStart(6, '0');
  }

  generateUUID() {
    return MathUtils.generateUUID();
  }
}

export { StorageManager };