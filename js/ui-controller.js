class UIController {
    constructor() {
        this.controller = $('.ui-controller');
        this.levelManager = this.controller.find('.level-manager');
        this.levelEditor = this.controller.find('.level-editor');
        this.levelList = this.levelManager.find('.list');
        this.objectOptions = this.levelEditor.find('.object-options');
        this.updateCanvas();
        this.bindActions();
        this.updateUI('level-manager');
    }

    bindActions() {
        this.controller.on('click', 'a', function(event){
            event.preventDefault();
            var action = $(this).attr('action');
            if (action == 'add-level') {
                var levelData = {};
                app.level.createNewLevel(app);
                levelData = app.level.exportToJSON(app); // Init default data
                app.storage.addLevelToStorage(levelData); // Store data
                app.ui.appendLevelItem(levelData);
            }
            else if (action == 'edit-level') {
                app.ui.updateLevelFromItem($(this));
                app.ui.updateUI('level-editor');
                app.resetScene(app);
            }
            else if (action == 'delete-level') {
                app.ui.removeLevelItem($(this));
            }
            else if (action == 'home') {
                app.play = false;
                app.resetScene(app);
                app.deselectScene(app);
                app.level.saveLevel(app);
                app.level.clearLevel(app);
                app.player.setPosition(0, 0, 0);
                app.ui.updateUI('level-manager');
            }
            else if (action == 'save') {
                app.resetScene(app);
                app.deselectScene(app);
                app.level.saveLevel(app);
            }
            else if (action == 'rewind') {
                app.resetScene(app);
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'pause') {
                app.play = false;
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
                app.ui.levelEditor.find('[action="play"]').removeClass('selected');
                app.ui.levelEditor.find('[action="pause"]').addClass('selected');
            }
            else if (action == 'play') {
                app.play = true;
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
                app.ui.levelEditor.find('[action="pause"]').removeClass('selected');
                app.ui.levelEditor.find('[action="play"]').addClass('selected');
            }
            else if (action == 'pin') {
                app.selectedObject.toggleStatic();
                app.ui.updateObjectOptions();
            }
            else if (action == 'rotate') {
                this.objectOptions.find('[name="rotate"]').focus();
            }
            else if (action == 'accept') {
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'trash') {
                app.level.removeObject(app.selectedObject, app);
            }
            console.log(action);
        });

        // Add object range input listeners
        this.controller.on('input', '.slider input', function(){
            event.preventDefault();
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'rotate') {
                app.selectedObject.setRotation(-val * Math.PI / 180);
            }
            else if (name == 'scale-x') {
                app.selectedObject.setScale(val, null, null);
            }
            else if (name == 'scale-y') {
                app.selectedObject.setScale(null, val, null);
            }
        });
    }

    updateUI(state) {
        this.updateCanvas();
        if (state == 'level-manager') {
            this.canvas.addClass('disabled');
            this.levelManager.removeClass('disabled');
            this.levelEditor.addClass('disabled');
            this.levelEditor.find('[action="add-cube"]').addClass('selected');
            this.levelEditor.find('[action="pause"]').addClass('selected');
            this.levelEditor.find('[action="cube"]').addClass('selected');
            this.objectOptions.addClass('disabled');
        }
        else if (state == 'level-editor') {
            // Update UI
            this.canvas.removeClass('disabled');
            this.levelManager.addClass('disabled');
            this.levelEditor.removeClass('disabled');
            this.canvas.removeClass('disabled');
        }
    }

    showObjectOptions(state) {
        if (state == true) this.objectOptions.removeClass('disabled');
        else this.objectOptions.addClass('disabled');
    }

    toggleObjectOptions() {
        this.objectOptions.toggleClass('disabled');
    }

    updateObjectOptions() {
        // Check if selected object exists
        if (app.selectedObject != null) {
            var isStatic = app.selectedObject.isStatic();
            var pinIcon = this.objectOptions.find('[action="pin"]');
            var rotation = -app.selectedObject.getRotation('degrees');
            var scaleX = app.selectedObject.scale.x;
            var scaleY = app.selectedObject.scale.y;
            var isPlayer = (app.selectedObject.getClass() == 'player');
            this.objectOptions.find('[action*="rotate"] ~ .slider input').val(rotation);
            this.objectOptions.find('[action*="scale-x"] ~ .slider input').val(scaleX);
            this.objectOptions.find('[action*="scale-y"] ~ .slider input').val(scaleY);
            
            // Enable/Disable the trash icon for player
            if (isPlayer == true) this.objectOptions.find('[action*="trash"]').addClass('disabled');
            else this.objectOptions.find('[action*="trash"]').removeClass('disabled');
            
            // Update selected pin status
            if (isStatic == true) pinIcon.addClass('selected');
            else pinIcon.removeClass('selected');
        }
    }

    removeListOfLevels() {
        this.levelList.empty();
    }

    appendListOfLevels(a) {
        var list = a.storage.getListOfLevels();
        var levelData = {};

        // Add empty level if none exist
        if (list.length < 1) {
            a.level.createNewLevel(a);
            levelData = a.level.exportToJSON(a);
            a.storage.addLevelToStorage(levelData);
            list.push(levelData);
        }

        // Append each list item
        this.removeListOfLevels(); // Empty list before populating
        for (var i = 0; i < list.length; i++) {
            levelData = list[i];
            a.ui.appendLevelItem(levelData);
        }
    }

    appendLevelItem (levelData) {
        this.levelList.append(
            '<div class="item">' +
                '<input type="text" key="' + levelData.key + '" value="' + levelData.name + '">' +
                '<a action="edit-level" title="Edit level"><img src="img/svg/pencil.svg"></a>' +
                '<a action="upload-level" title="Upload level"><img src="img/svg/upload.svg"></a>' +
                '<a action="delete-level" title="Delete level"><img src="img/svg/trash.svg"></a>' +
            '</div>'
        );
    }

    removeLevelItem(button) {
        var item = button.parent();
        var key = item.find('input').attr('key');
        app.storage.deleteLevelFromStorage(key);
        item.remove();
    }

    updateLevelFromItem(button) {
        // Select level details from HTML input attributes & values
        var item = button.parent();
        var key = item.find('input').attr('key');
        var name = item.find('input').val();
        var levelData = app.storage.getLevelFromStorage(key);

        // Update current level with selected attributes
        levelData.name = name;
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);
    }

    updateCanvas() {
        if (this.canvas == null || this.canvas.length <= 0) {
            this.canvas = $('canvas');
        }
    }
}