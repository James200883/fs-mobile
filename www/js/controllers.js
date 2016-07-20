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

  .controller('BBSCtrl', function($scope, CommonService) {
    CommonService.get('/blog/findBlogNew', {}).success(function (res) {
      $scope.blogs = res;
    }).error(function (res) {
      CommonService.toast('服务器异常,请稍后再试');
    });
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
        $state.go('app.dash');
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后重试');
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
          CommonService.hideLoading();
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
          CommonService.hideLoading();
          CommonService.toast('服务器异常,请稍后再试');
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

  .controller('UserInfoCtrl', function ($scope, $ionicActionSheet, $cordovaCamera, $stateParams, CommonService, UserService) {
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
        buttonClicked: function (index) {
          var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
          };

          $cordovaCamera.getPicture(options).then(function (imageURI) {
            console.log(imageURI);
          })
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
          CommonService.hideLoading();
          CommonService.toast('服务器异常,请稍后再试');
        });
      }
    }
  })
  .controller('ShopCtrl', function ($scope, $timeout, $ionicListDelegate, CommonService) {
    $scope.shops = [];
    $scope.hasmore = false;
    $scope.max = 5;
    $scope.ratingVal = 0;
    $scope.readonly = true;
    var param = {page: 1, pageSize: 10}, timer = null;

    CommonService.showLoadding();
    CommonService.get('/store/getStoreByPage', param).success(function (res) {
      $scope.shops = res.data;
      CommonService.hideLoading();
      $scope.hasmore = true;
    }).error(function (res) {
      CommonService.hideLoading();
      CommonService.toast('服务器异常,请稍后再试');
      return;
    });

    $scope.loadMore = function () {
      param.page = param.page + 1;
      timer = $timeout(function () {
        if (!$scope.hasmore) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return;
        }

        CommonService.get('/store/getStoreByPage', param).success(function (res) {
          $scope.hasmore = res.next_page > 0;
          $scope.shops = $scope.shops.concat(res.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (res) {
          CommonService.toast('服务器异常,请稍后再试');
        });
      }, 1000);
    };

    $scope.moreDataCanBeLoaded = function () {
      return $scope.hasmore;
    };

    $scope.onHover = function(val){
      $scope.hoverVal = val;
    };

    $scope.onLeave = function(){
      $scope.hoverVal = null;
    };

    $scope.onChange = function(val){
      $scope.ratingVal = val;
    };

    $scope.$on('stateChangeSuccess', function () {
      $scope.loadMore();
    });

    $scope.$on('$destroy', function () {
      if (timer != null) {
        $timeout.cancel(timer);
      }
    });
    $ionicListDelegate.showReorder(true);
  })

  .controller('ShopCtrlDetailCtrl', function ($scope, $stateParams, CommonService) { //店铺详情
    var shopId = $stateParams.shopId;
    if (shopId) {
      CommonService.showLoadding();
      CommonService.post('/store/getShopById', {'shopId': shopId}).success(function (res) {
        $scope.shopName = res.data[0].shopName;
        $scope.shopScore = res.data[0].shopScore;
        $scope.shopAddress = res.data[0].address;
        $scope.shopPhone = res.data[0].contactTel;
        $scope.postDate = res.data[0].startTimeStr + ' - ' + res.data[0].endTimeStr;
        $scope.shopInfo = '';
        if (res.data[0].blogInfo) {
          $scope.shopInfo = res.data[0].blogInfo.information;
        }
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后再试');
      });
    } else {
      CommonService.toast('服务器异常,请稍后再试');
    }

    $scope.favouriteShop = function () {
      CommonService.toast('已收藏');
    }
  })
  .controller('HealthCtrl', function ($scope, $ionicListDelegate, $timeout, CommonService) {
    $scope.hasmore = false;
    var param = {page: 1, pageSize: 10, blogCategoryId: 2}, timer = null;

    CommonService.showLoadding();
    CommonService.get('/blog/blogList', param).success(function (res) {
      $scope.healths = res.data;
      CommonService.hideLoading();
      $scope.hasmore = true;
    }).error(function (res) {
      CommonService.hideLoading();
      CommonService.toast('服务器异常,请稍后再试');
      return;
    });

    $scope.loadMore = function () {
      param.page = param.page + 1;
      timer = $timeout(function () {
        if (!$scope.hasmore) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return;
        }

        CommonService.get('/blog/blogList', param).success(function (res) {
          $scope.hasmore = res.next_page > 0;
          $scope.healths = $scope.healths.concat(res.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (res) {
          CommonService.toast('服务器异常,请稍后再试');
        });
      }, 1000);
    };

    $scope.moreDataCanBeLoaded = function () {
      return $scope.hasmore;
    };

    $scope.$on('stateChangeSuccess', function () {
      $scope.loadMore();
    });

    $scope.$on('$destroy', function () {
      if (timer != null) {
        $timeout.cancel(timer);
      }
    });
    $ionicListDelegate.showReorder(true);
  })

  .controller('BBSDetailCtrl', function ($scope, $stateParams, CommonService) {
    var bbsId = $stateParams.bbsId;
    if (bbsId) {
      CommonService.showLoadding();
      CommonService.get('/blog/blogDetailInfo', {'id': bbsId}).success(function (res) {
        $scope.sbTitle = res.title;
        $scope.sbAuthor = res.author;
        $scope.sbContent = '';
        if (res.blogInfo) {
          $scope.sbContent = res.blogInfo.information;
        }
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后再试');
      });
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

myModule.directive('star', function () {
  return {
    template: '<ul class="rating" ng-mouseleave="leave()"><li ng-repeat="star in stars" ng-class="star" ng-click="score($index + 1)" ng-mouseover="over($index + 1)">\u2605</li></ul>',
    scope: {
      ratingValue: '=',
      max: '=',
      readonly: '@',
      onHover: '=',
      onLeave: '='
    },
    controller: function ($scope) {
      $scope.ratingValue = $scope.ratingValue || 0;
      $scope.max = $scope.max || 5;
      $scope.score = function (val) {
        if ($scope.readonly && $scope.readonly === 'true') {
          return;
        }
        $scope.ratingValue = val;
      };

      $scope.over = function(val){
        $scope.onHover(val);
      };

      $scope.leave = function(){
        $scope.onLeave();
      }
    },
    link: function (scope, elem, attrs) {
      var updateStars = function () {
        scope.stars = [];
        for (var i = 0; i < scope.max; i++) {
          scope.stars.push({filled: i < scope.ratingValue});
        }
      };
      updateStars();

      scope.$watch('ratingValue', function (oldVal, newVal) {
        if (newVal) {
          updateStars();
        }
      });
      scope.$watch('max', function (oldVal, newVal) {
        if (newVal) {
          updateStars();
        }
      })
    }
  }
});

