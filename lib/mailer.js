(function() {
  'use strict';

  var mandrill = require('mandrill-api/mandrill');
  var mandrillKey = 'aIN4i3oMpGMYkn4DDp9yeg';
  var mandrillClient = new mandrill.Mandrill(mandrillKey);
  var _ = require('underscore');

  var mailer = {
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
      async: true,
      admin: {
        production: [{
                      email: 'admin@agoravoice.io',
                      name: 'Agora Admin',
                      type: 'to'
                    }],
        development: [{
                      email: 'wyj0912@gmail.com',
                      name: 'Agora Admin',
                      type: 'to'
                    }]
      },
      host: {
        production: 'http://agora.io',
        development: 'http://localhost:9000'
      }
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
    }
  };

  mailer.sendEmailVerification = function(user, token) {
    var host = this.settings.host[process.env.NODE_ENV] || 'http://agora.io',
        subject = 'Verify your Agora account',
        email = user.email,
        url, content;

    url = host + '/api/verify_email/' + token;

    // @todo: better templating
    content = '<p>Hi ' + user.name + ':</p><br>' + '<p> Welcome to Agora! Please verify your email by clicking the following link: </p>' + '<a href="' + url + '">' + url + '</a><br>' + '<p> Best regards, </p>' + '<p>Agora Team</p><br>' + '<br><p>(If you did not request an Agora account, please ignore this message.)</p>';

    if (process.env.NODE_ENV === 'development') {
      email = this.settings.admin.development[0].email;
    }

    this.send(content, subject, [{
      email: email,
      name: user.name,
      type: 'to'
    }]);
  };

  mailer.sendEmailVerifiedNotification = function(user) {
    var to = this.settings.admin[process.env.NODE_ENV],
        host = this.settings.host[process.env.NODE_ENV] || 'http://agora.io',
        subject = 'A new user verified the email',
        url,
        content;

    url = host + '/admin/users#user-' + user.id;
    content = '<p>User <a href="' + url + '">' + user.name + '(' + user.email + ')</a> has signed up and verified the email. Let\'s follow up!</p>';

    this.send(content, subject, to);
  };

  mailer.sendResetPasswordEmail = function(user, token) {
    var subject = 'Reset your Agora account password',
        email = user.email,
        content;

    content = '<p>Hi ' + user.name + ':</p><br>' + '<p>Pleae use this code to reset the password for your Agora account:</p><br>' + '<p>Here is your code:<strong>' + token +'</strong></p><br>' + '<p>Best regards, </p><p>Agora Team</p>' + '<br><br><p>(If you did not request this security code, please ignore this message.)</p>';

    if (process.env.NODE_ENV === 'development') {
      email = this.settings.admin.development[0].email;
    }

    this.send(content, subject, [{
      email: email,
      name: user.name,
      type: 'to'
    }]);
  };

  module.exports = mailer;
})();
