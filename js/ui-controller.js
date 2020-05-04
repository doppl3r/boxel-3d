class UIController {
    constructor() {
        this.loadSVGFiles();
        this.bindActions();
    }

    loadSVGFiles = function() {
        // Requires jQuery to load
        $('.ui-controller a').each(function(){
            var item = $(this);
            var url = 'img/svg/' + item.attr('class') + '.svg';
            $.ajax({ url: url, dataType: 'html' }).done(
                function(response) {
                    item.html(response);
                }
            );
        });
    }

    bindActions = function() {
        $('.ui-controller a').on('click', function(event){
            event.preventDefault();
            var action = $(this).attr('href').substring(1);
            console.log(action);
        });
    }
}