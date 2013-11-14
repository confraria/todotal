var sqlite3 = require('sqlite3').verbose(),
  creating = false,
  stmtQueue = [],
  db =  new sqlite3.Database('db.sqlite3');


function runBuildTables() {
  if (!stmtQueue.length || creating) {
    return;
  }
  var stmt = stmtQueue[0];
  creating = true;
  db.run(stmt, function (err, data) {
    if (err) {
      console.log(err);
      runBuildTables();
      return;
    }
    creating = false;
    stmtQueue.shift();
    runBuildTables();
  });
}

exports.db = db;

exports.prepareFilter = function (filter) {
  var _filter = {};

  Object.keys(filter || {}).forEach(function (key) {
    _filter['$' + key] = filter[key];
  });

  return _filter;
};

exports.buildTables = function (stmt) {
  stmtQueue.push(stmt);
  runBuildTables();
};