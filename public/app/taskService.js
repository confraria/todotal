angular.module('app').factory('task', ['$http', 'user', function ($http, user) {
  'use strict';

  return {
    list: function () {
      return $http.get('/tasks').then(undefined, function (data) {
        user.logout();
      });
    },

    create: function (task) {
      return $http.post('/tasks', task);
    },

    delete : function (task) {
      return $http.delete('/tasks/' + task.id);
    },

    update: function (task) {
      var _t = angular.copy(task);
      _t.done = parseInt(_t.done, 10);
      return $http.put('/tasks/' + task.id, _t);
    }

  };
}]);