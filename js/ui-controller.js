class UIController {
    constructor() {
        this.bindActions();
        this.initializeUI();
    }

    bindActions = function() {
        $('.ui-controller a').on('click', function(event){
            event.preventDefault();
            var action = $(this).attr('href');
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
        $('.ui-controller input').on('input', function(){
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
}