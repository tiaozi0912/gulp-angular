var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('ips', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    start_ip: { type: 'bigint', defaultValue: 0 },
    end_ip: { type: 'bigint', defaultValue: 0 },
    country_code: { type: 'string' },
    country: { type: 'string' },
    province: { type: 'string' },
    city: { type: 'string' },
    long: { type: 'decimal'},
    lat: { type: 'decimal'},
    postcode: { type: 'string' },
    timezone: { type: 'string' }
  }, function(err) {
    if (err) { callback(err); return; }

    db.addIndex('ips', 'index_ips_on_start_ip_end_ip', ['start_ip', 'end_ip'], callback);
  });
};

exports.down = function(db, callback) {
  db.removeIndex('ips', 'index_ips_on_start_ip_end_ip', function() {
    db.dropTable('ips', callback);
  });
};
