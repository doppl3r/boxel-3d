class LevelHistory {
    constructor() {
        this.clear(); // Initialize empty
    }

    save(description = "Edited level") {
        this.history.length = this.historyIndex + 1; // Alt splice
        this.history.push({ 
            'data': app.level.exportToJSON(),
            'description': description
        });
        this.historyIndex++;
    }

    clear() {
        this.history = [];
        this.historyIndex = 0;
    }

    undo() {
        if (this.historyIndex > 1) {
            this.historyIndex--;
            app.level.clearLevel();
            app.level.importFromJSON(this.history[this.historyIndex].data);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            app.level.clearLevel();
            app.level.importFromJSON(this.history[this.historyIndex].data);
        }
    }
}

export { LevelHistory };