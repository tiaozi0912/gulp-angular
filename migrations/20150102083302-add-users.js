var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    email: { type: 'string', unique: true, notNull: true },
    password: { type: 'string', unique: true, notNull: true },
    name: { type: 'string' },
    company_name: { type: 'string' },
    description: { type: 'text'}
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('users');
};
