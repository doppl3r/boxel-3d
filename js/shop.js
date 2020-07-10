class Shop {
    constructor() {
        this.getBoxelProducts();
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
    
    addProductsToShop(response) {
        app.shop.checkLocalLicenses();
        app.shop.checkRemoteLicense();
    }

    checkLocalLicenses() {
        var licenses = app.storage.getLicenses();
        console.log(licenses);
    }

    checkRemoteLicense(license) {
        var url  = 'https://boxel3d.com/wp-json/boxel/products/';
        var params = { 'license': license }
        $.ajax({
            url: url,
            method: 'GET',
            data: params,
            success: function(response) {
                console.log(response);
            }
        });
    }
}