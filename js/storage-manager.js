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

    getSettings() {
        var settings = localStorage.getItem('settings');
        if (settings == null) {
            settings = { 'volume': 0, 'quality': 5, 'theme': 0, 'snap': 8 };
            this.setSettings(settings);
            return settings;
        }
        return JSON.parse(settings);
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

    addLicense(license) {
        var licenses = this.getLicenses();
        var licenseKey = license['licenseKey'];
        var licenseExists = false;

        // Loop through local license array
        for (var i = 0; i < licenses.length; i++) {
            var license = licenses[i];
            if (license['licenseKey'] == licenseKey) {
                licenseExists = true;
                break; // End the search
            }
        }

        // Add to local storage if it does not exist
        if (licenseExists == false) {
            licenses.push(license)
            localStorage.setItem('licenses', JSON.stringify(licenses));
        }
        
        return !licenseExists; // Returns 'true' if added
    }

    getLicenses() {
        var licenses = localStorage.getItem('licenses');
        if (licenses == null) {
            licenses = '[]';
            localStorage.setItem('licenses', licenses);
        }
        return JSON.parse(licenses); // Return licenses
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