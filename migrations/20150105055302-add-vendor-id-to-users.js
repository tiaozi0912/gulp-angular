var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('users', 'vendor_id', { type: 'int' }, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'vendor_id', callback);
};
