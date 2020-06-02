class UIController {
    constructor() {
        this.controller = $('.ui-controller');
        this.levelManager = this.controller.find('.level-manager');
        this.levelEditor = this.controller.find('.level-editor');
        this.levelList = this.levelManager.find('.list');
        this.levelOptions = this.levelEditor.find('.options-level');
        this.objectType = this.levelEditor.find('.object-type');
        this.objectOptions = this.levelEditor.find('.object-options');
        this.updateCanvas();
        this.bindActions();
        this.updateUI('level-manager');
    }

    bindActions() {
        // Bind button actions
        this.controller.on('click', '[action]', function(event) {
            event.preventDefault();
            var action = $(this).attr('action');
            if (action == 'add-level') {
                var levelData = {};
                app.level.createNewLevel(app);
                levelData = app.level.exportToJSON(app); // Init default data
                app.storage.addLevelDataToStorage(levelData); // Store data
                app.ui.appendLevelItem(levelData);
            }
            else if (action == 'edit-level') {
                app.ui.updateLevelFromItem($(this));
                app.ui.updateUI('level-editor');
                app.levelHistory.save(app);
                app.resetScene(app);
            }
            else if (action == 'delete-level') {
                app.ui.addDialog({
                    text: 'Are you sure you want to <em>delete</em> this level?',
                    buttons: [
                        { function: app.ui.removeLevelItem, parameter: $(this), text: 'Yes' },
                        { text: 'No' }
                    ]
                });
            }
            else if (action == 'draw') {
                app.mouse.setMode('draw');
                app.ui.updateLevelOptions();
            }
            else if (action == 'erase') {
                app.mouse.setMode('erase');
                app.ui.updateLevelOptions();
            }
            else if (action == 'home') {
                app.ui.addDialog({
                    text: 'Would you like to <em>save</em> your level?',
                    buttons: [
                        { function: app.ui.saveAndExitLevelEditor, parameter: false, text: 'No' },
                        { function: app.ui.saveAndExitLevelEditor, parameter: true, text: 'Yes' }
                    ]
                });
            }
            else if (action == 'save') {
                app.resetScene(app);
                app.deselectScene(app);
                app.level.saveLevelData(app);
            }
            else if (action == 'undo') {
                app.levelHistory.undo(app);
            }
            else if (action == 'redo') {
                app.levelHistory.redo(app);
            }
            else if (action == 'rewind') {
                app.resetScene(app);
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'pause') {
                app.ui.pause();
            }
            else if (action == 'play') {
                app.ui.play();
            }
            else if (action == 'cube') { app.ui.selectObjectType(action); }
            else if (action == 'tip') { app.ui.selectObjectType(action); }
            else if (action == 'bounce') { app.ui.selectObjectType(action); }
            else if (action == 'checkpoint') { app.ui.selectObjectType(action); }
            else if (action == 'spike') { app.ui.selectObjectType(action); }
            else if (action == 'shrink') { app.ui.selectObjectType(action); }
            else if (action == 'grow') { app.ui.selectObjectType(action); }
            else if (action == 'finish') { app.ui.selectObjectType(action); }
            else if (action == 'pin') {
                app.selectedObject.toggleStatic();
                app.ui.updateObjectOptions();
            }
            else if (action == 'rotate') {
                this.objectOptions.find('[name="rotate"]').focus();
            }
            else if (action == 'text') {
                app.ui.addDialog({
                    text: 'Share a tip!',
                    input: true,
                    buttons: [
                        { text: 'Cancel' },
                        { function: app.ui.updateTip, parameter: $(this), text: 'Accept' }
                    ]
                });
            }
            else if (action == 'accept') {
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'trash') {
                app.level.removeObject(app.selectedObject, app);
                app.levelHistory.save(app);
            }
            console.log(action);
        });

        // Add object range input listeners
        this.controller.on('input', '.slider input', function(event){
            event.preventDefault();
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'rotate') { app.selectedObject.setRotation(-val * Math.PI / 180); }
            else if (name == 'scale-x') { app.selectedObject.setScale(val, null, null); }
            else if (name == 'scale-y') { app.selectedObject.setScale(null, val, null); }
        });

        // Save level history when input slider is updated
        this.controller.on('mouseup', '.slider input', function(event){
            event.preventDefault();
            app.levelHistory.save(app);
        });

        // Add level name change listener
        this.controller.on('focusout', '.list input', function(event) {
            event.preventDefault();
            app.ui.updateLevelDataName($(this));
        })
    }

    selectObjectType(type) {
        app.ui.objectType.find('[action]').removeClass('selected');
        app.ui.objectType.find('[action=' + type + ']').addClass('selected');
    }

    getSelectedObjectType() {
        return app.ui.objectType.find('.selected').attr('action');
    }

    updateUI(state) {
        this.updateCanvas();
        if (state == 'level-manager') {
            this.canvas.addClass('disabled');
            this.levelManager.removeClass('disabled');
            this.levelEditor.addClass('disabled'); // Hide while manager is open
            this.levelEditor.find('[action]').removeClass('selected'); // Clear all selected
            this.updateLevelOptions(); // Update top bar
            this.objectType.find('[action="cube"]').addClass('selected');
            this.objectOptions.addClass('disabled');
        }
        else if (state == 'level-editor') {
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

    updateLevelOptions() {
        var mode = 'draw';
        var play = 'pause';
        if (app != null) {
            mode = app.mouse.mode;
            play = app.play == true ? 'play' : 'pause';
        }
        this.levelOptions.find('[action="pause"], [action="pause"]').removeClass('selected');
        this.levelOptions.find('[action="draw"], [action="erase"]').removeClass('selected');
        this.levelOptions.find('[action="' + mode + '"]').addClass('selected');
        this.levelOptions.find('[action="' + play + '"]').addClass('selected');
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
            var isTip = (app.selectedObject.getClass() == 'tip');
            this.objectOptions.find('[action*="rotate"] ~ .slider input').val(rotation);
            this.objectOptions.find('[action*="scale-x"] ~ .slider input').val(scaleX);
            this.objectOptions.find('[action*="scale-y"] ~ .slider input').val(scaleY);
            
            // Enable/Disable the trash icon for player
            if (isPlayer == true) this.objectOptions.find('[action*="trash"]').addClass('disabled');
            else this.objectOptions.find('[action*="trash"]').removeClass('disabled');
            
            // Enable/Disable the tip icon for tip block
            if (isTip == true) this.objectOptions.find('[action*="text"]').removeClass('disabled');
            else this.objectOptions.find('[action*="text"]').addClass('disabled');
            
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
            a.storage.addLevelDataToStorage(levelData);
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
        app.storage.deleteLevelDataFromStorage(key);
        item.remove();
    }

    updateLevelFromItem(button) {
        // Select level details from HTML input attributes & values
        var item = button.parent();
        var key = item.find('input').attr('key');
        var name = item.find('input').val();
        var levelData = app.storage.getLevelDataFromStorage(key);

        // Update current level with selected attributes
        levelData.name = name;
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);
    }
    
    updateLevelDataName(input) {
        var key = input.attr('key');
        var name = input.val();
        app.storage.updateLevelDataName(key, name);
    }

    updateCanvas() {
        if (this.canvas == null || this.canvas.length <= 0) {
            this.canvas = $('canvas');
        }
    }

    saveAndExitLevelEditor(saveLevel = true) {
        app.play = false;
        app.resetScene(app);
        app.deselectScene(app);
        if (saveLevel == true) app.level.saveLevelData(app);
        app.level.clearLevel(app);
        app.levelHistory.clear();
        app.player.setPosition(0, 0, 0);
        app.ui.updateUI('level-manager');
    }

    addDialog(options) {
        var dialog = $('<div class="dialog"><div>');
        var wrapper = $('<div class="wrapper"></div>');
        var input = $('<input type="text">');
        var buttons = $('<div class="buttons"></div>');
        
        // Include copy
        if (options.text != null) wrapper.append('<p>' + options.text + '</p>');
        
        // Bind functions
        if (options.input != null) {
            console.log('input: ' + app.selectedObject.text);
            var text = app.selectedObject.text;
            input.val(text);
            wrapper.append(input);
        }

        // Bind functions
        if (options.buttons != null) {
            for (var i = 0; i < options.buttons.length; i++) {
                var data = options.buttons[i];
                var button = $('<a>', { text: data.text });

                // Append button to wrapper
                button[0]._function = function(){};
                button[0]._parameter = button;
                buttons.append(button);

                // Add events to button
                if (data.function != null) button[0]._function = data.function;
                if (data.parameter != null) button[0]._parameter = data.parameter;
                console.log(button);
                button.on('click', function() {
                    var self = $(this)[0];
                    self._function(self._parameter);
                    app.ui.removeDialog(); // Always close dialog
                });
            }
            wrapper.append(buttons);
        }
        dialog.append(wrapper);
        dialog.hide().fadeIn(100);
        $('body').append(dialog);
    }

    removeDialog() {
        var dialog = $('.dialog');
        dialog.find('a').off();
        dialog.fadeOut(100, function(){ dialog.remove(); });
    }

    updateTip() {
        var input = $('.dialog input');
        app.selectedObject.text = input.val();
        app.levelHistory.save(app);
    }

    showTip(text) {
        app.play = false;
        app.ui.addDialog({
            text: text,
            buttons: [{ function: app.ui.play, parameter: true, text: 'Continue' }]
        });
    }

    pause() {
        app.play = false;
        app.deselectScene(app);
        app.ui.showObjectOptions(false);
        app.ui.levelOptions.find('[action="play"]').removeClass('selected');
        app.ui.levelOptions.find('[action="pause"]').addClass('selected');
    }
    
    play() {
        app.play = true;
        app.deselectScene(app);
        app.ui.showObjectOptions(false);
        app.ui.levelOptions.find('[action="pause"]').removeClass('selected');
        app.ui.levelOptions.find('[action="play"]').addClass('selected');
    }
}