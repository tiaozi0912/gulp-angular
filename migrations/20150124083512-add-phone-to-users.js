var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('users', 'phone', { type: 'string' }, function(err) {
    if (err) { callback(err); return; }

    callback();
  });
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'phone', callback);
};
