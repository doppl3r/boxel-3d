class UIController {
    constructor() {
        this.bindActions();
        this.initializeUI();
    }

    bindActions = function() {
        $(document).on('click', '.ui-controller a', function(event){
            event.preventDefault();
            var action = $(this).attr('href');
            if (action == 'add-level') {
                var levelData = {};
                app.level.clearLevel(app);
                levelData = app.level.exportToJSON(app); // Init default data
                app.storage.addLevelToStorage(levelData); // Store data
                app.ui.appendLevelItem(levelData);
            }
            else if (action == 'edit-level') {
                app.ui.editLevel($(this));
            }
            else if (action == 'delete-level') {
                app.ui.removeLevelItem($(this));
            }
            else if (action == 'save') {
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
                $('.options-level [href="play"]').removeClass('selected');
                $('.options-level [href="pause"]').addClass('selected');
            }
            else if (action == 'play') {
                app.play = true;
                app.deselectScene(app);
                app.ui.showObjectOptions(false);
                $('.options-level [href="pause"]').removeClass('selected');
                $('.options-level [href="play"]').addClass('selected');
            }
            else if (action == 'pin') {
                app.selectedObject.toggleStatic();
                app.ui.updateObjectOptions();
            }
            else if (action == 'rotate') {
                $('.options-object-properties [name="rotate"]').focus();
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
        $(document).on('input', '.ui-controller .slider input', function(){
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

    initializeUI = function() {
        $('.options-level [href="add"]').addClass('selected');
        $('.options-level [href="pause"]').addClass('selected');
        $('.options-object-type [href="cube"]').addClass('selected');
        $('.options-object-properties').addClass('disabled');
    }

    showObjectOptions = function(state) {
        var objectOptions = $('.options-object-properties');
        if (state == true) objectOptions.removeClass('disabled');
        else objectOptions.addClass('disabled');
    }

    toggleObjectOptions = function() {
        $('.options-object-properties').toggleClass('disabled');
    }

    updateObjectOptions = function() {
        var isStatic = false;
        var pinIcon = $('.options-object-properties [href="pin"]');
        if (app.selectedObject != null) {
            isStatic = app.selectedObject.isStatic();
            var rotation = app.selectedObject.getRotation('degrees');
            var scaleX = app.selectedObject.scale.x;
            var scaleY = app.selectedObject.scale.y;
            $('.options-object-properties [href*="rotate"] ~ .slider input').val(rotation);
            $('.options-object-properties [href*="scale-x"] ~ .slider input').val(scaleX);
            $('.options-object-properties [href*="scale-y"] ~ .slider input').val(scaleY);
        }
        if (isStatic == true) pinIcon.addClass('selected');
        else pinIcon.removeClass('selected');
    }

    appendListOfLevels = function(a) {
        var list = a.storage.getListOfLevels();
        var levelData = {};
        if (list.length < 1) {
            // Add empty level if none exist
            a.level.clearLevel(a);
            levelData = a.level.exportToJSON(a);
            a.storage.addLevelToStorage(levelData);
            list.push(levelData);
        }

        // Append each list item
        for (var i = 0; i < list.length; i++) {
            levelData = list[i];
            a.ui.appendLevelItem(levelData);
        }
    }

    appendLevelItem = function (levelData) {
        var parent = $('.level-manager .left .col');
        parent.append(
            '<div class="item">' +
                '<input type="text" key="' + levelData.key + '" value="' + levelData.name + '">' +
                '<a href="edit-level" title="Edit level"><img src="img/svg/pencil.svg"></a>' +
                '<a href="upload-level" title="Upload level"><img src="img/svg/upload.svg"></a>' +
                '<a href="delete-level" title="Delete level"><img src="img/svg/trash.svg"></a>' +
            '</div>'
        );
    }

    removeLevelItem = function(button) {
        var item = button.parent();
        var key = item.find('input').attr('key');
        app.storage.deleteLevelFromStorage(key);
        item.remove();
    }

    editLevel = function(button) {
        var item = button.parent();
        var key = item.find('input').attr('key');
        var name = item.find('input').val();
        var levelData = app.storage.getLevelFromStorage(key);

        // Populate
        levelData.name = name;
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);

        // Update UI
        $('.level-manager').addClass('disabled');
        $('.level-editor').removeClass('disabled');
    }
}