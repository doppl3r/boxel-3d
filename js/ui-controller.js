class UIController {
    constructor() {
        this.controller = $('.ui-controller');
        this.home = this.controller.find('.home');
        this.campaign = this.controller.find('.campaign');
        this.levelPicker = this.controller.find('.level-picker');
        this.levelManager = this.controller.find('.level-manager');
        this.levelEditor = this.controller.find('.level-editor');
        this.levelList = this.levelManager.find('.list');
        this.levelOptions = this.levelEditor.find('.options-level');
        this.objectType = this.levelEditor.find('.object-type');
        this.objectOptions = this.levelEditor.find('.object-options');
        this.updateCanvas();
        this.bindActions();
        this.updateUI('home');
    }

    bindActions() {
        // Bind button actions
        this.controller.on('click', '[action]', function(event) {
            event.preventDefault();
            var action = $(this).attr('action');
            
            if (action == 'level-picker') {
                app.ui.appendLevels();
                app.ui.updateUI('level-picker');
            }
            else if (action == 'level-manager') {
                app.ui.updateUI('level-manager');
            }
            else if (action == 'add-level') {
                var levelData = {};
                var key = null;
                app.level.createNewLevel(app);
                levelData = app.level.exportToJSON(app); // Init default data
                key = app.storage.setLevelData(null, levelData); // Store data and generate new key
                app.ui.appendEditorLevel({ key: key, level: levelData });
            }
            else if (action == 'exit-to-home') {
                app.ui.updateUI('home');
            }
            else if (action == 'settings') {
                var settings = app.storage.getSettings();
                app.ui.addDialog({
                    inputs: [
                        { label: 'Master Volume <img src="img/svg/audio.svg">', attributes: { name: 'volume', type: 'range', min: 0, max: 10, value: settings.volume } },
                        { label: 'Graphic Quality <img src="img/svg/eye.svg">', attributes: { name: 'quality', type: 'range', min: 1, max: 10, value: settings.quality } },
                        { label: 'Editor Theme <img src="img/svg/color.svg">', attributes: { name: 'theme', type: 'range', min: 0, max: 1, value: settings.theme } },
                        { attributes: { value: 'Cancel', type: 'button' } },
                        { attributes: { value: 'Save', type: 'button' }, function: app.ui.updateSettings }
                    ]
                });
            }
            else if (action == 'pause-campaign') {
                app.play = false;
                app.ui.addDialog({
                    text: 'Paused',
                    inputs: [
                        { attributes: { value: 'Exit', type: 'button' }, function: app.ui.exitCampaign },
                        { attributes: { value: 'Play', type: 'button' }, function: app.ui.resumeCampaign },
                    ]
                });
            }
            else if (action == 'edit-level') {
                app.ui.loadEditorLevel($(this));
                app.ui.updateUI('level-editor');
                app.levelHistory.save(app);
                app.resetScene(app);
            }
            else if (action == 'delete-level') {
                app.ui.addDialog({
                    text: 'Are you sure you want to <em>delete</em> this level?',
                    inputs: [
                        { attributes: { value: 'No', type: 'button' } },
                        { attributes: { value: 'Yes', type: 'button' }, function: app.ui.removeEditorLevel, parameter: $(this) },
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
            else if (action == 'exit-to-level-manager') {
                if (app.levelHistory.history.length > 2) {
                    app.ui.addDialog({
                        text: 'Would you like to <em>save</em> your level?',
                        inputs: [
                            { attributes: { value: 'No', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: false },
                            { attributes: { value: 'Yes', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: true },
                        ]
                    });
                }
                else app.ui.saveAndExitLevelEditor(false);
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
                app.level.retryLevel(app);
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
                app.play = false; // Override default retry behavior
            }
            else if (action == 'pause') {
                app.ui.pause();
                app.ui.updateLevelOptions();
            }
            else if (action == 'play') {
                app.ui.play();
                app.ui.updateLevelOptions();
            }
            else if (action == 'toggle-theme') {
                app.ui.toggleTheme();
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
                    inputs: [
                        { attributes: { value: app.selectedObject.text, type: 'text' } },
                        { attributes: { value: 'Cancel', type: 'button' } },
                        { attributes: { value: 'Accept', type: 'button' }, function: app.ui.updateTip, parameter: $(this) },
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
            else if (action.includes('level_')) {
                app.ui.loadLevel($(this));
                app.ui.updateUI('play');
                app.resetScene(app);
            }
            console.log(action);
        });

        // Add object range input listeners
        this.controller.on('input', '.slider input', function(event){
            event.preventDefault();
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'rotate') { app.selectedObject.setRotation(-val * Math.PI / 180); }
            else if (name == 'scale-x') { app.selectedObject.setScale({ x: val, y: null, z: null }); }
            else if (name == 'scale-y') { app.selectedObject.setScale({ x: null, y: val, z: null }); }
        });

        // Save level history when input slider is updated
        this.controller.on('mouseup', '.slider input', function(event){
            event.preventDefault();
            app.levelHistory.save(app);
        });

        // Add level name change listener
        this.controller.on('focusout', '.list input', function(event) {
            event.preventDefault();
            app.ui.updateEditorLevelName($(this));
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
        // Update theme
        if (app != null) {
            var settings = app.storage.getSettings();
            this.toggleTheme(settings.theme);
        }

        this.updateCanvas();
        this.canvas.addClass('disabled'); // Default hide canvas
        this.controller.find('> *').addClass('disabled'); // Default hide all children
        this.controller.find('[action]').removeClass('selected'); // Default remove all selected

        if (state == 'home') {
            this.home.removeClass('disabled');
        }
        else if (state == 'level-picker') {
            this.levelPicker.removeClass('disabled');
        }
        else if (state == 'play') {
            this.campaign.removeClass('disabled');
            this.canvas.removeClass('disabled');
        }
        else if (state == 'level-manager') {
            this.levelManager.removeClass('disabled');
            this.updateLevelOptions(); // Update top bar
            this.objectType.find('[action="cube"]').addClass('selected'); // Select by default
            this.objectOptions.addClass('disabled'); // Disable bar on default
        }
        else if (state == 'level-editor') {
            this.canvas.removeClass('disabled');
            this.levelEditor.removeClass('disabled');
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
            this.updateObjectType();
        }
        this.levelOptions.find('[action="pause"], [action="pause"]').removeClass('selected');
        this.levelOptions.find('[action="draw"], [action="erase"]').removeClass('selected');
        this.levelOptions.find('[action="' + mode + '"]').addClass('selected');
        this.levelOptions.find('[action="' + play + '"]').addClass('selected');
    }

    updateObjectType() {
        var mode = app.mouse.mode;
        var play = app.play == true ? 'play' : 'pause';
        console.log(mode);
        this.objectType.removeClass('disabled');
        if (mode == 'erase' || play == 'play') this.objectType.addClass('disabled');
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

    appendLevels() {
        // Restructure HTML level data
        var levels = $('.levels');
        var loaded = (levels.hasClass('loaded'));

        // Append levels if data elements have not been loaded
        if (loaded == false) {
            $.each(levels.find('level'), function(i) {
                var level = $(this);
                var levelData = level.html();
                var levelIndex = i + 1;
                var levelName = 'level_' + levelIndex;
                level.attr('action', levelName);
                level.html('<span>' + levelIndex + '</span>' + '<data style="display: none;">' + levelData + '</data>');
            });
            levels.show();
            levels.addClass('loaded');
        }
    }

    appendEditorLevels(a) {
        var list = a.storage.getListOfLevels(); // return format = [{ key: '', level: '' }, ...]
        var levelData = {};
        var key = null;

        // Add empty level if none exist
        if (list.length < 1) {
            a.level.createNewLevel(a);
            levelData = a.level.exportToJSON(a);
            key = a.storage.setLevelData(null, levelData);
            list.push({ key: key, level: levelData });
        }

        // Append each list item
        this.removeListOfLevels(); // Empty list HTML before populating
        for (var i = 0; i < list.length; i++) {
            a.ui.appendEditorLevel(list[i]);
        }
    }

    appendEditorLevel(listItem) { // listItem = [{ key: '', level: '' }, ...]
        this.levelList.append(
            '<div class="item">' +
                '<input type="text" key="' + listItem.key + '" value="' + listItem.level.name + '">' +
                '<a action="edit-level" title="Edit level"><img src="img/svg/pencil.svg"></a>' +
                '<a action="upload-level" title="Upload level"><img src="img/svg/upload.svg"></a>' +
                '<a action="delete-level" title="Delete level"><img src="img/svg/trash.svg"></a>' +
            '</div>'
        );
    }

    removeEditorLevel(button) {
        var item = button.parent();
        var key = item.find('input').attr('key');
        app.storage.removeLevelData(key);
        item.remove();
    }

    loadLevel(button) {
        var levelData = JSON.parse(button.find('data').html());
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);
        app.play = true;
    }

    loadEditorLevel(button) {
        // Select level details from HTML input attributes & values
        var item = button.parent();
        var key = item.find('input').attr('key');
        var name = item.find('input').val();
        var levelData = app.storage.getLevelData(key);

        // Update current level with selected attributes
        levelData.name = name;
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);
        app.level.key = key; // Update key value for saving the level
    }
    
    updateEditorLevelName(input) {
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
        app.player.removeCheckpoint();
        app.player.setPosition({ x: 0, y: 0, z: 0 });
        app.ui.updateUI('level-manager');
    }

    addDialog(options) {
        var dialog = $('<div class="dialog">');
        var wrapper = $('<div class="wrapper">');
        var inputs = $('<div class="inputs">');
        
        // Include copy
        if (options.text != null) wrapper.append('<p>' + options.text + '</p>');
        
        // Bind functions
        if (options.inputs != null) {
            for (var i = 0; i < options.inputs.length; i++) {
                var data = options.inputs[i];
                var input = $('<input>', data.attributes);

                // Add default functionality
                input[0]._function = function(){};
                input[0]._parameter = input;
                input[0]._attributes = data.attributes;
                if (data.function != null) input[0]._function = data.function;
                if (data.parameter != null) input[0]._parameter = data.parameter;
                input.on('click', function() {
                    var self = $(this)[0];
                    self._function(self._parameter);
                    if (self._attributes.type == 'button') app.ui.removeDialog(); // Always close dialog
                });
                if (data.label != null) inputs.append('<label>' + data.label + '</label>');
                inputs.append(input);
            }
            wrapper.append(inputs);
        }
        
        dialog.append(wrapper);
        dialog.hide().fadeIn(100);
        $('body').append(dialog);
        dialog.find('input:last-of-type').focus();
    }

    removeDialog() {
        var dialog = $('.dialog');
        dialog.find('a').off();
        dialog.fadeOut(100, function(){ dialog.remove(); });
    }

    updateTip() {
        var input = $('.dialog .inputs input[type="text"]');
        app.selectedObject.text = input.val();
        app.levelHistory.save(app);
    }

    updateSettings() {
        var volume = $('.dialog input[name="volume"]').val();
        var quality = $('.dialog input[name="quality"]').val();
        var theme = $('.dialog input[name="theme"]').val();
        app.updateSettings({ 'volume': volume, 'quality': quality, 'theme': theme }, app);
    }

    showTip(text) {
        app.play = false;
        app.ui.addDialog({
            text: text,
            inputs: [
                { attributes: { value: 'Continue', type: 'button' }, function: app.ui.play, parameter: true }
            ]
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
        if (app.player.jump == true) app.player.jump = false; // Prevent jump in the beginning
    }

    toggleTheme(themeID) {
        var themes = ['dark', 'light'];
        var newTheme = $('body').hasClass('dark') ? themes[1] : themes[0];
        if (themeID != null) newTheme = themes[themeID];
        $('body').removeClass(themes);
        $('body').addClass(newTheme);
    }

    resumeCampaign() {
        app.play = true;
    }

    exitCampaign() {
        app.play = false;
        app.resetScene(app);
        app.level.clearLevel(app);
        app.player.removeCheckpoint();
        app.player.setPosition({ x: 0, y: 0, z: 0 });
        app.ui.updateUI('level-picker');
    }
}