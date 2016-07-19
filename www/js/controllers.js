var myModule = angular.module('starter.controllers', [])

  .controller('DashCtrl', function($scope) {

  })

  .controller('CategoryCtrl', function($scope) {

  })

  .controller('AccountCtrl', function($scope, CommonService, UserService, AuthenticationService) {
    CommonService.post('/member/userIndex', {'userId': UserService.getUserId()}).success(function (res) {
      if (res.result.imageUrl) {
        $scope.headImg = res.result.imageUrl;
      } else {
        $scope.headImg = 'img/head.png';
      }
      $scope.realName = res.result.realname;
      $scope.userAmount = res.result.amount;
      $scope.userCouponCount = res.result.couponCount;
      $scope.userPoint = res.result.userPoint;
    }).error(function (res) {
      CommonService.toast('服务器异常,请稍后再试');
    });

    $scope.userLogOut = function () {
      CommonService.showConfirm('确定要离开我吗?>﹏<').then(function (res) {
        if (res) {
          UserService.logout();
        }
      });
    }
  })

  .controller('BBSCtrl', function($scope) {

  })

  .controller('CartCtrl', function ($scope) {

  })

  .controller('LoginCtrl', function ($scope, $state, $window, UserService, CommonService) {
    $scope.userParams = {};
    $scope.loginUser = function (user) {
      $scope.userParams = user;
      if (typeof (user) == 'undefined') {
        CommonService.toast('手机号或密码不填,小心召唤出怪物喔>o<');
        return false;
      }
      $scope.userParams.client_id = 'clientName';
      $scope.userParams.client_secret = 'clientPassword';
      $scope.userParams.grant_type = 'password';
      $scope.userParams.scope = 'read write';

      CommonService.showLoadding();
      UserService.login($scope.userParams).success(function (res) {
        UserService.setObject('user_token', res);
        $state.go('dash');
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.toast('服务器异常,请稍后重试');
        CommonService.hideLoading();
      });
    }
  })

  .controller('RegisterCtrl', function ($scope, $state, $interval, CommonService) { //注册Controller
    $scope.btnText = '获取验证码';
    $scope.register = {};
    $scope.userRegister = function (regForm, register) {
      CommonService.showLoadding();
      $scope.register = register;
      if (regForm.$valid) { //表单验证通过
        CommonService.post('/register/registerUser', $scope.register).success(function (results) {
          if (results.code == '200') {
            CommonService.toast('注册成功');
            $state.go('login');
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
          CommonService.hideLoading();
        }).error(function (results) {
          CommonService.toast('服务器异常,请稍后再试');
          CommonService.hideLoading();
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
  })
  .controller('CouponCtrl', function ($scope, $ionicHistory, CommonService, UserService) { //我的优惠券
    CommonService.post('/userCoupon/getUserCoupon', {'userId': UserService.getUserId()}).success(function (res) {
      $scope.coupons = res.data;
    }).error(function (res) {
      CommonService.toast('服务器异常,请稍后再试');
    });
  })
  .controller('ForgetPwdCtrl', function ($scope, $state, $interval, CommonService) { //忘记密码
    $scope.btnText = '获取验证码';

    $scope.resetPwd = function (forgetPwdForm, forgetPwd) {
      CommonService.showLoadding();
      $scope.forgetPwd = forgetPwd;
      if (forgetPwdForm.$valid) {
        CommonService.post('/member/restPassword', $scope.forgetPwd).success(function (results) {
          if (results.code == '201') {
            CommonService.toast("我不认识你耶, 确认手机号没写错");
          }
          if (results.code == '203') {
            CommonService.toast("验证码已过期");
          }
          if (results.code == '204') {
            CommonService.toast("然而验证码并不正确");
          }
          if (results.code == '200') {
            CommonService.toast("重置成功!");
            $state.go('login');
          }
          if (results.code == '202') {
            CommonService.toast('服务器异常,请稍后再试');
          }
          CommonService.hideLoading();
        }).error(function (results) {
          CommonService.toast('服务器异常,请稍后再试');
          CommonService.hideLoading();
        });
      }
    };

    $scope.getCode = function (phone) { // 获取验证码
      CommonService.post('/member/getMessageCode', {'mobile': phone}).success(function (results) {
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
          CommonService.toast('没找到你,你是火星来的吗');
        }
        if (results.code == '202') {
          CommonService.toast('服务器异常,请稍后再试');
        }
      }).error(function (results) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };
  })

  .controller('UserInfoCtrl', function ($scope, $ionicActionSheet, $stateParams, CommonService, UserService) {
    CommonService.post('/member/userIndex', {'userId': UserService.getUserId()}).success(function (results) {
      if (results.result.imageUrl) {
        $scope.headImage = results.result.imageUrl;
      } else {
        $scope.headImage = 'img/head.png';
      }
      if (results.result.sex == 3) {
        $scope.userSex = '保密';
      }
      if (results.result.sex == 2) {
        $scope.userSex = '女';
      }
      if (results.result.sex == 1) {
        $scope.userSex = '男';
      }
      $scope.nickName = results.result.realname;
      $scope.userPhone = results.result.mobile;
      $scope.userEmail = results.result.email;
    }).error(function (results) {
      CommonService.toast('服务器异常,请稍后再试');
    });

    $scope.selectImg = function () {
      var hideSheet = $ionicActionSheet.show({
        buttons:[{text: '拍照'}, {text: '从相册选择'}],
        cancelText: '取消',
        cancel: function () {
          console.log('12323');
        },
        buttonClicked: function (index) {
          console.log(index);
        }
      });
    };

    $scope.setSex = function () {
      $scope.userInfo = {};
      var hideSheet = $ionicActionSheet.show({
        buttons:[{text: '男'}, {text: '女'}, {text: '保密'}],
        cancelText: '取消',
        buttonClicked: function (index) {
          $scope.userInfo = {'id': UserService.getUserId(), 'sex': index + 1};
          CommonService.post('/member/modifyUserInfo', $scope.userInfo).success(function (res) {
            if (res.status == 'true') {
              if (index == 0) {
                $scope.userSex = '男';
              }
              if (index == 1) {
                $scope.userSex = '女';
              }
              if (index == 2) {
                $scope.userSex = '保密';
              }
            } else {
              CommonService.toast('没设置成功(T_T)');
            }
          }).error(function (res) {
            CommonService.toast('服务器异常,请稍后再试');
          });
          return true;
        }
      });
    }
  })

  .controller('EditUserInfoCtrl', function ($scope, $stateParams, $state, UserService, CommonService) { // 修改用户信息
    $scope.headId = $stateParams.headId;
    $scope.userVal = $stateParams.value;

    $scope.submitData = {};
    $scope.saveUser = function (frm) {
      CommonService.showLoadding();
      if (frm.$valid) {
        if (frm.$name == 'nickNameForm') {
          $scope.submitData = {'id': UserService.getUserId(), 'realname': frm.realName.$modelValue};
        }
        if (frm.$name == 'emailForm') {
          $scope.submitData = {'id': UserService.getUserId(), 'email': frm.emailName.$modelValue};
        }

        CommonService.post('/member/modifyUserInfo', $scope.submitData).success(function (res) {
          if (res.status == 'true') {
            $state.go('userInfo');
          }
          CommonService.hideLoading();
        }).error(function (res) {
          CommonService.toast('服务器异常,请稍后再试');
          CommonService.hideLoading();
        });
      }
    }
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
        if (attrs.codeBtn == 'forgetPwdForm') { //忘记密码
          if (scope.forgetPwdForm.mobile.$invalid) {
            scope.btnStatus = true;
            scope.btnClass = 'btn btn-disable';
          } else {
            scope.btnStatus = false;
            scope.btnClass = 'btn';
          }
        }
        if (attrs.codeBtn == 'regForm') { //注册
          if (scope.regForm.mobile.$invalid) {
            scope.btnStatus = true;
            scope.btnClass = 'btn btn-disable';
          } else {
            scope.btnStatus = false;
            scope.btnClass = 'btn';
          }
        }
      });
    }
  }
});

myModule.directive('ngBack', function ($ionicHistory) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {
      element.bind('click', function (event) {
        $ionicHistory.goBack();
      })
    }
  }
});

