angular.module('app').factory('user', ['$http', '$cookieStore', '$rootScope',
  function ($http, $cookieStore, $rootScope) {
  'use strict';

  console.log($http.defaults.responseInterceptors);

  function setToken(t) {
    $http.defaults.headers.common = {token: t};
    $rootScope.loggedIn = true;
  }

  if ($cookieStore.get('user')) {
    setToken($cookieStore.get('user').token);
  }

  return {

    login: function (user, password) {
      return $http.post('/login', {
        email: user,
        password: password
      }).then(function (res) {
        $cookieStore.put('user', res.data);
        setToken(res.data.token);
      });
    },

    logout: function () {
      $cookieStore.remove('user');
      $rootScope.loggedIn = false;
      $http.defaults.headers = {};
    },

    register: function (user, password) {
      return $http.post('/register', {
        email: user,
        password: password
      });
    }

  };
}]);