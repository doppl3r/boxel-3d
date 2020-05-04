class UIController {
    constructor() {
        this.bindActions();
        this.initializeUI();
    }

    bindActions = function() {
        $('.ui-controller a').on('click', function(event){
            event.preventDefault();
            var action = $(this).attr('href');
            console.log(action);
        });
    }

    initializeUI = function() {
        $('.options-level [href="add"]').addClass('selected');
        $('.options-object-type [href="cube"]').addClass('selected');
        $('.options-object-properties').addClass('disabled');
    }
}