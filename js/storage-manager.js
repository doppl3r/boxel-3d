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
                levels.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        levels.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return levels;
    }

    getLevelDataFromStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    updateLevelDataToStorage(key, levelData) {
        localStorage.setItem(key, JSON.stringify(levelData));
    }

    addLevelDataToStorage(level) {
        var index = 1;
        while (localStorage.getItem(this.levelPrefix + index) != null) index++;
        level.key = this.levelPrefix + index; // Store key in JSON object
        localStorage.setItem(this.levelPrefix + index, JSON.stringify(level));
    }

    deleteLevelDataFromStorage(key) {
        localStorage.removeItem(key);
    }

    updateLevelDataName(key, name) {
        var levelData = this.getLevelDataFromStorage(key);
        levelData.name = name;
        this.updateLevelDataToStorage(key, levelData);
    }

    getSettingsFromStorage() {
        var settings = localStorage.getItem('settings');
        if (settings == null) {
            settings = { 'volume': 5, 'quality': 10, 'theme': 0 };
            this.setSettingsFromStorage(settings);
            return settings;
        }
        return JSON.parse(settings);
    }

    setSettingsFromStorage(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}