var db = require('./db.js'),
  _db = db.db,
  crypto = require('crypto');

function createTable() {
  var stmt = 'CREATE TABLE IF NOT EXISTS users (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    'email TEXT, ' +
    'password TEXT' +
    ')';
  db.buildTables(stmt);
}

function getUser(email, callback) {
  var stmt = 'SELECT * FROM users WHERE email=$email;';
  return _db.get(stmt, {$email: email}, callback);
}

exports.login = function (email, password, callback) {
  getUser(email, function (err, row) {
    var output = {success: false};
    if (row && row.password === crypto.createHash('sha1').update(password).digest('base64')) {
      output = row;
    }
    callback(err, output);
  });
};

exports.create = function (user, callback) {
  var stmt = 'INSERT INTO users VALUES (null, $email, $password);';
  user.password = crypto.createHash('sha1').update(user.password).digest('base64');

  getUser(user.email, function (err, row) {
    var output = {success: false, msg: 'User already exists.', code: 409};
    if (!row) {
      _db.run(stmt, db.prepareFilter(user), callback);
      return;
    }
    callback(err, output);
  });
};

createTable();