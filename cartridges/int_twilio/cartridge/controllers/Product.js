'use strict';

var server = require('server');
var page = module.superModule;
server.extend(page);


server.append('Show', function (req, res, next) { //adds additional middleware

    var twilioForm = server.forms.getForm('twilioNumber');
    var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');
    var accountModel = accountHelpers.getAccountModel(req);

    twilioForm.clear();
    if (accountModel) {
        twilioForm.number.BackInStock.value = accountModel.profile.phone;
    } else {
        twilioForm.number.BackInStock.value = '';
    }

    res.setViewData({ twilioForm: twilioForm });
    next();
});

module.exports = server.exports();
