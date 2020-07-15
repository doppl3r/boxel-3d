$(document).ready(function(){
    // Add JS if chrome extension exists
    if (chrome.extension != null) {
        $('body').addClass('chrome');
    }
});