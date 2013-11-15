var crypto = require('crypto'),
  express = require('express'),
  users = require('./user'),
  tasks = require('./task'),
  sessions = {};

function msg(success, _msg) {
  return {
    success: success,
    msg: _msg
  };
}

function error(_msg) {
  _msg = _msg || 'An error ocurred';
  return msg(false, _msg);
}

function ok(_msg) {
  _msg = _msg || 'Request successful';
  return msg(true, _msg);
}

function checkAuth (req, res, next) {
  var token = req.get('token');
  if (req.url !== '/register' && req.url !== '/login' &&  (!token || !sessions[token])) {
    res.json(403, error('Not authorized'));
    return;
  } else if (token && sessions[token]) {
    req.user = sessions[token];
  }

  next();
}

app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));
app.use(checkAuth);

app.post('/register', function (req, res) {
  if (!req.body.email || !req.body.password) {
    res.json(400, error('Must send "user" and "password" properties.'));
    return;
  }

  users.create(req.body, function (err, data) {
    var output = error();
    if (!err) {
      output = data || ok('User Created');
    }
    res.json(output.code || 201, output);
  });
});

app.post('/login', function (req, res) {
  users.login(req.body.email, req.body.password, function (err, _user) {
    if (_user && _user.success !== false) {
      crypto.randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex');
        sessions[token] = _user;
        _user.token = token;
        res.json(200, _user);
      });
    } else {
      res.json(401, error('Invalid credentials'));
    }
  });
});

app.get('/tasks', function (req, res) {
  tasks.list({userId: req.user.id}, function (err, rows) {
    res.send(200, rows);
  });
});

app.post('/tasks', function (req, res) {
  var task = {
    task: req.body.task,
    userId: req.user.id
  };

  tasks.create(task, function (err, data) {
    if (!err && this.lastID) {
      res.json(201, {id: this.lastID});
      return;
    }
    res.json(400, error('An error ocurred'));
  });
});

app.put('/tasks/:taskId', function (req, res) {
  var task = req.body;
  task.id = parseInt(req.params.taskId,10);

  tasks.owns(task, req.user, function (err, owns) {
    if (!owns) {
      res.json(403, error('Not authorized'));
      return;
    }

    tasks.update(task, function (err, data) {
      if (!err && this.changes) {
        res.json(200, ok('Task updated'));
        return;
      }
      res.json(400, error('An error ocurred'));
    });
  });

});

app.delete('/tasks/:taskId', function (req, res) {
  var task = req.body;
  task.id = parseInt(req.params.taskId,10);

  tasks.owns(task, req.user, function (err, owns) {
    if (!owns) {
      res.json(403, error('Not authorized'));
      return;
    }

    tasks.delete(task, function (err, data) {
      if (!err && this.changes) {
        res.json(204, ok('Task deleted'));
        return;
      }
      res.json(404, erro('Task not found'));
    });
  });

});

var port = 3000;
app.listen(port, function () {
  console.log('Server running at http://localhost:' + port);
});