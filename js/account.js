class Account {
    constructor() {
        
    }

    setCredentials(username, password, encode = true) {
        var settings = app.storage.getSettings();
        if (encode == true) {
            settings['credentials']['username'] = btoa(username);
            settings['credentials']['password'] = btoa(password);
        }
        else {
            settings['credentials']['username'] = username;
            settings['credentials']['password'] = password;
        }
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

        // Strip credentials from backup
        delete settings['credentials']
        backup.settings = JSON.stringify(settings);

        app.ui.dialog.add({
            text: 'Save all data to the server?<br><em>(scores, levels, etc.)</em>',
            inputs: [
                { attributes: { value: 'Backup', type: 'button' }, function: function() {
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
                                text: 'Error: Incorrect login. <br><a href="https://boxel3d.com/shop/account/lost-password/" target="_blank"><em>Forgot password?</em></a>',
                                inputs: [
                                    { attributes: { value: 'Edit Login', type: 'button' }, function: app.ui.showCredentialsDialog },
                                    { attributes: { value: 'Close', type: 'button' }, function: app.ui.showAccountOptions }
                                ]
                            });
                        }
                    });
                } },
                { attributes: { value: 'Cancel', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }

    restore() {
        var settings = app.storage.getSettings();
        var username = settings['credentials']['username'];
        var password = settings['credentials']['password'];
        var restore = '';

        app.ui.dialog.add({
            text: 'Download all data from the server? This will override your local data (scores, levels etc.)<br><br><em>If you have not backed up your data, please cancel and backup your data first.</em>',
            inputs: [
                { attributes: { value: 'Restore', type: 'button' }, function: function() {
                    // Add loading dialog
                    app.ui.dialog.add({ text: 'Restoring data...' });
                    
                    // Restore data
                    $.ajax({
                        url: 'https://boxel3d.com/wp-json/boxel/account',
                        method: 'POST',
                        data: { username: username, password: password, restore: restore },
                        success: function(data) {
                            app.storage.setAllLocalStorage(data);
                            app.account.setCredentials(username, password, false); // Restore raw credentials
                            app.ui.dialog.add({
                                text: 'Success! Your data was restored from your account.',
                                inputs: [{ attributes: { value: 'Continue', type: 'button' }}]
                            });
                        },
                        error: function(data) {
                            app.ui.dialog.add({
                                text: 'Error: Incorrect login. <br><a href="https://boxel3d.com/shop/account/lost-password/" target="_blank"><em>Forgot password?</em></a>',
                                inputs: [
                                    { attributes: { value: 'Edit Login', type: 'button' }, function: app.ui.showCredentialsDialog },
                                    { attributes: { value: 'Close', type: 'button' }, function: app.ui.showAccountOptions }
                                ]
                            });
                        }
                    });
                }},
                { attributes: { value: 'Cancel', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }
}