class Account {
    constructor() {
        
    }

    setCredentials(username, password) {
        var settings = app.storage.getSettings();
        settings['credentials']['username'] = btoa(username);
        settings['credentials']['password'] = btoa(password);
        app.storage.setSettings(settings);
    }

    getCredentials() {
        var settings = app.storage.getSettings();
        return {
            'username': atob(settings['credentials']['username']),
            'password': atob(settings['credentials']['password'])
        }
    }

    checkCredentials() {
        var settings = app.storage.getSettings();
        var username = settings['credentials']['username'];
        var password = settings['credentials']['password'];

        // Request authentication from stored credentials
        $.ajax({
            url: 'https://boxel3d.com/wp-json/boxel/levels',
            method: 'POST',
            data: { username: username, password: password },
            success: function(response) {
                console.log(response);
            },
            error: function(response) {
                console.log(response);
            }
        });
    }
}