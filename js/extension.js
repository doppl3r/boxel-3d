class Extension {
    constructor() {
        this.updateUI();
    }
    
    updateUI() {
        // Check if the program is running on an extension
        if (this.isChromeExtension() == true) {
            var url = location.href;
            var fullscreen_enabled = url.indexOf('fullscreen') >= 0; 
            var fullscreen_button = $('[action="fullscreen"]');
            var version_button = $('.version');
            var review_button = $('.review');

            // Check if extension is NOT in fullscreen mode
            if (fullscreen_enabled == false) {
                fullscreen_button.removeClass('hidden');
                fullscreen_button.on('click', function(){
                    app.extension.openFullScreen();
                });
            }

            // Add link to review
            review_button.removeClass('hidden');
            review_button.on('click', function() {
                chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews' });
            });

            // Add popup for changelog
            version_button.on('click', function() {
                $.get("../changelog.txt", function(data) {
                    app.ui.addDialog({
                        attributes: { class: 'align-left' },
                        text: data,
                        inputs: [
                            { attributes: { value: 'Close', type: 'button' }}
                        ]
                    });
                    $('.dialog .wrapper').scrollTop(0);
                });
            });

            // Append class for styling
            $('body').addClass('chrome');
        }
    }

    openFullScreen() {
        var url = location.href + '?fullscreen=true';
        chrome.tabs.create({ url: url });
    }

    isChromeExtension() {
        return chrome.extension != null;
    }
}