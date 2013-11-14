angular.module('app').controller('loginCtrl', ['$scope', 'user', function ($scope, user) {
  'use strict';

  function registerFeedback(res) {
    $scope.feedback = res.data.msg;
    $scope.feedbackError = !res.data.success;
  }

  $scope.login = function (email, pass) {
    if (!email || !pass) {
      return;
    }
    user.login(email, pass).then(undefined, function (res) {
      $scope.feedback = res.data.msg;
      $scope.feedbackError = true;
    });
  };

  $scope.register = function (email, pass) {
    if (!email || !pass) {
      return;
    }
    user.register(email, pass).then(registerFeedback, registerFeedback);
  };

}]);