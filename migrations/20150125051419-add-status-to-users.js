var dbm = require('db-migrate');
var type = dbm.dataType;

function addAccessToken(db, cb) {
  db.addColumn('users', 'access_token', { type: 'string', unique: true }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('users', 'index_users_on_access_token', ['access_token'], true, cb);
  });
}

exports.up = function(db, callback) {
  db.addColumn('users', 'status', { type: 'int', defaultValue: 0 }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('users', 'index_users_on_status', ['status'], false, function(err) {
      if (err) { callback(err); return; }

      addAccessToken(db, callback);
    });
  });
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'status', function() {
    db.removeColumn('users', 'access_token', callback);
  });
};
