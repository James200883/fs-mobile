var myModule = angular.module('starter.controllers', [])

  .controller('DashCtrl', function($scope) {

  })

  .controller('CategoryCtrl', function($scope) {

  })

  .controller('AccountCtrl', function($scope) {

  })

  .controller('BBSCtrl', function($scope) {

  })

  .controller('CartCtrl', function ($scope) {

  })

  .controller('LoginCtrl', function ($scope, $ionicLoading, $http, $location, $timeout, $cordovaToast) {

  })

  .controller('RegisterCtrl', function ($scope, $location, $interval, CommonService) { //注册Controller
    $scope.btnText = '获取验证码';
    $scope.register = {};
    $scope.userRegister = function (regForm, register) {
      $scope.register = register;
      if (regForm.$valid) { //表单验证通过
        CommonService.post('/register/registerUser', $scope.register).success(function (results) {
          if (results.code == '200') {
            CommonService.toast('注册成功');
            $location.path('login');
          }
          if (results.code == '201') {
            CommonService.toast('该手机号已注册或绑定');
          }
          if (results.code == '202') {
            CommonService.toast('服务器异常,请稍后再试');
          }
          if (results.code == '203') {
            CommonService.toast('验证码已失效');
          }
          if (results.code == '204') {
            CommonService.toast('然而验证码并不正确');
          }
        }).error(function (results) {
          CommonService.toast('服务器异常,请稍后再试');
        });
      }
    };

    $scope.getCode = function (phone) { // 获取验证码
      CommonService.post('/register/getMessageCode', {'mobile': phone}).success(function (results) {
        if (results.code == '200') {
          CommonService.toast('已发送');
          $scope.time = 60;
          var timer = null;
          timer = $interval(function () {
            if ($scope.time === 0) {
              $interval.cancel(timer);
              timer = null;
              $scope.time = 60;
              $scope.$$childTail.btnClass = 'btn';
              $scope.btnText = '重新发送';
              $scope.$$childTail.btnStatus = false;
            } else {
              $scope.$$childTail.btnStatus = true;
              $scope.$$childTail.btnClass = 'btn btn-disable';
              $scope.btnText = $scope.time + '秒后可重新获取';
              $scope.time = $scope.time - 1;
            }
          }, 1000);
        }
        if (results.code == '201') {
          CommonService.toast('这个手机号我见过了');
        }
        if (results.code == '202') {
          CommonService.toast('服务器异常,请稍后再试');
        }
      }).error(function (results) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };
  });

myModule.directive('ngFocus', function () {
  var FOCUS_CLASS = "ng-focused";
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      ctrl.$focused = false;
      element.bind('focus', function (event) {
        element.addClass(FOCUS_CLASS);
        scope.$apply(function() {ctrl.$focused = true;});
      }).bind('blur', function (event) {
        element.removeClass(FOCUS_CLASS);
        scope.$apply(function() {ctrl.$focused = false;});
      });
    }
  }
});

myModule.directive('codeBtn', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function () {
        if (scope.regForm.mobile.$invalid) {
          scope.btnStatus = true;
          scope.btnClass = 'btn btn-disable';
        } else {
          scope.btnStatus = false;
          scope.btnClass = 'btn';
        }
      });
    }
  }
});
