// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic-datepicker'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .run(function ($ionicPlatform, $rootScope, $ionicHistory, $state, AuthenticationService) {
    var needLoginView = ['app.account', 'app.cart', 'myCoupon', 'myOrder', 'userInfo', 'editUserInfo', 'recharge', 'activity', 'myRecommendMember', 'suggestMyMember', 'myMessage', 'myDianZan', 'farmReserve']; //需要登录页面的state
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
      if (needLoginView.indexOf(toState.name) >= 0 && !AuthenticationService.isLogin()) {
        $state.go("login");
        event.preventDefault();
      }
    });

    //主页面显示退出提示框
    $ionicPlatform.registerBackButtonAction(function (e) {

      e.preventDefault();

      function showConfirm() {
        var confirmPopup = $ionicPopup.confirm({
          title: '<strong>退出应用?</strong>',
          template: '你确定要退出应用吗?',
          okText: '退出',
          cancelText: '取消'
        });

        confirmPopup.then(function (res) {
          if (res) {
            ionic.Platform.exitApp();
          } else {
            // Don't close
          }
        });
      }

      // Is there a page to go back to?
      if ($location.path() == '/app/dash' ) {
        showConfirm();
      } else if ($rootScope.$viewHistory.backView ) {
        console.log('currentView:', $rootScope.$viewHistory.currentView);
        // Go back in history
        $rootScope.$viewHistory.backView.go();
      } else {
        // This is the last page: Show confirmation popup
        showConfirm();
      }

      return false;
    }, 101);
    
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');
    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');
    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.ios.views.transition('android');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('app', {
        url: '/app',
        abstract: true,
        controller: 'AppCtrl',
        templateUrl: 'templates/tabs.html'
      })

      .state('app.dash', {
        url: '/dash',
        views: {
          'app-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })

      .state('app.category', {
        url: '/category/:categoryId',
        views: {
          'app-category': {
            templateUrl: 'templates/tab-category.html',
            controller: 'CategoryCtrl'
          }
        }
      })

      .state('app.account', {
        url: '/account',
        views: {
          'app-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('app.cart', {
        url: '/cart',
        views: {
          'app-cart' : {
            templateUrl: 'templates/tab-cart.html',
            controller: 'CartCtrl'
          }
        },
        cache: false
      })

      .state('order', {
        url: '/order/:orderId/:addressId',
        templateUrl: 'templates/order.html',
        controller: 'OrderCtrl'
      })

      .state('rechargeOrder', {
        url: '/rechargeOrder/:orderId',
        templateUrl: 'templates/recharge-order.html',
        controller: 'RechargeOrderCtrl'
      })

      .state('recharge', {
        url: '/recharge',
        templateUrl: 'templates/app-recharge.html',
        controller: 'RechargeCtrl'
      })

      .state('address', {
        url: '/address/:orderId',
        templateUrl: 'templates/address.html',
        controller: 'AddressCtrl'
      })

      .state('addOrEditAddress', {
        url: '/addOrEditAddress/:id',
        templateUrl: 'templates/addOrEditAddress.html',
        controller: 'addOrEditAddressCtrl'
      })

      .state('activity', {
        url: '/activity',
        templateUrl: 'templates/activity-list.html',
        controller: 'ActivityCtrl'
      })

      .state('app.bbs', {
        url: '/bbs',
        views: {
          'app-bbs': {
            templateUrl: 'templates/tab-bbs.html',
            controller: 'BBSCtrl'
          }
        }
      })

      .state('productDetail', {
        url: '/productDetail/:productId',
        templateUrl: 'templates/product-detail.html',
        controller: 'ProductDetailCtrl'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/app-login.html',
        controller:'LoginCtrl'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'templates/app-register.html',
        controller: 'RegisterCtrl'
      })
      .state('myCoupon', {
        url: '/myCoupon',
        templateUrl: 'templates/app-coupon.html',
        controller: 'CouponCtrl'
      })

      .state('forgetPwd', {
        url: '/forgetPwd',
        templateUrl: 'templates/app-forgetPwd.html',
        controller: 'ForgetPwdCtrl'
      })

      .state('userInfo', {
        url: '/userInfo',
        templateUrl: 'templates/app-userinfo.html',
        controller: 'UserInfoCtrl'
      })

      .state('editUserInfo', {
        url: '/editUserInfo/:headId/:value',
        templateUrl: 'templates/app-editUserInfo.html',
        controller: 'EditUserInfoCtrl'
      })

      .state('shop', {
        url: '/shop',
        templateUrl: 'templates/app-shop.html',
        controller: 'ShopCtrl'
      })

      .state('shopDetail', {
        url: '/shopDetail/:shopId',
        templateUrl: 'templates/app-shop-detail.html',
        controller: 'ShopCtrlDetailCtrl'
      })

      .state('health', {
        url: '/health',
        templateUrl: 'templates/app-health.html',
        controller: 'HealthCtrl'
      })

      .state('bbsDetail', {
        url: '/bbsDetail/:bbsId',
        templateUrl: 'templates/app-bbs-detail.html',
        controller: 'BBSDetailCtrl'
      })

      .state('searchResult', {
        url: '/searchResult/:query',
        templateUrl: 'templates/app-search.html',
        controller: 'SearchResultCtrl'
      })

      .state('myOrder', {
        url: '/myOrder',
        templateUrl: 'templates/app-my-order.html',
        controller: 'MyOrderCtrl'
      })

      .state('rechargeRecord', {
        url: '/rechargeRecord',
        templateUrl: 'templates/app-recharge-record.html',
        controller: 'RechargeRecordCtrl'
      })

      .state('myRecommendMember', {
        url: '/myRecommendMember',
        templateUrl: 'templates/app-my-recommend-member.html',
        controller: 'MyRecommendMemberCtrl'
      })

      .state('suggestMyMember', {
        url: '/suggestMyMember',
        templateUrl: 'templates/app-suggest-my-member.html',
        controller: 'SuggestMyMemberCtrl'
      })

      .state('myMessage', {
        url: '/myMessage',
        templateUrl: 'templates/app-my-message.html',
        controller: 'MyMessageCtrl'
      })

      .state('myDianZan', {
        url: '/myDianZan',
        templateUrl: 'templates/app-my-dianzan.html',
        controller: 'MyDianZanCtrl'
      })

      .state('myMessageContent', {
        url: '/myMessageContent/:messageContent',
        templateUrl: 'templates/app-my-message-content.html',
        controller: 'MyMessageContentCtrl'
      })

      .state('farmReserve', {
        url: '/farmReserve',
        templateUrl: 'templates/app-farm-reserve.html',
        controller: 'FarmReserveCtrl'
      })

      .state('addReserve', {
        url: '/addReserve',
        templateUrl: 'templates/app-addReserve.html',
        controller: 'AddReserveCtrl'
      })

      .state('appAbout', {
        url: '/appAbout',
        templateUrl: 'templates/app-about.html',
        controller: 'AppAboutCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/dash');

  });
