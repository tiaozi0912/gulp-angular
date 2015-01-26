(function() {
  'use strict';

  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var cookieParser = require('cookie-parser');
  var session = require('cookie-session');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var logger = require('morgan');

  var apiAuthRouter = require('./routers/apiAuthRouter');
  var apiNoAuthRouter = require('./routers/apiNoAuthRouter');

  var PORT = 9000,
      VIEW_PATH = __dirname + '/app',
      webConfig, vendorsConfig, voiceOnlineConfig;

  app.set('title', 'Agora');
  app.set(VIEW_PATH);
  //app.set('env', 'development');

  if (app.get('env') === 'development') {
    app.use(logger('dev'));
    app.use(require('connect-livereload')({port: 35729}));

    app.use(express.static(__dirname + '/.tmp'))
      .use(express.static(__dirname + '/app'))
      .use('/bower_components', express.static(__dirname + '/bower_components'));

    // @todo: move this to a seperate config file
    webConfig = {
      user: 'root',
      database: 'agora_development'
    };

    vendorsConfig = {
      user: 'root',
      database: 'agora_vendors'
    };

    voiceOnlineConfig = {
      user: 'root',
      database: 'agora_voice_online'
    };
  }

  // @todo: move this to a seperate config file
  if (app.get('env') === 'production') {
    webConfig = {
      user: 'root',
      database: 'web',
      port: '3506',
      host: '127.0.0.1'
    };

    vendorsConfig = {
      user: 'root',
      database: 'vendors',
      port: '3313',
      host: '127.0.0.1'
    };

    voiceOnlineConfig = {
      user: 'root',
      database: 'voice_online',
      port: '3312',
      host: '127.0.0.1'
    };
  }

  //direct all to '#/' except the data files
  app.use(function(req, res, next) {
    console.log(req.url);

    if (req.url !== '/' && !req.url.match('data/') && !req.url.match('/api/')) {
      var directTo = '/#' + req.url;
      res.writeHead(301, {Location: directTo});
      res.end();
    }

    next();
  });

  // for parsing application/json
  app.use(bodyParser.json());

  // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cookieParser());
  app.use(session({
    secret: 'Agora secret',
    signed: true,
    maxAge: 60000 * 60 * 24 * 7 // expires in a week
  }));

  // expose the "messages" local variable when views are rendered
  app.use(function(req, res, next){
    var msgs = req.session.messages || [];

    // expose "messages" local variable
    res.locals.messages = msgs;

    // expose "hasMessages"
    res.locals.hasMessages = !! msgs.length;

    /* This is equivalent:
     res.locals({
       messages: msgs,
       hasMessages: !! msgs.length
     });
    */

    next();
    // empty or "flush" the messages so they
    // don't build up
    req.session.messages = [];
  });

  // require('./apiRouter')(apiRouter);
  // app.use('/api', apiRouter);
  app.use('/api/auth', apiAuthRouter);
  app.use('/api', apiNoAuthRouter);

  // define a custom res.message() method
  // which stores messages in the session
  // mgs:
  //   content
  //   type: 'error', 'success', 'warning', 'danger'
  app.response.message = function(msg) {
    // reference `req.session` via the `this.req` reference
    var sess = this.req.session;
    // simply add the msg to an array for later
    sess.messages = sess.messages || [];
    sess.messages.push(msg);
    return this;
  };

  app.listen(PORT);
  console.log('Started web server on http://localhost:' + PORT);

  // DB connection
  var mysql = require('mysql');
  global.poolCluster = mysql.createPoolCluster();

  global.poolCluster.add('web', webConfig);
  global.poolCluster.add('vendors', vendorsConfig);
  global.poolCluster.add('voice_online', voiceOnlineConfig);
})();
