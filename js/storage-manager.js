class StorageManager {
    constructor() {
        this.levelPrefix = 'level_';
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

    saveScore(levelName, score) {
        var scores = this.getScores();
        var oldScore = 999999; // Default bad score
        var newScore = parseInt(score.replace(/[^\d]/g, ''));
        var hasNewScore = false;
        var data = scores[levelName];

        // Update old score if it exists
        if (data != null) {
            if (data.indexOf(':') >= 0) data += '0'; // Resolve deprecated ##:##
            oldScore = parseInt(data.replace(/[^\d]/g, ''));
        }

        // Check high score
        if (newScore < oldScore) {
            hasNewScore = true;
            scores[levelName] = score;
            localStorage.setItem('scores', JSON.stringify(scores));
        }
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

    setSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    getSettings() {
        var storageSettings = localStorage.getItem('settings');
        var defaultSettings = { 'volume': 0, 'quality': 10, 'theme': 0, 'snap': 8, 'skin': 1, 'progress': 1 };
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
        return settings;
    }

    addLicense(license) {
        var licenses = this.getLicenses();
        var licenseExists = false;

        // Loop through local storage object and check if key exists
        Object.keys(licenses).forEach(function(key) {
            if (licenses[key]['key'] == license['key']) {
                licenseExists = true;
            }
        });

        // Add to local storage if license does not exist
        if (licenseExists == false) {
            licenses.push(license)
            localStorage.setItem('licenses', JSON.stringify(licenses));
        }
        
        return !licenseExists; // Returns 'true' if added
    }

    getLicenses() {
        var licenses = localStorage.getItem('licenses');
        var defaultLicenses = [
            { 'key': 1, 'product': { 'id': 1, 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/1.png' }},
            { 'key': 2, 'product': { 'id': 2, 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/2.png' }}
        ];
        if (licenses == null) {
            licenses = JSON.stringify(defaultLicenses);
            localStorage.setItem('licenses', licenses);
        }
        return JSON.parse(licenses); // Return licenses
    }

    getLicenseById(id) {
        var licenses = this.getLicenses();
        var license = null;
        for (var i = 0; i < licenses.length; i++) {
            license = licenses[i];
            if (license['product']['id'] == id) break;
        }
        return license;
    }

    saveLevelToFile() {
        app.resetScene(app);
        app.level.deselectLevel(app);
        app.level.saveLevelData(app);
        var levelData = app.level.exportToJSON(app);
        var blob = new Blob([JSON.stringify(levelData)], { type: "application/json" });
        saveAs(blob, levelData.name);
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
}