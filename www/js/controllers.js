var myModule = angular.module('starter.controllers', [])

  .controller('DashCtrl', function($scope,$http,$state, sharedCartService,CommonService) {

		//put cart after menu
		var cart = sharedCartService.cart;
		$scope.slide_items = {};
		$scope.productData = {};
		$scope.categoryData = {};
		
		//开始加载数据
		$scope.loadPageData = function (){
			
			CommonService.get('/pageAds/findHomePageAds').success(function (results) {
				$scope.slide_items = results.bannerData;
				$scope.productData = results.pageProduct;
				$scope.categoryData = results.pageCategory;
			}).error(function (results) {
		          CommonService.toast('服务器异常,请稍后再试');
	        });
			
		};

		
		//show other page
		$scope.showPage = function (pageUrl) {	  
			
			 window.location.href =pageUrl;
			 
		 };
		   
		//show category
		$scope.showCategory = function (id) {	  
			 console.log("sid" + id);
			 window.location.href = "#/app/category/"+id;
		 };
						   
		//show product page
		$scope.showProduct = function (id) {

			 window.location.href = "#/product/"+id;
		 };

		 //add to cart function
		 $scope.addToCart = function(id,image,name,price){  
			cart.add(id,image,name,price,1);	
		 };	 				   
  })

  .controller('CategoryCtrl', function($scope,$stateParams,$state, $http,sharedCartService,CommonService) {

	//put cart after menu
	  var cart = sharedCartService.cart;
		
	  $scope.noMoreItemsAvailable = false; // lazy load list
	  
	  $scope.curCategoryId = "";
	  $scope.sortBy = "";
	  $scope.sortType = 0;
	  $scope.nextPage = 1;
	  
	  console.log($stateParams.categoryId);
	  console.log($state.sortBy);
	  console.log($state.sortType);
	  
	  if($stateParams.categoryId){
		  $scope.curCategoryId = $stateParams.categoryId;
	  }
	  
	  //if($state.sortBy){
		//  $scope.sortBy = $state.sortBy; 
	 // }
	 // if($state.sortType){
	//	  $scope.sortType = $state.sortType; 
	 // }
	  
	  angular.element(document).ready(function () {
		  $scope.loadCategory();//加载分类
			$scope.loadMore();  //Added Infine Scroll
	  });
	  
	  
	  
	//loads the menu----onload event
		//$scope.$on('$stateChangeSuccess', function() {
			//$scope.loadCategory();//加载分类
			//$scope.loadMore();  //Added Infine Scroll
		//});
		 
		// Loadmore() called inorder to load the list 
		$scope.loadMore = function() {
			
			var paramDatas = {};
			if($scope.curCategoryId.length > 0 && $scope.sortBy.length > 0){
				paramDatas = {'categoryId':$scope.curCategoryId, 'type': $scope.sortBy,'sortType':$scope.sortType,'page':$scope.nextPage};
			}else if($scope.curCategoryId.length > 0){
				paramDatas = {'categoryId':$scope.curCategoryId, 'sortType':$scope.sortType,'page':$scope.nextPage};
			}else if($scope.sortBy.length > 0 ) {
				paramDatas = {'type': $scope.sortBy, 'sortType':$scope.sortType,'page':$scope.nextPage};
			}else{
				paramDatas = {'sortType':$scope.sortType,'page':$scope.nextPage};
			}
			CommonService.get('/product/cateList',paramDatas).success(function (results) {
				$scope.productData = results.data;
				if(results.next_page > 1){
				   $scope.hasmore=(results.next_page-1)*30;
				   $scope.nextPage = results.next_page;
				}
				else {
					$scope.hasmore = 0;
				}
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	        });
				
		};
		
		$scope.pageStateReload = function(sortBy, sortType)
		{
			$state.go($state.current, {'sortBy':sortBy, 'sortType':sortType}, {reload: true});
		}
		
		$scope.loadCategory = function() {
			
			CommonService.get('/category/getWXAllCategory').success(function (results) {
				$scope.categoryData = results.data;
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	        });
			
	};
		
		//show product page
		$scope.showProduct=function (id) {	 
			 sessionStorage.setItem('page_id', id);
			
			 window.location.href = "#/product/"+id;
		 };
		 
		 //add to cart function
		 $scope.addToCart=function(id,image,name,price){    
			cart.add(id,image,name,price,1);	
		 };	 
  })


 .controller('ProductCtrl', function($scope,$http,$stateParams, sharedCartService,CommonService) {

	 
	  if($stateParams.productId){
		  $scope.productId = $stateParams.productId;
	  }
	 
	  $scope.productCount = 1;
	
	   
	 //onload event-- to set the values
		$scope.$on('$stateChangeSuccess', function () {
			$scope.cart=sharedCartService.cart;
			
			if($scope.cart.find($scope.productId) >0 )
			{
				$scope.cartCount = $scope.cart[$scope.cart.find($scope.productId)].cart_item_qty;
			}
		});
		
	   $scope.incCur=function(){
		   $scope.productCount += 1;
		};
		
		$scope.decCur=function(){
			 $scope.productCount -= 1;
			 
			 if($scope.productCount == 0){
				 $scope.productCount =1;
			 }
		};
		
		
		 $scope.inc=function(){
			 $scope.cart.add($scope.productId,$scope.data.product.imageUrl,$scope.data.product.name,$scope.data.product.distPrice, $scope.productCount);
		};
		
	 //加载产品，加载促销活动
	   var url = '/product/getWXProductById';
       $scope.htmlActivity = '';
       var urlActivity = '/activity/WXfindActivityProduct';
       
       $scope.loadPageData = function (){
	       //获取产品资料
	       CommonService.get(url,{'id':$scope.productId}).success(function (results) {
	    	   $scope.data = results;
				
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	       });
	       
	       //获取活动信息的信息
	       CommonService.get(urlActivity).success(function (results) {
	    	   var result = results.data;
	           	if(null != result)
	           	{
	           		$scope.htmlActivity += result[0].name+'  ';
	           		if(result.length >= 2){
	           			$scope.htmlActivity += result[1].name;
	           		}
	           	}
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	       });
       }
	})
 
  .controller('CartCtrl', function ($scope,$http,$stateParams, sharedCartService,CommonService) {
	  
	  //初始化购物车的产品属性
	  angular.element(document).ready(function () {
		  $scope.initCartData();
	  });
	  
	  $scope.total_amount=0;
	  $scope.total_qty=0;
	  
	  $scope.initCartData = function (){
		  $scope.cart=sharedCartService.cart;
		  var ids =  $scope.cart.findIds();
		  
		//获取产品资料
	       CommonService.get('/product/findAllProductIds',{'ids':ids}).success(function (results) {
	    	   var data = results;
	    	   for(var m =0, len = data.length; m<len; m++){
	    		   if(data[m].tagPresell === 1){
	    			   $scope.cart.setTagType(data[m].id, data[m].tagPresell);
	    		   }
	    	   }
				
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	       });
	  }
	  
	//remove function
		$scope.removeFromCart=function(c_id){
			$scope.cart.drop(c_id);	
			$scope.total_qty=sharedCartService.total_select_qty;
			$scope.total_amount=sharedCartService.total_select_amount;
		};
		
		$scope.inc=function(c_id){
			$scope.cart.increment(c_id);
		};
		
		$scope.dec=function(c_id){
			$scope.cart.decrement(c_id);
		};
	  
		//全选按钮
		$scope.pushNotificationChange = function() {
			$scope.cart.notificationAll($scope.pushNotification.checked);
			$scope.total_qty=sharedCartService.total_select_qty;
			$scope.total_amount=sharedCartService.total_select_amount;
		};

		$scope.pushNotification = { checked: false };
	  
		//item选择
		$scope.itemNotificationChange = function(itemId){
			$scope.cart.notificationChange(itemId);
			$scope.total_qty=sharedCartService.total_select_qty;
			$scope.total_amount=sharedCartService.total_select_amount;
		}
		//check out
		$scope.checkout=function(){
			if($scope.total_amount>0){
				var orderType = $scope.cart.checkForCheckout();
				alert('ss'+orderType);
				//正常订单或预购订单
				if(orderType > 0) { 
					
				
					var orders = {accessCode:"",
						    userId:"1",
						    orderId:"",
						    contactUserName:"",
						    contractTel:"",
						    dispatchAddr:"",
						    orderType:orderType,//1正常配送，2预售订单 3充值订单
						    payType:"",
						    dispatchType:"",
						    totalNumber:$scope.total_qty,
						    amount:$scope.total_amount};
					
					//初始化订单明细
					orders.items = $scope.cart.findOrderItem();
					
					console.log('Json' + JSON.stringify(orders));
					 //添加订单，跳转到订单页面
					  CommonService.postBody('/orders/addOrUpdateOrders',orders).success(function (results) {
				    	   var orderId = results.orderId;
				    	   
				    	   alert('Success' + orderId);
				    	   //已生产订单，清空当前数据
				    	   //$scope.cart.dropCheck();
				    	   
				    	   window.location.href = "#/order/"+orderId;
						}).error(function (results) {
					          CommonService.toast('生成订单异常，请稍后再试');
				       });
					
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '预购订单独生成订单',
							template: '请勾选预购的产品，独生成预购订单!'
						});
					}
			}else{
				var alertPopup = $ionicPopup.alert({
					title: 'No item in your Cart',
					template: 'Please add Some Items!'
				});
			}
		}
	  
 })

  
  .controller('OrderCtrl', function($scope,$http,$stateParams, sharedCartService,CommonService) {
	  
	  
	  //初始化购物车的产品属性
	  angular.element(document).ready(function () {
		  $scope.orderId = $stateParams.orderId;
		  $scope.addrChoice = 'A';
		  $scope.initData();
	  });
	  
	 
	  $scope.show_addr = true;
	  $scope.show_shop = false;
	  
	//全选按钮
		$scope.pushNotificationChange = function(val) {
			 
			$scope.addrChoice = val;
			 if($scope.addrChoice === 'A'){
				 $scope.show_addr = true;
				 $scope.show_shop = false;
			 }else{
				 $scope.show_addr = false;
				 $scope.show_shop = true;
			 }
		};
	  
	  $scope.initData = function(){
		//获取产品资料
	       CommonService.get('/orders/getOrdersById',{'id':$scope.orderId }).success(function (results) {
	    	   $scope.orders = 	results;
	    	   
	    	   var userAddr = sessionStorage.getItem('user_select_address');
	    	   if(null != userAddr){
	    		   var userAddrData = JSON.parse(userAddr);
	    		   $scope.orders.contactUserName = userAddrData.contactUserName;
	    		   $scope.orders.contractTel = userAddrData.contractTel;
	    		   $scope.orders.dispatchAddr = userAddrData.address;
	    	   }
	    	   
			}).error(function (results) {
		          CommonService.toast('获取分类异常，请稍后再试');
	       });
	  }
	  
     $scope.goAddress = function(){
    	 alert($scope.orderId);
    	 window.location.href="#/address/"+$scope.orderId;
	  }
	  
	  $scope.pay = function(){
		  
	  }
	  
  })
  
  
  .controller('ChongzhiCtrl', function($scope,$http,$stateParams, CommonService) {
	  
	  //初始化购物车的产品属性
	  angular.element(document).ready(function () {
		
		  $scope.initData();
		  $scope.czId =0;
		  $scope.czAmount =0.00;
	  });
	  
	  
	//全选按钮
	$scope.pushNotificationChange = function(val,amount) {
		 alert(val);
		 alert(amount);
		$scope.czId = val;
		$scope.czAmount = amount;
	};
		
	  $scope.initData = function(){
			//获取产品资料
		       CommonService.get('/activity/WXfindActivityByType',{'type':'0'}).success(function (results) {
		    	   $scope.activitys = results.data;

		    	   console.log(JSON.stringify($scope.activitys));
				}).error(function (results) {
			          CommonService.toast('获取分类异常，请稍后再试');
		       });
		  }
	  
	  //充值操作
	  $scope.chongzhi = function(){
		  if($scope.czId != 0){
			  var czParams = {'id':$scope.czId,'userId':5};
	          var url = "/userAccount/recharge";
	          CommonService.postBody(url,czParams).success(function (results) {
		    	   var orderId = results.orderId;
	               window.location.href="#/rechargeorder/"+orderId;
	               
	          }).error(function (results) {
				    CommonService.toast('生成订单异常，请稍后再试');
			  });
		  }else {
			  var alertPopup = $ionicPopup.alert({
					title: '没有选择充值订单',
					template: '请选择充值订单!'
				});
		  }

	  }
  })
  
  
   .controller('RechargeOrderCtrl', function($scope,$http,$stateParams, sharedCartService,CommonService) {
	   //初始化购物车的产品属性
		  angular.element(document).ready(function () {
			  $scope.orderId = $stateParams.orderId;
			  $scope.initData();
		  });

		  $scope.initData = function(){
			//获取产品资料
		       CommonService.get('/orders/getOrdersById',{'id':$scope.orderId }).success(function (results) {
		    	   $scope.orders = 	results;
		    	   
				}).error(function (results) {
			          CommonService.toast('获取分类异常，请稍后再试');
		       });
		  }
		  
		  $scope.pay = function(){
			  
		  }
		  
  })
  
  
  .controller('AddressCtrl', function($scope,$http,$state,$stateParams, CommonService) {

	  $scope.orderId = $stateParams.orderId;
	  
	  //初始化购物车的产品属性
	  angular.element(document).ready(function () {
		  $scope.orderId = $stateParams.orderId;
		  sessionStorage.setItem('user_select_order', ''+$scope.orderId);
		  $scope.initData();
	  });
	  
	  $scope.pushNotificationChange = function(id,contactUserName,contractTel,address ){
		  var selectAddr = {'id':id,'contactUserName':contactUserName,'contractTel':contractTel,'address':address};
		  sessionStorage.setItem('user_select_address', JSON.stringify(selectAddr));
	  }
	  
	  //TODO add dync userId
      $scope.initData = function(){
    	  CommonService.get('/userAddr/findUserAddrByUserId',{'userId':'5'}).success(function (results) {
	    	   $scope.userAddress = results.data;
	    	   
			}).error(function (results) {
		          CommonService.toast('获取数据异常，请稍后再试');
	       });
      }
      
      $scope.goDel = function(id){
    	  CommonService.post('/userAddr/del', {'idStr':id}).success(function (results) {
    		 
    		  //$state.go($state.current, {'orderId':$scope.orderId}, {location: "replace", reload: true});
    		  window.location.reload(true);
    		  
			}).error(function (results) {
		          CommonService.toast('获取数据异常，请稍后再试');
	       });
      } 
      
      $scope.goEdit = function(id){
    	  window.location.href='#/addaddr/'+id;
      } 
      
      
      $scope.goAdd = function(){
    	  window.location.href='#/addaddr/00';
      } 
      
      $scope.isToOrder = function(){
    	  var orderId = sessionStorage.getItem('user_select_order');
    	  if(null == orderId || orderId === '00')
          {
    		  return false;
          }else{
        	  return true;
          }
    	  
      } 
      
      //返回到对应的页面
      $scope.goOrder = function(){
    	  if($scope.isToOrder()){
    		  window.location.href='#/order/'+sessionStorage.getItem('user_select_order');
    	  }else{
    		  window.location.href='#/app/account';
    	  }
    	 
      } 
      
  })
  
  
  .controller('AddAddrCtrl', function($scope,$http,$state,$stateParams, CommonService) {
   
	 
	  var vm=$scope.vm={};
	  
	  //例1
	  vm.CityPickData = {
		  areaData: [],
		  tag: '-',
		  defaultAreaData: ['广州', '广东', '天河区']
	  }
	  
	  //初始化参数
	  angular.element(document).ready(function () {
		  $scope.id = ''+$stateParams.id;
		  if($scope.id == 00){
			  $scope.userAddr = {};
		  }else{
			  $scope.initData();
		  }
	  });
	  
	  
	  //TODO add dync userId
      $scope.initData = function(){
    	  CommonService.post('/userAddr/findUserAddrById',{'id':''+$scope.id}).success(function (results) {
	    	   $scope.userAddr = results;
			}).error(function (results) {
		          CommonService.toast('获取数据异常，请稍后再试');
	       });
      }
      
      //保存并返回到用户地址列表
      $scope.saveAddr = function(){
    	  $scope.userAddr.userId = 5;
    	  $scope.userAddr.province =  vm.CityPickData.areaData[0];
    	  $scope.userAddr.city =  vm.CityPickData.areaData[1];
    	  $scope.userAddr.area =  vm.CityPickData.areaData[2];
    	  
    	  CommonService.post('/userAddr/save',$scope.userAddr).success(function (results) {
    		  
    		  var orderId = sessionStorage.getItem('user_select_order');
    		  //跳转刷新
    		  $state.go('address',{'orderId':orderId},{location: "replace", reload: true});
    		  
			}).error(function (results) {
		          CommonService.toast('获取数据异常，请稍后再试');
	       });
      }
	  
  })
  
  .controller('ActivityCtrl', function($scope,$http,$stateParams, CommonService) {
	      //获取活动
		  angular.element(document).ready(function () {
			  $scope.initData();
		  });

		  $scope.initData = function(){
			//获取活动
		       CommonService.get('/activity/WXfindActivityAllBySort').success(function (results) {
		    	   $scope.activityes = 	results.data;
		    	   
				}).error(function (results) {
			          CommonService.toast('获取活动异常，请稍后再试');
		       });
		  }
		  
		 
		  
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


  .controller('LoginCtrl', function ($scope, $location, $window, UserService, CommonService) {
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
        $location.path('dash');
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.toast('服务器异常,请稍后重试');
        CommonService.hideLoading();
      });
    }
  })

  .controller('RegisterCtrl', function ($scope, $location, $interval, CommonService) { //注册Controller
    $scope.btnText = '获取验证码';
    $scope.register = {};
    $scope.userRegister = function (regForm, register) {
      CommonService.showLoadding();
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

myModule.directive('ngBack', function ($ionicHistory) {
var FOCUS_CLASS = "ng-back";
return {
  restrict: 'A',
  link: function (scope, element, attrs, ctrl) {
    element.bind('click', function (event) {
      $ionicHistory.goBack();
    })
  }
}
});



