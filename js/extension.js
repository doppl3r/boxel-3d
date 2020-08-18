class Extension {
    constructor() {
        this.updateUI();
    }
    
    updateUI() {
        // Check if the program is running on an extension
        $(document).ready(function(){
            if (app.extension.isChromeExtension() == true) {
                var url = location.href;
                var fullscreen_enabled = url.indexOf('fullscreen') >= 0; 
                var fullscreen_button = $('[action="fullscreen"]');
                var account_button = $('[action="account"]');
                var review_button = $('.review');
    
                // Reveal account button
                account_button.removeClass('hidden');

                // Check if extension is NOT in fullscreen mode
                if (fullscreen_enabled == false) {
                    fullscreen_button.removeClass('hidden');
                    fullscreen_button.on('click', function(){
                        app.extension.openFullScreen();
                    });
                }
    
                // Add link to review
                review_button.removeClass('hidden');
                review_button.on('click', function() {
                    chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews' });
                });
    
                // Append class for styling
                $('body').addClass('chrome');
    
                // Add chrome products
                app.extension.getProductList();
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

    getProductList() {
        console.log("google.payments.inapp.getSkuDetails");
        google.payments.inapp.getSkuDetails({
            'parameters': {env: "prod"},
            'success': app.extension.onSkuDetails,
            'failure': app.extension.onSkuDetailsFailed
        });
    }

    onSkuDetails(response) {
        console.log("onSkuDetails", response);
        var products = response.response.details.inAppProducts;
        var count = products.length;
        for (var i = 0; i < count; i++) {
            var product = products[i];
            console.log('product: ', product);
            if (product.sku == "boxel_3d_pro"){
                app.extension.addProductToUI(product);
            }
        }
        app.extension.getLicenses();
    }

    onSkuDetailsFailed(response) {
        console.log("onSkuDetailsFailed", response);
        var reason = response.response.errorType;
        // update user with error and solution
        if (reason == 'TOKEN_MISSING_ERROR') $(".subtitle").html('Store is not available. Please log in to Google Chrome and turn on sync.');
        else if (reason == 'INVALID_RESPONSE_ERROR') $(".subtitle").html('Store is not available in your region.');
        else $(".subtitle").html('Store is not available. Error: ' + reason);
        $("#boxel_3d_pro").remove(); //hide button for pro players
    }

    getLicenses() {
        console.log("google.payments.inapp.getPurchases");
        google.payments.inapp.getPurchases({
            'parameters': { env: "prod" },
            'success': app.extension.onLicenseUpdate,
            'failure': app.extension.onLicenseUpdateFailed
        });
    }

    onLicenseUpdate(response) {
        console.log("onLicenseUpdate", response);
        var licenses = response.response.details;
        var count = licenses.length;
        for (var i = 0; i < count; i++) {
            var license = licenses[i];
            if (license.sku == "boxel_3d_pro"){
                if (license.state == "ACTIVE") app.extension.addLicenseDataToProduct(license);
                else if (license.state == "PENDING") app.extension.addPendingInfo(license);
            }
        }
    }

    onLicenseUpdateFailed(response) {
        console.log("onLicenseUpdateFailed", resonse);
        var reason = response.response.errorType;
        $("#boxel_3d_pro").remove(); //hide button for pro players
        $(".subtitle").html('Failed to update license. Error: ' + reason);
    }

    buyProduct(sku) {
        console.log("google.payments.inapp.buy", sku);
        google.payments.inapp.buy({
            parameters: {'env': "prod"},
            'sku': sku,
            'success': app.extension.onPurchase,
            'failure': app.extension.onPurchaseFailed
        });
    }

    onPurchase(purchase) {
        console.log("onPurchase", purchase);
        app.extension.getLicenses();
    }

    onPurchaseFailed(purchase) {
        console.log("onPurchaseFailed", purchase);
        var reason = purchase.response.errorType;
        if (reason == 'PURCHASE_CANCELED') $(".subtitle").html('Purchase canceled.');
        else $(".subtitle").html('Failed to purchase product. Error: ' + reason);
        $("#boxel_3d_pro").remove(); //hide button for pro players
    }

    addProductToUI(product) {
        var currency_symbols = { 'USD': '$', 'EUR': '€', 'CRC': '₡', 'GBP': '£', 'ILS': '₪', 'INR': '₹', 'JPY': '¥', 'KRW': '₩', 'NGN': '₦', 'PHP': '₱', 'PLN': 'zł', 'PYG': '₲', 'THB': '฿', 'UAH': '₴', 'VND': '₫' };
        var currencyCode = product.prices[0].currencyCode;
        var currencyChar = currency_symbols[currencyCode];
        var currency = (currencyChar != null) ? currencyChar : "";
        var price = Math.round((parseInt(product.prices[0].valueMicros, 10) / 1000000) * 100) / 100;
        var button = $('<a href="#" class="md-btn"></a>')
            .data('sku', product.sku)
            .attr('id', product.sku)
            .click(app.extension.onActionButton)
            .append('<span class="strike">' + currency + (price + 1) + '</span> ' + currency + price);
        $(".subtitle").html('<img class="google-icon" src="img/icons/google-icon.svg" />Upgrade to <strong>PRO</strong>');
        $('.ad').append(button);
        $('.ad').append('<div class="caption" id="caption-link">+8 Player skins<br>+Unlimited uploads<br>+Unlimited downloads<br>+Cloud backups</div>');
    }

    addLicenseDataToProduct(license) {
        $("#boxel_3d_pro").remove(); //hide button for pro players
        $(".subtitle").html('<img class="google-icon" src="img/icons/google-icon.svg" />Your account has been activated. Thank you for supporting Boxel Rebound!');
        window.storageManager.setLicense(license.sku);
    }

    addPendingInfo(license) {
        console.log('addPendingInfo');
        $("#boxel_3d_pro").remove(); //hide button for pro players
        $(".subtitle").html('Your purchase is pending and will be available soon.');
    }

    onActionButton(evt) {
        var actionButton = $(evt.currentTarget);
        if (actionButton.data("license")) {
            console.log('license: ' + actionButton.data("license"));
            //TODO: Show that the user purchased the game
        } 
        else {
            var sku = actionButton.data("sku");
            app.extension.buyProduct(sku);
        }
    }
}