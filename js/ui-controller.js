class UIController {
    constructor() {
        this.bindActions();
        this.initializeUI();
    }

    bindActions = function() {
        $('.ui-controller a').on('click', function(event){
            event.preventDefault();
            var action = $(this).attr('href');
            if (action == 'play') {
                app.play = true;
                $('.options-level [href="pause"]').removeClass('selected');
                $('.options-level [href="play"]').addClass('selected');
            }
            else if (action == 'pause') {
                app.play = false;
                $('.options-level [href="play"]').removeClass('selected');
                $('.options-level [href="pause"]').addClass('selected');
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
}