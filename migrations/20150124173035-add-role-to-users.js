var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('users', 'role', { type: 'int' }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('users', 'index_users_on_role', ['role'], false, callback);
  });
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'role', callback);
};
