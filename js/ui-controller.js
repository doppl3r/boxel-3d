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
            }
            else if (action == 'pause') {
                app.play = false;
                $('.options-level [href="play"]').removeClass('selected');
                $('.options-level [href="pause"]').addClass('selected');
            }
            else if (action == 'play') {
                app.play = true;
                $('.options-level [href="pause"]').removeClass('selected');
                $('.options-level [href="play"]').addClass('selected');
            }
            else if (action == 'pin') {
                app.selectedObject.toggleSleeping();
                app.ui.updateObjectOptions();
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
        var isSleeping = app.selectedObject.isSleeping();
        var pinIcon = $('.options-object-properties [href="pin"]');
        if (isSleeping == true) pinIcon.addClass('selected');
        else pinIcon.removeClass('selected');
    }
}