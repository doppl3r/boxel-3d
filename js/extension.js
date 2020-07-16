class Extension {
    constructor() {
        this.updateUI();
    }
    
    updateUI() {
        // Check if the program is running on an extension
        if (chrome.extension != null) {
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

            // Append class for styling
            $('body').addClass('chrome');
        }
    }

    openFullScreen() {
        var url = location.href + '?fullscreen=true';
        chrome.tabs.create({ url: url });
    }
}