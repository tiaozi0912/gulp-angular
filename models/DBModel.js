/**
 * Define shared class methods
 */

(function() {
  'use strict';

  var DBModel = function(name, options) {
    var defaults = {
          db: 'web'
        },
        options = options || defaults,
        _this = this,
        Model = function() {};

    this.name = name;
    this.db = options.db;

    // Define methods
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

    return Model;
  };

  module.exports = DBModel;
})();
