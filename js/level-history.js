class LevelHistory {
    constructor() {
        this.clear(); // Initialize empty
    }

    save(a) {
        this.history.length = this.historyIndex + 1; // Alt splice
        this.history.push(a.level.exportToJSON(a));
        this.historyIndex++;
    }

    clear() {
        this.history = [];
        this.historyIndex = 0;
    }

    undo(a) {
        if (this.historyIndex > 1) {
            this.historyIndex--;
            a.level.clearLevel(a);
            a.level.importFromJSON(this.history[this.historyIndex], a);
        }
    }

    redo(a) {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            a.level.clearLevel(a);
            a.level.importFromJSON(this.history[this.historyIndex], a);
        }
    }
}