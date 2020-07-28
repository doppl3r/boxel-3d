class Shop {
    constructor() {
        this.defaultProducts = [
            { 'id': 1, 'title': 'Default', 'currency': '', 'regular_price': 'Loading', 'is_on_sale': '', 'sale_price': '', 'regular_points': '', 'sale_points': '', 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/1.png', 'permalink': '#' },
            { 'id': 2, 'title': 'Blue', 'currency': '', 'regular_price': 'Loading', 'is_on_sale': '', 'sale_price': '', 'regular_points': '', 'sale_points': '', 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/2.png', 'permalink': '#' }
        ];
        this.defaultLicenses = [
            { 'key': 1, 'product': { 'id': 1, 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/1.png' }},
            { 'key': 2, 'product': { 'id': 2, 'image': 'https://boxel3d.com/wp-content/themes/avada-boxel3d/skins/2.png' }}
        ];
        this.state = 'loading'; // Default unloaded
        this.addProductToShop(this.defaultProducts[0]);
        this.addProductToShop(this.defaultProducts[1]);
    }
    
    getBoxelProducts() {
        var url  = 'https://boxel3d.com/wp-json/boxel/products/';
        var params = {};
        $.ajax({
            url: url,
            method: 'POST',
            data: params,
            success: function(response) {
                app.shop.addProductsToShop(response);
            }
        });

        //app.account.checkCredentials();
    }
    
    addProductsToShop(products) {
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            app.shop.addProductToShop(product);
        }
        app.shop.checkLocalLicenses();
        app.shop.state = 'loaded';
        app.shop.load();
    }

    addProductToShop(product) {
        // Add product to parent
        $('.skins').append(
            '<div class="product" id="' + product.id + '">' +
                '<div class="image" style="background-image: url(' + product.image + ')"></div>' +
                '<div class="title">' + product.title + '</div>' +
                '<a class="link' + (product.is_on_sale == true ? ' sale' : '') + '" href="' + product.permalink + '" target="_blank">' +
                    '<span class="regular_price">' + product.regular_points + '</span>' +
                    '<span class="sale_price">' + product.sale_points + '</span>' +
                    '<img src="img/svg/coin-square.svg">' +
                '</a>' +
            '</div>'
        );
    }

    checkLocalLicenses() {
        var licenses = app.storage.getLicenses();
        for (var i = 0; i < licenses.length; i++) {
            var license = licenses[i];
            app.shop.enableProduct(license.product.id);
        }

        // Selected active skin
        var settings = app.storage.getSettings();
        app.shop.selectProduct(settings['skin']);
    }

    checkRemoteLicense(license, callback = function(){}) {
        var url  = 'https://boxel3d.com/wp-json/boxel/products/';
        var params = { 'license': license }
        $.ajax({
            url: url,
            method: 'POST',
            data: params,
            success: callback
        });
    }

    enableProduct(productId) {
        var product = $('#'+productId);
        var link = product.find('.link');
        product.addClass('enabled');
        link.html('<span>Select</span>');
        link.attr('href', '#');
        link.attr('target', '_self');

        // Add click listener
        product.on('click', function(e){
            app.shop.selectProduct($(this).attr('id'));
            app.player.setSkin($(this).attr('id'));
        });
    }

    selectProduct(productId) {
        $('.skins .product').removeClass('selected') // Reset selected
        var product = $('#'+productId);
        product.addClass('selected');
    }

    load() {
        if (this.state == 'loading') {
            this.getBoxelProducts(); // Request products
            $('.skins').addClass('loading');
        }
        else {
            $('.skins').removeClass('loading');
        }
    }
}