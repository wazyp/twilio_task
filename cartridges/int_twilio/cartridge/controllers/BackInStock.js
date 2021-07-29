'use strict';

var server = require('server');


function validateNumber(phone) {
    var regex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
    return regex.test(phone);
}

function createObject(pid, phone) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');

    Transaction.wrap(function () {
        var preorder_object = CustomObjectMgr.getCustomObject('backInStockNotification', pid);
        if (!preorder_object) {
            preorder_object = CustomObjectMgr.createCustomObject('backInStockNotification', pid);
            preorder_object.custom.productID = pid;
            var phoneNumbers = [];
            phoneNumbers.push(phone + '');
            preorder_object.custom.phoneNumbers = JSON.stringify(phoneNumbers);
        } else {
            var existing_array = JSON.parse(preorder_object.custom.phoneNumbers);
            if (existing_array.indexOf(phone) < 0) {
                existing_array.push(phone);
                preorder_object.custom.phoneNumbers = JSON.stringify(existing_array);
            }
        }
    });
}

server.post('Subscribe', function (req, res, next) {

    var Resource = require('dw/web/Resource');
    var pid = req.form.pid;
    var phoneNumber = req.form.number;
    var isValidphoneNumber;
    var isValidRecord;

    if (phoneNumber) {
        isValidphoneNumber = validateNumber(phoneNumber);
        if (isValidphoneNumber) {
            try {
                createObject(pid, phoneNumber)
                res.json({
                    success: true,
                    msg: Resource.msg('info.twilio.subscribe.number.success', 'twilio', null)
                });
            } catch (error) {
                res.json({
                    error: true,
                    msg: Resource.msg('info.twilio.subscribe.subscribe.error', 'twilio', null)
                });
            }
        } else {
            res.json({
                error: true,
                msg: Resource.msg('info.twilio.subscribe.number.invalid', 'twilio', null)
            });
        }
    } else {
        res.json({
            error: true,
            msg: Resource.msg('info.twilio.subscribe.number.invalid', 'twilio', null)
        });
    }
    next();
});

module.exports = server.exports();
