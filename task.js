var db = require('./db.js'),
  _db = db.db;

function createTable() {
  var stmt = 'CREATE TABLE IF NOT EXISTS tasks (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    'task TEXT, ' +
    'done INTEGER, ' +
    'weight INTEGER, ' +
    'userId INTEGER, ' +
    'FOREIGN KEY(userId) REFERENCES user(id)' +
    ')';
  db.buildTables(stmt);
}


exports.list = function (filter, callback) {
  var stmt = 'SELECT id, task, done, weight FROM tasks WHERE userId=$userId ORDER BY weight DESC;';
  if (!filter.userId) {
    return new Error('User not provided in filter');
  }
  return _db.all(stmt, db.prepareFilter(filter), callback);
};

exports.create = function (task, callback) {
  var stmt = 'INSERT INTO tasks VALUES (null, $task, 0, 0, $userId);';
  return _db.run(stmt, db.prepareFilter(task), callback);
};

exports.delete = function (task, callback) {
  var stmt = 'DELETE FROM tasks WHERE id=$id;';
  return _db.run(stmt, {'$id': task.id}, callback);
};

exports.update = function (task, callback) {
  var stmt = 'UPDATE tasks SET task=$task, done=$done, weight=$weight WHERE id=$id;';
  return _db.prepare(stmt).bind(db.prepareFilter(task)).run(callback);
};

createTable();