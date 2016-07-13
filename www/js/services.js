angular.module('starter.services', [])

.factory('CommonService', function($http, $cordovaToast, prefixUrl) {
  var obj = {};
  obj.toast = function (message) {
    $cordovaToast.show(message, 'short', 'center');
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
}).constant('prefixUrl', 'http://192.168.1.39:8080/fs-server');
