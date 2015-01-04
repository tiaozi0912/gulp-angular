(function() {
  'use strict';

  var _ = require('underscore');

  var Validator = require('./Validator');

  /**
   * Class of the models. Define shared class methods
   *
   * @param {String} name - the model name, same as the table name in database
   * @param {Object} options:
   *   {String} db - 'web', ...
   *   {Object} validates - key: field name, value: validation rule(seen in Validator.js)
   */
  var DBModel = function(name, options) {
    var settings = {
          db: 'web'
        },
        _this = this,
        Model = function() {},
        validator;

    this.settings = _.extend(settings, options);

    this.name = name;
    this.db = settings.db;

    // Define methods
    // This methods will be inherited in the model instant as class methods
    Model.query = function(statement, params, cb) {
      global.poolCluster.getConnection(this.db, function(err, connection) {

        function onQuery(err, res) {
          connection.release();
          cb(err, res);
        }

        if (err) {
          throw err;
        }

        if (params === null) {
          connection.query(statement, onQuery);
        } else {
          connection.query(statement, params, onQuery);
        }
      });
    };

    Model.save = function(data, cb) {
      if (data.id) {
        Model.query('UPDATE ?? SET ? WHERE id = ?', [_this.name, data, data.id], cb);
      } else {
        Model.query('INSERT INTO ?? SET ?', [_this.name, data], cb);
      }
    };

    validator = new Validator(_this.settings.validates);

    Model.validates = _.bind(validator.validates, validator);

    return Model;
  };

  module.exports = DBModel;
})();
