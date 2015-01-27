var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('users', 'created_at', {type: 'timestamp'}, function() {
    db.addColumn('users', 'updated_at', {type: 'timestamp'}, callback);
  })
};

exports.down = function(db, callback) {
  db.removeColumn('users', 'created_at', function() {
    db.removeColumn('users', 'updated_at', callback);
  });
};
