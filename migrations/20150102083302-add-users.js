var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    email: { type: 'string', unique: true, notNull: true },
    password: { type: 'string', unique: true, notNull: true },
    name: { type: 'string' },
    company_name: { type: 'string' },
    company_description: { type: 'text'}
  }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('users', 'index_users_on_email_password_name_company_name', ['email', 'password', 'name', 'company_name'], callback);
  });
};

exports.down = function(db, callback) {
  db.removeIndex('users', 'index_users_on_email_password_name_company_name', function(err) {
    if (err) { callback(err); return; }

    db.dropTable('users', callback);
  });
};
