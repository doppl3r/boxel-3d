class Skins {
    constructor() {
        this.default = { id: 1, url: 'img/png/skins/pink.png' }
        this.state = 'loading'; // Default unloaded
        this.getSkins();
    }
    
    getSkins() {
        var url  = 'json/skins.json';
        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                app.skins.addSkins(response);
            }
        });
    }
    
    addSkins(skins) {
        this.skins = skins; // Local JSON to global object
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i];
            app.skins.addSkin(skin);
            app.skins.enableSkin(skin);
        }
        // Selected active skin
        var settings = app.storage.getSettings(app);
        app.skins.selectSkin(settings['skin']);
        app.skins.state = 'loaded';
        app.skins.load();
    }

    addSkin(skin) {
        // Add skin to parent
        $('.skin-group').append(
            '<div class="skin" id="' + skin.id + '">' +
                '<div class="image" style="background-image: url(' + skin.url + ')"></div>' +
                '<div class="title">' + skin.title + '</div>' +
            '</div>'
        );
    }

    enableSkin(skin) {
        var skinHTML = $('#' + skin.id);

        // Add click listener
        skinHTML.on('click', function(e) {
            var settings = app.storage.getSettings();
            settings.skin = skin;
            app.player.setSkin({ id: skin.id, url: skin.url });
            app.skins.selectSkin(skin);
            app.updateSettings(settings);
        });
    }

    selectSkin(skin) {
        $('.skins .skin').removeClass('selected') // Reset selected
        var skin = $('#' + skin.id);
        skin.addClass('selected');
    }

    addCustomSkinListener() {
        var skinId = 680; // Predefined in WordPress
        app.ui.controller.off('click', '.skin#' + skinId);
        app.ui.controller.on('click', '.skin#' + skinId, function(event) {
            var skinURL = app.skins.getSkinURL(skinId);
            app.ui.dialog.add({
                text: 'Paste your image url',
                inputs: [
                    { attributes: { value: skinURL, type: 'text', placeholder: 'https://i.imgur.com/KmZHGlE.png' } },
                    { attributes: { value: 'Cancel', type: 'button' } },
                    { attributes: { value: 'Accept', type: 'button' }, function: app.skins.updateCustomSkin },
                ]
            });
        });
    }

    updateCustomSkin() {
        var skinId = 680; // Predefined in WordPress
        var dialog = app.ui.dialog.get();
        var input = dialog.find('input[type="text"]');
        var settings = app.storage.getSettings();
        var skin = { id: skinId, url: input.val() };
        settings.skin = skin;
        app.player.setSkin(skin, app);
        app.updateSettings(settings);
    }

    getSkinURL(skinId, a = app) {
        var url = a.skins.default.url; // Default
        var skins = a.skins.skins;
        if (skins != null) {
            for (var i = 0; i < skins.length; i++) {
                var skin = skins[i];
                if (skinId == skin.id) {
                    url = skin.url;
                    break;
                }
            }
        }
        return url;
    }

    load() {
        if (this.state == 'loading') {
            $('.skin-group').addClass('loading');
        }
        else {
            $('.skin-group').removeClass('loading');
            this.addCustomSkinListener();
        }
    }
}