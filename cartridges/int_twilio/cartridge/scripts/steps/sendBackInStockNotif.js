'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');
var System = require('dw/system/System');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

function getTwilioService() {
    var twilioService = LocalServiceRegistry.createService('messaging', {
        createRequest: function (svc, args) {
            var user = svc.getConfiguration().getCredential().getUser();
            var password = svc.getConfiguration().getCredential().getPassword();
            var autorisation = Encoding.toBase64(Bytes(user + ':' + password));
            svc.addHeader('Authorization', 'Basic ' + autorisation);
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');

            if (svc.getRequestMethod() === 'POST') {
                return args;
            }
            return svc;
        },
        parseResponse: function (svc, output) {
            return output;
        },
        getRequestLogMessage: function (reqObj) {
            return reqObj;
        }
    });
    return twilioService;
}


module.exports = {
    SendNotifications: function SendNotifications(parameters) {

        var iterator = require('dw/util/Iterator');

        iterator = CustomObjectMgr.queryCustomObjects('backInStockNotification', '', null);
        var smsString = parameters.MessageString;
        var twilioService = getTwilioService();
        twilioService.setRequestMethod('POST');

        while (iterator.hasNext()) {

            var customObject = iterator.next();
            var Product = ProductMgr.getProduct(customObject.custom.productID);
            if (Product.availabilityModel.inStock) {
                var existing_array = JSON.parse(customObject.custom.phoneNumbers);
                for (let i = 0; i < existing_array.length; i++) {
                    twilioService.call('Body=' + smsString + '&From=+13236883670&To=' + existing_array[i]);
                }
                Transaction.wrap(function () {
                    CustomObjectMgr.remove(customObject);
                });
            }
        }
    }
};
