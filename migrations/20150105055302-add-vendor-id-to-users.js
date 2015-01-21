var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('users', 'vendor_id', { type: 'int' }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('users', 'index_users_on_vendor_id', ['vendor_id'], true, callback);
  });
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'vendor_id', function(err) {
    db.removeIndex('users', 'index_users_on_vendor_id', callback);
  });
};
