class Shop {
    constructor() {
        var defaultProduct = {
            'id': 1,
            'title': 'Default',
            'regular_price': 'Active',
            'permalink': '#'
        }
        this.state = 'loading'; // Default unloaded
        this.addProductToShop(defaultProduct);
    }
    
    getBoxelProducts() {
        var url  = 'https://boxel3d.com/wp-json/boxel/products/';
        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                app.shop.addProductsToShop(response);
            }
        });
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

    addProductToShop(product, selector) {
        $('.skins').append(
            '<div class="product" id="' + product.id + '">' +
                '<div class="image" style="background-image: url(' + product.image + ')"></div>' +
                '<div class="title">' + product.title + '</div>' +
                '<a class="link' + (product.is_on_sale == true ? ' sale' : '') + '" href="' + product.permalink + '">' +
                    '<span class="regular_price">' + product.regular_price + '</span>' +
                    '<span class="sale_price">' + product.sale_price + '</span>' +
                '</a>' +
            '</div>'
        );
    }

    checkLocalLicenses() {
        var licenses = app.storage.getLicenses();
        for (var i = 0; i < licenses.length; i++) {
            var license = licenses[i];
            app.shop.activateProduct(license.product.id);
        }
    }

    checkRemoteLicense(license, callback = function(){}) {
        var url  = 'https://boxel3d.com/wp-json/boxel/products/';
        var params = { 'license': license }
        $.ajax({
            url: url,
            method: 'GET',
            data: params,
            success: callback
        });
    }

    activateProduct(productId) {
        $('#'+productId).addClass('enabled');
        // TODO update buttons and active skin
    }

    load() {
        if (this.state == 'loading') {
            this.getBoxelProducts(); // Request products
            $('body').addClass('loading');
        }
        else {
            $('body').removeClass('loading');
        }
    }
}