class UIController {
    constructor() {
        this.bindActions();
        this.initializeUI();
    }

    bindActions = function() {
        $('.ui-controller a').on('click', function(event){
            event.preventDefault();
            var action = $(this).attr('href');
            var BOX_SIZE = app.BOX_SIZE;
            if (action == 'rewind') {
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
            else if (action == 'rotate-clockwise') {
                var angle = app.selectedObject.rotation.z;
                app.selectedObject.setRotation(angle - (15 * (Math.PI / 180)));
            }
            else if (action == 'rotate-counterclockwise') {
                var angle = app.selectedObject.rotation.z;
                app.selectedObject.setRotation(angle + (15 * (Math.PI / 180)));
            }
            else if (action == 'scale-out-x') {
                var scaleX = app.selectedObject.scale.x;
                app.selectedObject.setScale(scaleX + BOX_SIZE, null, null);
            }
            else if (action == 'scale-in-x') {
                var scaleX = app.selectedObject.scale.x;
                if (scaleX - BOX_SIZE > 0) app.selectedObject.setScale(scaleX - BOX_SIZE, null, null);
            }
            else if (action == 'scale-out-y') {
                var scaleY = app.selectedObject.scale.y;
                app.selectedObject.setScale(null, scaleY + BOX_SIZE, null);
            }
            else if (action == 'scale-in-y') {
                var scaleY = app.selectedObject.scale.y;
                if (scaleY - BOX_SIZE > 0) app.selectedObject.setScale(null, scaleY - BOX_SIZE, null);
            }
            else if (action == 'trash') {
                app.removeObject(app.selectedObject, app);
            }
            console.log(action);
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
        if (app.selectedObject != null) isStatic = app.selectedObject.isStatic();
        if (isStatic == true) pinIcon.addClass('selected');
        else pinIcon.removeClass('selected');
    }
}