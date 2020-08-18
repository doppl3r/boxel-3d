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
                app.storage.checkLicense();
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
        // Update user with error and solution
        if (reason == 'TOKEN_MISSING_ERROR') $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Please login to Google Chrome and turn on sync.');
        else if (reason == 'INVALID_RESPONSE_ERROR') $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Boxel 3D <strong>PRO</strong> is not available in your region.');
        else $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Boxel 3D <strong>PRO</strong> is not available. Error: ' + reason);
        $(".chrome-store").removeClass('hidden'); // Reveal chrome store
        $(".upgrade").addClass('hidden'); // Hide button
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
        $(".chrome-store").removeClass('hidden'); // Reveal chrome store
        $(".upgrade").addClass('hidden'); // Hide button
        $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Failed to update license. Error: ' + reason);
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
        if (reason == 'PURCHASE_CANCELED') $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Purchase canceled.');
        else $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Failed to purchase product. Error: ' + reason);
        $(".chrome-store").removeClass('hidden'); // Reveal chrome store
        $(".upgrade").addClass('hidden'); //hide button for pro players
    }

    addProductToUI(product) {
        var currency_symbols = { 'USD': '$', 'EUR': '€', 'CRC': '₡', 'GBP': '£', 'ILS': '₪', 'INR': '₹', 'JPY': '¥', 'KRW': '₩', 'NGN': '₦', 'PHP': '₱', 'PLN': 'zł', 'PYG': '₲', 'THB': '฿', 'UAH': '₴', 'VND': '₫' };
        var currencyCode = product.prices[0].currencyCode;
        var currencyChar = currency_symbols[currencyCode];
        var currency = (currencyChar != null) ? currencyChar : "";
        var price = Math.round((parseInt(product.prices[0].valueMicros, 10) / 1000000) * 100) / 100;
        $('.upgrade').removeClass('hidden');
        $('.upgrade').data('sku', product.sku).attr('id', product.sku).click(app.extension.onActionButton).html('<span class="strike">' + currency + (price + 1) + '</span> <span>' + currency + price + '</span>');
        $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Upgrade to <strong>PRO</strong>');
        $('.chrome-store').removeClass('hidden');
    }

    addLicenseDataToProduct(license) {
        $(".chrome-store").removeClass('hidden'); // Reveal chrome store
        $(".upgrade").addClass('hidden'); // Hide button for pro players
        $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Boxel 3D <strong>PRO</strong> Account');
        app.storage.setLicense(license.sku);
        app.storage.checkLicense();
    }

    addPendingInfo(license) {
        console.log('addPendingInfo');
        $(".chrome-store").removeClass('hidden'); // Reveal chrome store
        $(".upgrade").addClass('hidden'); // Hide button for pro players
        $(".status").html('<img class="google-icon" src="img/svg/google-icon.svg" /> Your purchase is pending and will be available soon.');
    }

    onActionButton(evt) {
        var actionButton = $(evt.currentTarget);
        if (actionButton.data("license")) {
            console.log('license: ' + actionButton.data("license"));
            // TODO: Show that the user purchased the game
        } 
        else {
            var sku = actionButton.data("sku");
            app.extension.buyProduct(sku);
        }
    }
}