angular.module('starter.services', [])

.factory('CommonService', function($http, $cordovaToast, $ionicLoading, $ionicPopup, prefixUrl) {
  var obj = {};
  obj.toast = function (message) {
    $cordovaToast.show(message, 'short', 'center');
  };

  obj.showLoadding = function () {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };

  obj.hideLoading = function () {
    $ionicLoading.hide();
  };

  obj.showConfirm = function (message) {
    return $ionicPopup.confirm({
      title: '提示',
      template: message,
      okText: '确定',
      cancelText: '取消'
    }).then(function (res) {
      return res;
    });
  };

  obj.get = function (url, data) {
    return $http({
      method: 'GET',
      url: prefixUrl + url,
      params: data
    }).success(function (result) {
      return result.data;
    }).error(function (result) {
      return result;
    });
  };

  obj.post = function (url, data) {
    return $http({
      method: 'POST',
      url: prefixUrl + url,
      params: data
    }).success(function (result) {
      return result.data;
    }).error(function (result) {
      return result
    });
  };

  return obj;
})
  .factory('AuthenticationService', function (UserService) {
    return {
      isLogin: function () {
        if (UserService.getObject('user_token')) {
          return true;
        } else {
          return false;
        }
      }
    }
  })

  .factory('UserService', function ($http, $window, $location, prefixUrl) {
    return {
      login: function (user) {
        return $http({
          method: 'POST',
          url: prefixUrl + '/oauth/token',
          params: user,
          headers: {'Authorization': 'Basic Y2xpZW50TmFtZTpjbGllbnRQYXNzd29yZA=='}
        }).success(function (result) {
          return result.data;
        }).error(function (result) {
          return result
        });
      },

      logout: function () {
        $window.localStorage.setItem('user_token', null);
        $location.path('dash');
      },

      set: function (key, value) { //存储单个属性
        $window.localStorage[key] = value;
      },

      get: function (key, defaultValue) { // 读取单个属性
        return $window.localStorage[key] || defaultValue;
      },

      setObject: function (key, value) {//存储对象
        $window.localStorage[key] = JSON.stringify(value);
      },

      getObject: function (key) { //读取对象
        return JSON.parse($window.localStorage[key] || null);
      },

      getUserName: function () {
        return JSON.parse($window.localStorage['user_token']).username;
      },

      getUserId: function () {
        return JSON.parse($window.localStorage['user_token']).user_id;
      }
    }
  })

  .constant('prefixUrl', 'http://192.168.0.103:8080/fs-server');
