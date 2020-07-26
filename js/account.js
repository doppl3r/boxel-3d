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

    checkCredentials(success, error) {
        var settings = app.storage.getSettings();
        var username = settings['credentials']['username'];
        var password = settings['credentials']['password'];

        if (success == null) { success = function(data) { console.log(data); }}
        if (error == null) { error = function(data) { console.log(data); }}

        // Request authentication from stored credentials
        $.ajax({
            url: 'https://boxel3d.com/wp-json/boxel/account',
            method: 'POST',
            data: { username: username, password: password },
            success: success,
            error: error
        });
    }

    backup() {
        var settings = app.storage.getSettings();
        var username = settings['credentials']['username'];
        var password = settings['credentials']['password'];
        var backup = app.storage.getAllLocalStorage();

        app.ui.dialog.add({
            text: 'Are you sure you want to send your data to the server? This will override any previous data.',
            inputs: [
                { attributes: { value: 'Yes', type: 'button' }, function: function() {
                    // Add loading dialog
                    app.ui.dialog.add({ text: 'Backing up data...' });

                    // Backup data
                    $.ajax({
                        url: 'https://boxel3d.com/wp-json/boxel/account',
                        method: 'POST',
                        data: { username: username, password: password, backup: backup },
                        success: function(data) {
                            app.ui.dialog.add({
                                text: 'Success! Your data was backed up to your account.',
                                inputs: [{ attributes: { value: 'Continue', type: 'button' }}]
                            });
                        },
                        error: function(data) {
                            app.ui.dialog.add({
                                text: 'Error: Incorrect login',
                                inputs: [{ attributes: { value: 'Close', type: 'button' }}]
                            });
                        }
                    });
                } },
                { attributes: { value: 'No', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }

    restore() {
        var settings = app.storage.getSettings();
        var username = settings['credentials']['username'];
        var password = settings['credentials']['password'];
        var restore = true;

        app.ui.dialog.add({
            text: 'Are you sure you want to download your data from the server? This will override any current data.',
            inputs: [
                { attributes: { value: 'Yes', type: 'button' }, function: function() {
                    // Add loading dialog
                    app.ui.dialog.add({ text: 'Restoring data...' });
                    
                    // Restore data
                    $.ajax({
                        url: 'https://boxel3d.com/wp-json/boxel/account',
                        method: 'POST',
                        data: { username: username, password: password, restore: restore },
                        success: function(data) {
                            app.storage.setAllLocalStorage(data);
                            app.ui.dialog.add({
                                text: 'Success! Your data was restored from your account.',
                                inputs: [{ attributes: { value: 'Continue', type: 'button' }}]
                            });
                        },
                        error: function(data) {
                            app.ui.dialog.add({
                                text: 'Error: Incorrect login',
                                inputs: [{ attributes: { value: 'Close', type: 'button' }}]
                            });
                        }
                    });
                }},
                { attributes: { value: 'No', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }
}