'use strict';

function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.number-signup-message').length === 0) {
        $('.twilio-register-phone').append(
           '<div class="number-signup-message"></div>'
        );
    }
    $('.number-signup-message')
        .append('<div class="number-signup-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.number-signup-message').remove();
        button.removeAttr('disabled');
    }, 3000);
}

module.exports = function () {

    var form = $('form.twilio-form');
    var inputPhone = $('input[name=BackInStock]');
    var button = $('.btn-twilio');
    var pid = $('.add-to-cart').data('pid');

    form.submit(function(e) {
        e.preventDefault();

        var url = button.data('href');
        var number = inputPhone.val();
        $.spinner().start();
        button.attr('disabled', true);

        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: {
                number: number,
                pid: pid
            },
            success: function (data) {
                displayMessage(data, button);
            },
            error: function (err) {
                displayMessage(err, button);
            }
        });

    });
}

