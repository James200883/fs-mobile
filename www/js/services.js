angular.module('starter.services', [])

.factory('sharedCartService', ['$ionicPopup',function($ionicPopup){

	var cartObj = {};
	cartObj.cart=[];
	cartObj.total_amount=0;
	cartObj.total_qty=0;

	cartObj.total_select_amount=0.00;
	cartObj.total_select_qty=0;

	cartObj.cart.add=function(id,image,name,price,qty){
		if( cartObj.cart.find(id)!=-1 ){
			//加一
			cartObj.cart[cartObj.cart.find(id)].cart_item_qty+=1;
			cartObj.total_qty+= 1;
			cartObj.total_amount+= parseFloat(cartObj.cart[cartObj.cart.find(id)].cart_item_price);

			var alertPopup = $ionicPopup.alert({
                title: '产品已经存在',
                template: '增加产品到购物车'
            });

		}
		else{
		    cartObj.cart.push( { "cart_item_id": id , "cart_item_image": image , "cart_item_name": name , "cart_item_price": price , "cart_item_qty": qty , "cart_item_check":false,"tagType": 0 } );
			cartObj.total_qty+=1;
			cartObj.total_amount+=parseFloat(price);
		}
	};

	cartObj.cart.find=function(id){
		var result=-1;
		for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {
			if( cartObj.cart[i].cart_item_id === id ) {
				result = i;
				break;
			}
		}
		return result;
	};


	cartObj.cart.findIds=function(){
		var result="";
		for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {

			result +=""+cartObj.cart[i].cart_item_id;
			if( i < len-1 ) {
				result +="-";
			}
		}
		return result;
	};


	cartObj.cart.checkForCheckout=function(){
		var curTagType=0;
		var curTagCount = 1;
		for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {

			if(cartObj.cart[i].tagType === curTagType && i == 0){
				curTagCount =1;
			}else if(cartObj.cart[i].tagType === 1 && i === 0){
				curTagCount =1;
				curTagType = cartObj.cart[i].tagType;
			} else if(curTagType != cartObj.cart[i].tagType){
				curTagType = cartObj.cart[i].tagType;
				curTagCount +=1;
			}
		}

		if(curTagCount > 1){
			return 0;
		}else if(curTagType === 0){
			return 1; //正常订单
		}else {
			return 2;//预购订单
		}
	};

	//得到当前的选择的明细
	  //初始化明细
	cartObj.cart.findOrderItem = function (){
		    var result = new Array();
		    for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {
	    	   var temp=cartObj.cart[i];
				if(temp.cart_item_check === true){
		           var orderItem = {};
		           // orderItem.id = data[i].id;  //不能设置orderItem 的id否则后台报错
		           orderItem.productId = temp.cart_item_id;
		           orderItem.productName = temp.cart_item_name;
		           orderItem.productUrl = temp.cart_item_image;
		           orderItem.sellCount = temp.cart_item_qty;
		           orderItem.distPrice = temp.cart_item_price;
		           orderItem.sellPrice = parseFloat(temp.cart_item_price)*parseInt(temp.cart_item_qty);
		           result.push(orderItem) ;
				}
		   }

		    return result;
	}

	//已生产订单，删除
	cartObj.cart.dropCheck=function(){
       for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {
    	   var temp=cartObj.cart[i];
			if(temp.cart_item_check === true){
				cartObj.total_select_qty-= parseInt(temp.cart_item_qty);
			    cartObj.total_select_amount -=( parseFloat(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );

			    cartObj.cart.splice(i, 1);
			}
		}
	};

	cartObj.cart.drop=function(id){
	 var temp=cartObj.cart[cartObj.cart.find(id)];
	 cartObj.total_qty-= parseInt(temp.cart_item_qty);
	 cartObj.total_amount-=( parseInt(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );

	 if(temp.cart_item_check === true)
	 {
		 cartObj.total_select_qty-= parseInt(temp.cart_item_qty);
		 cartObj.total_select_amount -=( parseInt(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );
	 }

	 cartObj.cart.splice(cartObj.cart.find(id), 1);

	};

	//选择当前的购物车明细
	cartObj.cart.notificationChange=function(id){
		var temp = cartObj.cart[cartObj.cart.find(id)];
		if( temp.cart_item_check === true){
			 cartObj.total_select_qty+= parseInt(temp.cart_item_qty);
			 cartObj.total_select_amount +=( parseInt(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );
		}else{
			 cartObj.total_select_qty-= parseInt(temp.cart_item_qty);
			 cartObj.total_select_amount -=( parseInt(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );
		}
	}


	//选择当前的购物车所有明细
	cartObj.cart.notificationAll=function(checked){

        if(checked === true){
        	cartObj.total_select_qty = 0;
        	cartObj.total_select_amount = 0;
        	for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {
    			var temp = cartObj.cart[i];
    			cartObj.cart[i].cart_item_check = checked;
        		 cartObj.total_select_qty+= parseInt(temp.cart_item_qty);
        		 cartObj.total_select_amount+=( parseInt(temp.cart_item_qty) *  parseFloat(temp.cart_item_price) );
    		}
        }else{
        	cartObj.total_select_qty = 0;
        	cartObj.total_select_amount = 0;
        	for( var i = 0, len = cartObj.cart.length; i < len; i++ ) {

    			cartObj.cart[i].cart_item_check = checked;
    		}
        }

	}

	cartObj.cart.increment=function(id){
		 cartObj.cart[cartObj.cart.find(id)].cart_item_qty+=1;
		 cartObj.total_qty+= 1;
		 cartObj.total_amount+=( parseInt( cartObj.cart[cartObj.cart.find(id)].cart_item_price) );

		 if(cartObj.cart[cartObj.cart.find(id)].cart_item_check === true)
		 {
			 cartObj.total_select_qty+= 1;
			 cartObj.total_select_amount += parseFloat( cartObj.cart[cartObj.cart.find(id)].cart_item_price) ;
		 }

	};

	cartObj.cart.incrementNum=function(id,image,name,price,qty){
		var tempId = cartObj.cart.find(id);
		if( tempId!=-1 ){
			 cartObj.cart[tempId].cart_item_qty+=qty;
			 cartObj.total_qty+= qty;
			 cartObj.total_amount+=(qty * parseInt( cartObj.cart[tempId].cart_item_price) );

			 if(cartObj.cart[tempId].cart_item_check === true)
			 {
				 cartObj.total_select_qty+= qty;
				 cartObj.total_select_amount +=(qty * parseInt( cartObj.cart[tempId].cart_item_price));
			 }
		}else{
			 cartObj.total_qty+= qty;
			 cartObj.total_amount+=(qty * price );
			 cartObj.cart.push( { "cart_item_id": id , "cart_item_image": image , "cart_item_name": name , "cart_item_price": price , "cart_item_qty": qty , "cart_item_check":false,"tagType": 0 } );
		}
	};

	cartObj.cart.setTagType=function(id, tagType){
		 cartObj.cart[cartObj.cart.find(id)].tagType = tagType;
	};

	cartObj.cart.decrement=function(id){

		 cartObj.total_qty-= 1;
		 cartObj.total_amount-= parseFloat( cartObj.cart[cartObj.cart.find(id)].cart_item_price) ;

		 if(cartObj.cart[cartObj.cart.find(id)].cart_item_check === true)
		 {
			 cartObj.total_select_qty-= 1;
			 cartObj.total_select_amount -= parseFloat( cartObj.cart[cartObj.cart.find(id)].cart_item_price) ;
		 }

		 if(cartObj.cart[cartObj.cart.find(id)].cart_item_qty == 1){  // if the cart item was only 1 in qty
			cartObj.cart.splice( cartObj.cart.find(id) , 1);  //edited
		 }else{
			cartObj.cart[cartObj.cart.find(id)].cart_item_qty-=1;
		 }

	};

	return cartObj;
}])

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

