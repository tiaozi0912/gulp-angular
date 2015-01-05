(function() {
  'use strict';

  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var cookieParser = require('cookie-parser');
  var session = require('cookie-session');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var apiRouter = express.Router();
  var logger = require('morgan');

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

  require('./apiRouter')(apiRouter);
  app.use('/api', apiRouter);

  app.listen(PORT);
  console.log('Started web server on http://localhost:9000');

  // DB connection
  var mysql = require('mysql');
  global.poolCluster = mysql.createPoolCluster();

  global.poolCluster.add('web', webConfig);
  global.poolCluster.add('vendors', vendorsConfig);
  global.poolCluster.add('voice_online', voiceOnlineConfig);
})();
