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
        var record = this.getRecord();
        var oldScore = parseInt(record[levelName]);
        var newScore = parseInt(score);
        var hasNewRecord = false;

        // Resolve null score
        if (isNaN(oldScore)) oldScore = 999999;

        // Check high score
        if (newScore < oldScore) {
            hasNewRecord = true;
            record[levelName] = score;
            localStorage.setItem('record', JSON.stringify(record));
        }
        return hasNewRecord;
    }

    getRecord() {
        var record = localStorage.getItem('record');
        if (record == null) {
            record = '{}';
            localStorage.setItem('record', JSON.stringify(record));
        }
        return JSON.parse(record); // Return player record
    }

    setSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}