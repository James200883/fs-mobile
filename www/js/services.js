angular.module('starter.services', [])

.factory('CommonService', function($http, $cordovaToast, $ionicLoading, $ionicPopup, $cordovaGeolocation, prefixUrl) {
  var options = {timeout:'10000', enableHighAccuracy: false};
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

  obj.postBody = function (url, data) {
	    return $http({
	      method: 'POST',
	      url: prefixUrl + url,
	      cache : false,
	      async : false,//同步
	      contentType: 'application/json',
	      data : JSON.stringify(data)
	    }).success(function (result) {
	      return result.data;
	    }).error(function (result) {
	      return result
	    });
	  };

  obj.getCurrentPosition = function () { //获取当前位置
    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      return position;
    }, function (err) {
      CommonService.toast('获取位置信息失败');
    });
  };

  obj.clearPosition = function () { //清除位置信息
    $cordovaGeolocation.watchPosition(options).clearWatch();
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

  .factory('UserService', function ($http, $window, $state, prefixUrl) {
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
        $state.go('app.dash');
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

      clear: function (key) {
        $window.localStorage.removeItem(key);
      },

      getUserName: function () {
        return JSON.parse($window.localStorage['user_token']).username;
      },

      getUserId: function () {
        return JSON.parse($window.localStorage['user_token']).user_id;
      }
    }
  })

  .factory('CartService', function (UserService) {
    var cartObj = {}, tempObj;
    cartObj.cart = [];
    cartObj.totalAmount = 0.0;
    cartObj.totalItemAmount = 0.0;

    cartObj.addCart = function (productInfo) {
      var obj = UserService.getObject(UserService.getUserId());
      if (obj) {
        cartObj.cart = obj.cart;
        var index = cartObj.find(productInfo.productId);
        if (index != -1) {
          cartObj.cart[index].total_qty += parseInt(productInfo.productCount);
          cartObj.cart[index].total_amount += parseFloat(productInfo.productPrice);
        } else {
          cartObj.cart.push({'cart_item_id': productInfo.productId, 'cart_item_image': productInfo.productImg,
            'cart_item_name': productInfo.productName, 'cart_item_price': productInfo.productPrice,
            'cart_item_qty': productInfo.productCount, 'cart_item_user': UserService.getUserId(),
            'cart_item_weight': productInfo.productWeight, 'cart_item_check': false, 'total_qty': productInfo.productCount,
            'total_amount': productInfo.productPrice, 'cart_item_type': productInfo.tagPresell});
        }
      } else {
        cartObj.cart.push({'cart_item_id': productInfo.productId, 'cart_item_image': productInfo.productImg,
          'cart_item_name': productInfo.productName, 'cart_item_price': productInfo.productPrice,
          'cart_item_qty': productInfo.productCount, 'cart_item_user': UserService.getUserId(),
          'cart_item_weight': productInfo.productWeight, 'cart_item_check': false, 'total_qty': productInfo.productCount,
        'total_amount': productInfo.productPrice, 'cart_item_type': productInfo.tagPresell});
      }
      UserService.setObject(UserService.getUserId(), cartObj);
    };

    cartObj.getCartData = function () {
      tempObj = UserService.getObject(UserService.getUserId());
      return tempObj;
    };

    cartObj.getSelectedCartData = function () { // 获取选中的商品
      var resultObj = [];
      for (var i = 0; i < tempObj.cart.length; i++) {
        if (tempObj.cart[i].cart_item_check) {
          var orderItem = {};
          orderItem.productId = tempObj.cart[i].cart_item_id;
          orderItem.productName = tempObj.cart[i].cart_item_name;
          orderItem.productUrl = tempObj.cart[i].cart_item_image;
          orderItem.sellCount = tempObj.cart[i].total_qty;
          orderItem.distPrice = tempObj.cart[i].cart_item_price;
          orderItem.sellPrice = tempObj.cart[i].total_amount;
          orderItem.cart_item_type = tempObj.cart[i].cart_item_type;
          resultObj.push(orderItem);
        }
      }
      return resultObj;
    };

    cartObj.find = function (id) {
      var obj = UserService.getObject(UserService.getUserId());
      var result = -1;
      for (var i = 0; i < obj.cart.length; i++) {
        if (obj.cart[i].cart_item_id === id) {
          result = i;
          break;
        }
      }
      return result;
    };

    cartObj.clearCart = function () {
      UserService.clear(UserService.getUserId());
    };

    cartObj.notificationAll = function (checked) {
      var price = 0.0;
      for (var i = 0; i < tempObj.cart.length; i++) {
        tempObj.cart[i].cart_item_check = checked;
        if (checked) {
          price += parseFloat(tempObj.cart[i].total_amount);
        }
      }
      cartObj.totalAmount = price;
    };

    cartObj.notificationItem = function (itemId) {
      var index = cartObj.find(itemId);
      if (tempObj.cart[index].cart_item_check) {
        cartObj.totalItemAmount += parseFloat(tempObj.cart[index].total_amount);
      } else {
        cartObj.totalItemAmount -= parseFloat(tempObj.cart[index].total_amount);
      }
      cartObj.totalAmount = cartObj.totalItemAmount;
    };

    cartObj.decrement = function (itemId) {
      var index = cartObj.find(itemId);
      if (tempObj.cart[index].total_qty <= 1) {
        return;
      }
      tempObj.cart[index].total_qty -= 1;
      tempObj.cart[index].total_amount -= tempObj.cart[index].cart_item_price;
      UserService.setObject(UserService.getUserId(), tempObj);
    };

    cartObj.increment = function (itemId) {
      var index = cartObj.find(itemId);
      tempObj.cart[index].total_qty += 1;
      tempObj.cart[index].total_amount += tempObj.cart[index].cart_item_price;
      UserService.setObject(UserService.getUserId(), tempObj);
    };

    cartObj.isMixed = function (obj) {
      var beforeCount = 0, normalCount = 0, orderType = 0;
      for (var i = 0; i < obj.length; i++) {
        if (obj[i].cart_item_type == 1) {
          beforeCount++;
        } else if (obj[i].cart_item_type == 0) {
          normalCount++;
        }
      }
      if (beforeCount == obj.length) {
        orderType = 2; //预购订单
      } else if (normalCount == obj.length) {
        orderType = 1; //正常订单
      }else if (beforeCount != obj.length || normalCount != obj.length) {
        orderType = 0; //混合订单
      }
      return orderType;
    };

    return cartObj;
  })

.constant('prefixUrl', 'http://192.168.1.132:8080/fs-server');

