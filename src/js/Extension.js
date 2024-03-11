import $ from 'jquery';

class Extension {
    constructor() {
        this.updateUI();
    }
    
    updateUI() {
        $(document).ready(function(){
            // Check if the program is running on an extension
            if (app.extension.isChromeExtension() == true) {
                var url = location.href;
                var fullscreen_enabled = url.indexOf('fullscreen') >= 0; 
                var fullscreen_button = $('[action="fullscreen"]');

                // Check if extension is NOT in fullscreen mode
                if (fullscreen_enabled == false) {
                    fullscreen_button.removeClass('hidden');
                    fullscreen_button.on('click', function(){
                        app.extension.openFullScreen();
                    });
                }
    
                // Append platform class for styling
                $('body').addClass('chrome');
            }
        });
    }

    openFullScreen() {
        var url = location.href + '?fullscreen=true';
        chrome.tabs.create({ url: url });
    }

    isChromeExtension() {
        return chrome.extension != null;
    }
}

export { Extension };