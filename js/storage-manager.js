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
        return levels;
    }

    getLevelFromStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    updateLevelToStorage(key, levelData) {
        localStorage.setItem(key, JSON.stringify(levelData));
    }

    addLevelToStorage(level) {
        var index = 1;
        while (localStorage.getItem(this.levelPrefix + index) != null) index++;
        level.key = this.levelPrefix + index; // Store key in JSON object
        localStorage.setItem(this.levelPrefix + index, JSON.stringify(level));
    }

    deleteLevelFromStorage(key) {
        localStorage.removeItem(key);
    }
}