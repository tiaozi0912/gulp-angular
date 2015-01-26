(function() {
  'use strict';

  var mandrill = require('mandrill-api/mandrill');
  var mandrillKey = 'aIN4i3oMpGMYkn4DDp9yeg';
  var mandrillClient = new mandrill.Mandrill(mandrillKey);
  var _ = require('underscore');

  var emailSender = {
    settings: {
      message: {
        from_email: 'noreply@agoravoice.io',
        from_name: 'Agora Voice',
        important: true,
        track_opens: true,
        track_clicks: true,
        auto_text: true,
        auto_html: true,
        preserve_recipients: false,
      },
      async: true
    },

    /**
     * options:
     *   {String} bcc_address
     *   {Array} tags
     */
    send: function(content, subject, to, options) {
      var message = {
        html: content,
        subject: subject,
        to: to
      }, _this = this;

      _.extend(this.settings.message, message);

      if (options) {
        _.extend(this.settings, options);
      }

      mandrillClient.messages.send({
        message: _this.settings.message,
        async: _this.settings.async
      });
    },


  };

  module.exports = emailSender;
})();
