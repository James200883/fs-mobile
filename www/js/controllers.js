var myModule = angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, CartService) {
    var shopCart = CartService.getCartData();
    var totalCount = 0;
    if (shopCart) {
      shopCart = shopCart.cart;
      for (var i = 0; i < shopCart.length; i++) {
        totalCount += shopCart[i].cart_item_qty;
      }
    }
    $scope.badges = {carts: totalCount}
  })

  .controller('DashCtrl', function($scope, CommonService, CartService) {
    $scope.slide_items = [];
    $scope.productData = [];
    $scope.categoryData = [];
    $scope.options = {loop: true, effect: 'fade', speed: 500};
    $scope.loadPageData = function (){ //首页分类 热门推荐
      CommonService.get('/pageAds/findHomePageAds').success(function (results) {
        $scope.cateTitle = '分类';
        $scope.hotProd = '热门推荐';
        $scope.slide_items = results.bannerData;
        $scope.productData = results.pageProduct;
        $scope.categoryData = results.pageCategory;
      }).error(function (results) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };

    $scope.shopCart = function (productId, productImg, productName, productPrice, productWeight, tagPresell) { //加入购物车
      var product = {};
      product.productId = productId;
      product.productImg = productImg;
      product.productName = productName;
      product.productPrice = productPrice;
      product.productCount = 1;
      product.productWeight = productWeight;
      product.tagPresell = tagPresell;
      CartService.addCart(product);

      CommonService.toast('已成功加入购物车o(∩_∩)o');
    };
  })

  .controller('CategoryCtrl', function($scope, $stateParams, $state, $timeout, CartService, CommonService) {
    $scope.hasmore = false;
    $scope.productData = [];
    $scope.cateId = $stateParams.categoryId;
    $scope.priceSort = '';
    var param = {page: 1, pageSize: 10, type: 'sale', categoryId: $scope.cateId}, timer = null;

    $scope.initCateData = function () {//初始化数据
      loadCategory();
      loadProduct(param);
    };

    $scope.sortProduct = function (sortType) { //排序
      if (sortType == 'price') {
        if ($scope.priceSort == 'up') {
          $scope.priceSort = 'down';
          param.sortType = 1;
        } else if ($scope.priceSort == 'down') {
          $scope.priceSort = 'up';
          param.sortType = 0;
        } else {
          $scope.priceSort = 'up';
          param.sortType = 0;
        }
      }
      param.type = sortType;
      param.page = 1;
      loadProduct(param);
    };

    $scope.getProdByCategoryId = function (categoryId) {//分类查询商品
      param.categoryId = categoryId;
      param.page = 1;
      loadProduct(param);
    };

    $scope.loadMore = function () {
      param.page = param.page + 1;
      timer = $timeout(function () {
        if (!$scope.hasmore) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return;
        }

        CommonService.get('/product/cateListApp', param).success(function (res) {
          $scope.hasmore = res.next_page > 0;
          $scope.productData = $scope.productData.concat(res.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (res) {
          CommonService.toast('获取商品异常,请稍后再试');
        });
      }, 1000);
    };

    $scope.moreDataCanBeLoaded = function () {
      return $scope.hasmore;
    };

    $scope.addToCart = function (productId, productImg, productName, productPrice, productWeight, tagPresell) {
      var product = {};
      product.productId = productId;
      product.productImg = productImg;
      product.productName = productName;
      product.productPrice = productPrice;
      product.productCount = 1;
      product.productWeight = productWeight;
      product.tagPresell = tagPresell;
      CartService.addCart(product);

      CommonService.toast('已成功加入购物车o(∩_∩)o');
    };

    function loadCategory() { //获取分类
      CommonService.get('/category/getWXAllCategory').success(function (results) {
        $scope.categoryData = results.data;
      }).error(function () {
        CommonService.toast('获取分类异常，请稍后再试');
      });
    }

    function loadProduct(paramData) { //获取产品
      CommonService.showLoadding();
      CommonService.get('/product/cateListApp', paramData).success(function (results) {
        $scope.productData = results.data;
        CommonService.hideLoading();
        if (results.next_page > 0) {
          $scope.hasmore = true;
        }
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取商品异常,请稍后再试');
      });
    }
  })

  .controller('ProductDetailCtrl', function($scope, $stateParams, $state, CartService, CommonService, UserService) { //产品详情
    $scope.productDetailImages = [];
    $scope.productInfo = [];
    $scope.productDetails = [];
    $scope.activities = '';
    $scope.sellCount = 1;
    $scope.options = {loop: true, effect: 'fade', speed: 500};
    $scope.initProductDetailData = function () {
      loadProductDetail();
      loadActivity();
    };

    $scope.addShopCart = function (productId, productImg, productName, productPrice, productWeight, tagPresell) { //加入购物车
      var product = {};
      product.productId = productId;
      product.productImg = productImg;
      product.productName = productName;
      product.productPrice = productPrice;
      product.productCount = 1;
      product.productWeight = productWeight;
      product.tagPresell = tagPresell;
      CartService.addCart(product);

      CommonService.toast('已成功加入购物车o(∩_∩)o');
    };

    $scope.buy = function (productInfo) { //立即购买
      var orderItem = {}, resultObj = [];
      orderItem.productId = productInfo.id;
      orderItem.productName = productInfo.name;
      orderItem.productUrl = productInfo.imageUrl;
      orderItem.sellCount = $scope.sellCount;
      orderItem.distPrice = productInfo.price;
      orderItem.sellPrice = ($scope.sellCount) * (productInfo.price);
      resultObj.push(orderItem);

      var orderParam = {userId: UserService.getUserId(), orderType: productInfo.tagPresell, amount: ($scope.sellCount) * (productInfo.price), items: resultObj};
      CommonService.showLoadding();
      CommonService.postBody('/orders/addOrUpdateOrders', orderParam).success(function (res) {
        CommonService.hideLoading();
        $state.go('order', {orderId: res.orderId});
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后再试');
      });
    };

    $scope.sellCounts = function (type) {
      if (type == 'reduce' && $scope.sellCount > 1) {
        $scope.sellCount = $scope.sellCount - 1;
      }
      if (type == 'add') {
        $scope.sellCount = $scope.sellCount + 1;
      }
    };

    function loadProductDetail () { //加载商品详情
      CommonService.get('/product/getWXProductById', {id: $stateParams.productId}).success(function (res) {
        $scope.productDetailImages = res.picData;
        $scope.productInfo = res.product;
        $scope.productDetails = res.productInfo;
      }).error(function () {
        CommonService.toast('获取商品详情异常,请稍后再试');
      });
    };

    function loadActivity () { //加载促销活动
      CommonService.get('/activity/WXfindActivityProduct').success(function (res) {
        var prodActivities = res.data;
        var arr = [];
        for (var i = 0; i < prodActivities.length; i++) {
          if (i >= 2) {break;}
          arr.push(prodActivities[i].name);
        }
        $scope.activities = arr.toString();
      }).error(function () {
        CommonService.toast('服务器异常,请稍后再试');
      });
    }
  })

  .controller('CartCtrl', function ($scope, $stateParams, $state, CartService, CommonService, UserService) { //购物车
    $scope.cartProducts = [];
    $scope.totalPrice = 0.0;
    $scope.pushNotification = {checked: false};
    $scope.initCartData = function () { //初始化购物车商品
      var cartData = CartService.getCartData();
      if (cartData) {
        $scope.cartProducts = cartData.cart;
      }
    };

    $scope.decrement = function (itemId) { //数量减
      CartService.decrement(itemId);
    };

    $scope.increment = function (itemId) { //数量加
      CartService.increment(itemId);
    };

    $scope.pushNotificationChange = function () { //全选
      CartService.notificationAll($scope.pushNotification.checked);
      $scope.totalPrice = CartService.totalAmount;
    };

    $scope.itemNotificationChange = function (itemId) { //单选
      CartService.notificationItem(itemId);
      $scope.totalPrice = CartService.totalItemAmount;
    };

    $scope.deleteCart = function (id) {
      CommonService.showConfirm('确认要删除这个宝贝吗?').then(function (res) {
        if (res) {
          CartService.deleteCartById(id);
        }
      });
    };

    $scope.goPay = function () { //去结算
      if ($scope.totalPrice > 0) {
        var objs = CartService.getSelectedCartData(); //获取被选中的商品
        var orderType = CartService.isMixed(objs);
        if (orderType == 0) {
          CommonService.toast('预购商品请单独下单');
        } else {
          var orderParam = {userId: UserService.getUserId(), orderType: orderType, amount: $scope.totalPrice, items: objs};
          CommonService.showLoadding();
          CommonService.postBody('/orders/addOrUpdateOrders', orderParam).success(function (res) {
            CommonService.hideLoading();
            $state.go('order', {orderId: res.orderId});
          }).error(function () {
            CommonService.hideLoading();
            CommonService.toast('服务器异常,请稍后再试');
          });
        }
      } else {
        CommonService.toast('您还没有选择商品哦!');
      }
    }
  })

  .controller('OrderCtrl', function($scope, $stateParams, CommonService, UserService) { //填写订单
    var addressId = $stateParams.addressId;
    $scope.orderId = $stateParams.orderId;
    $scope.addrChoice = 'A';
    $scope.showShop = false;
    $scope.showAddress = true;
    $scope.orders = [];
    $scope.addresses = null;

    $scope.initOrderData = function () {
      initProductData();
      if (addressId) {
        initUserAddressDataByAddressId();
      } else {
        initUserAddressDataByUserId();
      }
    };

    $scope.pushNotificationChange = function (val) {
      $scope.addrChoice = val;
      if ($scope.addrChoice == 'A') {
        $scope.showAddress = true;
        $scope.showShop = false;
      } else {
        $scope.showShop = true;
        $scope.showAddress = false;
      }
    };

    $scope.payment = function () { //支付
      var paramOrder = {};
      paramOrder.dispatchAddr = $scope.addresses.address;
      paramOrder.area = $scope.addresses.area;
      paramOrder.city = $scope.addresses.city;
      paramOrder.province = $scope.addresses.province;
      paramOrder.contactUserName = $scope.addresses.contactUserName;
      paramOrder.contractTel = $scope.addresses.contractTel;
      paramOrder.orderId = $scope.orderId;
      paramOrder.payType = 2;

      CommonService.post('/appPay/appUnifiedorder', paramOrder).success(function (res) {
        console.log(res);
      }).error(function () {
        CommonService.toast('程序异常,请稍后再试');
      });
      /*Wechat.isInstalled(function (installed) {
        if (installed) {
          CommonService.post('/appPay/appUnifiedorder', paramOrder).success(function (res) {
            alert(res);
          }).error(function () {
            CommonService.toast('程序异常,请稍后再试');
          });
        } else {
          CommonService.toast('未检测到微信支付相关应用程序');
        }
      }, function (reason) {
        CommonService.toast(reason);
      });*/
    };

    function initProductData () { //初始化订单产品信息
      CommonService.get('/orders/getOrdersById', {id: $scope.orderId}).success(function (res) {
        $scope.orders = res;
      }).error(function () {
        CommonService.toast('初始化订单失败!');
      });
    }

    function initUserAddressDataByUserId () { //获取用户地址
     CommonService.get('/userAddr/findUserAddrByUserId', {userId: UserService.getUserId()}).success(function (res) {
       $scope.addresses = res.data[0];
     });
    }

    function initUserAddressDataByAddressId() {
      CommonService.post('/userAddr/findUserAddrById', {id: addressId}).success(function (res) {
        $scope.addresses = res;
      });
    }
  })

  .controller('RechargeCtrl', function($scope, $stateParams, $state, CommonService, UserService) { //会员充值
    $scope.user = UserService.getUserName();
    $scope.rechargeAmounts = [];

    $scope.initRechargeData = function () {
      CommonService.get('/activity/WXfindActivityByType', {type: 0}).success(function (res) {
        $scope.rechargeAmounts = res.data;
      });
    };

    $scope.goRecharge = function (rechargeId) {
      CommonService.showLoadding();
      CommonService.postBody('/userAccount/recharge', {id: rechargeId, userId: UserService.getUserId()}).success(function (res) {
        $state.go('rechargeOrder', {orderId: res.orderId});
        CommonService.hideLoading();
      }).error(function () {
        CommonService.toast('生成订单异常，请稍后再试');
      });
    }
  })

  .controller('RechargeOrderCtrl', function($scope, $stateParams, CommonService) { //充值订单
    var orderId = $stateParams.orderId;
    $scope.orderNo = '';
    $scope.rechargeAmount = '';
    $scope.payAmount = '';

    $scope.initRechargeOrderData = function () {
      CommonService.get('/orders/getOrdersById', {id: orderId}).success(function (res) {
        $scope.orderNo = '订单编号:' + res.orderNo;
        $scope.rechargeAmount = '充值金额:' + res.amount;
        $scope.payAmount = '支付金额:' + res.payAmount;
      }).error(function () {
        CommonService.toast('初始化订单失败!');
      });
    };

    $scope.payment = function () {

    }
  })

  .controller('AddressCtrl', function($scope, $state, $stateParams, CommonService, UserService) { //我的收货地址
    var flagId = $stateParams.orderId; //标识作用,用于订单页面选择地址后返回
    $scope.userAddresses = [];
    $scope.initUserAddress = function () {
      CommonService.showLoadding();
      CommonService.get('/userAddr/findUserAddrByUserId', {'userId': UserService.getUserId()}).success(function (res) {
        $scope.userAddresses = res.data;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据异常，请稍后再试');
      });
    };

    $scope.delAddress = function (id) { //删除收获地址
      CommonService.showConfirm('确定删除该地址吗').then(function (res) {
        if (res) {
          CommonService.post('/userAddr/del', {idStr: id}).success(function (res) {
            if (res.success == 'true') {
              CommonService.toast('删除成功');
            }
          }).error(function () {
            CommonService.toast('删除失败');
          });
        }
      });
    };

    $scope.selectAddress = function (userAddress) {
      if (flagId) {
        $state.go('order', {orderId: flagId, addressId: userAddress.id});
      }
    }
  })

  .controller('addOrEditAddressCtrl', function($scope, $state, $stateParams, CommonService, CityDataService, UserService) {
    var addressId = $stateParams.id;
    $scope.cities = [];
    $scope.districts = [];
    $scope.regionData = CityDataService.all();
    if (addressId) {
      $scope.addressTitle = '编辑收货地址';
    } else {
      $scope.addressTitle = '新增收货地址';
    }

    $scope.switchProvince = function (provinceName) {
      $scope.cities = [];
      $scope.districts = [];
      $scope.cities = CityDataService.getCities(provinceName);
    };

    $scope.switchCities = function (cityName) {
      if (cityName && $scope.cities) {
        $scope.districts = CityDataService.getArea(cityName, $scope.cities);
      }
    };

    $scope.saveOrEditAddress = function (addressForm, addressInfo) { //新增或修改收获地址
      if (addressForm.$valid) {
        addressInfo.userId = UserService.getUserId();
        addressInfo.id = addressId;
        CommonService.showLoadding();
        CommonService.post('/userAddr/save', addressInfo).success(function (res) {
          CommonService.toast('保存成功');
          CommonService.hideLoading();
          $state.go('address');
        }).error(function () {
          CommonService.hideLoading();
          CommonService.toast('保存收货地址失败');
        });
      }
    }
  })

  .controller('ActivityCtrl', function($scope, $state, CommonService, UserService) {
    $scope.activities = [];

    $scope.initActivityData = function () {
      CommonService.showLoadding();
      CommonService.get('/activity/WXfindActivityAllBySort').success(function (res) {
        $scope.activities = res.data;
        CommonService.hideLoading();
      });
    };

    $scope.activityRecharge = function (rechargeId) {
      CommonService.showLoadding();
      CommonService.postBody('/userAccount/recharge', {id: rechargeId, userId: UserService.getUserId()}).success(function (res) {
        $state.go('rechargeOrder', {orderId: res.orderId});
        CommonService.hideLoading();
      }).error(function () {
        CommonService.toast('生成订单异常，请稍后再试');
      });
    };

    $scope.goBBSDetail = function (resourceId) {
      var bbsId = resourceId.split('=')[1];
      $state.go('bbsDetail', {bbsId: bbsId});
    }
  })

  .controller('AccountCtrl', function($scope, CommonService, UserService) {
    $scope.loadAccountInfo = function () {
      CommonService.post('/member/userIndex', {'userId': UserService.getUserId()}).success(function (res) {
        if (res.result) {
          if (res.result.imageUrl) {
            $scope.headImg = res.result.imageUrl;
          } else {
            $scope.headImg = 'img/head.png';
          }
          $scope.realName = res.result.realname;
          $scope.userAmount = res.result.amount;
          $scope.userCouponCount = res.result.couponCount;
          $scope.userPoint = res.result.userPoint;
        }
      }).error(function (res) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };

    $scope.userLogOut = function () {
      CommonService.showConfirm('确定要离开我吗?>﹏<').then(function (res) {
        if (res) {
          UserService.logout();
        }
      });
    };

    $scope.$on('$stateChangeSuccess', $scope.loadAccountInfo);
  })

  .controller('BBSCtrl', function($scope, CommonService) {
    $scope.loadBBS = function () {
      CommonService.get('/blog/findBlogNew', {}).success(function (res) {
        $scope.blogs = res;
      }).error(function (res) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };
  })

  .controller('LoginCtrl', function ($scope, $state, $window, UserService, CommonService) {
    $scope.userParams = {};
    $scope.loginUser = function (user) {
      $scope.userParams = user;
      if (typeof (user) == 'undefined' || user.username == '' || user.password == '') {
        CommonService.toast('手机号或密码不填,小心召唤出怪物喔>o<');
        return false;
      }
      /*$scope.userParams.client_id = 'clientName';
      $scope.userParams.client_secret = 'clientPassword';
      $scope.userParams.grant_type = 'password';
      $scope.userParams.scope = 'read write';*/

      CommonService.showLoadding();
      CommonService.post('/user/userLogin', $scope.userParams).success(function (res) {
        if (res.code == '002') {
          CommonService.toast('用户不存在');
        }
        if (res.code == '004') {
          CommonService.toast('用户名或密码不正确');
        }
        if (res.code == '003') { //验证成功
          UserService.setObject('user_token', res.data);
          $state.go('app.dash');
        }
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后重试');
      });
      /*UserService.login($scope.userParams).success(function (res) {
        UserService.setObject('user_token', res);
        $state.go('app.dash');
        CommonService.hideLoading();
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后重试');
      });*/
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
    $scope.loadCoupon = function () {
      CommonService.post('/userCoupon/getUserCoupon', {'userId': UserService.getUserId()}).success(function (res) {
        $scope.coupons = res.data;
      }).error(function (res) {
        CommonService.toast('服务器异常,请稍后再试');
      });
    };
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
    $scope.loadUserInfo = function () {
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
    };

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
              CommonService.toast('操作失败(T_T)');
            }
          }).error(function (res) {
            CommonService.toast('服务器异常,请稍后再试');
          });
          return true;
        }
      });
    };

    $scope.$on('$stateChangeSuccess', $scope.loadUserInfo);
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

    $scope.loadShops = function () {
      CommonService.showLoadding();
      CommonService.get('/store/getStoreByPage', param).success(function (res) {
        $scope.shops = res.data;
        CommonService.hideLoading();
        if (res.next_page > 0) {
          $scope.hasmore = true;
        }
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后再试');
      });
    };

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

    $scope.$on('$destroy', function () {
      if (timer != null) {
        $timeout.cancel(timer);
      }
    });
    $ionicListDelegate.showReorder(true);
  })

  .controller('ShopCtrlDetailCtrl', function ($scope, $stateParams, CommonService) { //店铺详情
    $scope.loadShopDetail = function () {
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
    };

    $scope.favouriteShop = function () {
      CommonService.toast('已收藏');
    }
  })
  .controller('HealthCtrl', function ($scope, $ionicListDelegate, $timeout, CommonService) {
    $scope.hasmore = false;
    $scope.healths = [];
    var param = {page: 1, pageSize: 10, blogCategoryId: 2}, timer = null;

    $scope.loadHealthData = function () {
      CommonService.showLoadding();
      CommonService.get('/blog/blogList', param).success(function (res) {
        $scope.healths = res.data;
        CommonService.hideLoading();
        if (res.next_page > 0) {
          $scope.hasmore = true;
        }
      }).error(function (res) {
        CommonService.hideLoading();
        CommonService.toast('服务器异常,请稍后再试');
      });
    };

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

    $scope.$on('$destroy', function () {
      if (timer != null) {
        $timeout.cancel(timer);
      }
    });
    $ionicListDelegate.showReorder(true);
  })

  .controller('BBSDetailCtrl', function ($scope, $stateParams, CommonService) {
    $scope.loadBBSDetail = function () {
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
    };
  })

  .controller('SearchResultCtrl', function ($scope, $stateParams, CommonService) {
    $scope.query = $stateParams.query;

    angular.element(document).ready(function () {
      $scope.initData();
    });

    $scope.initData = function(){
      if (null != $scope.query ) {
        CommonService.showLoadding();
        CommonService.get('/product/findAllProductByName', {'name': $scope.query}).success(function (res) {
          $scope.data = res.data;

        }).error(function (res) {
          CommonService.hideLoading();
          CommonService.toast('服务器异常,请稍后再试');
        });
      }
    };

    $scope.search = function(query){
      $scope.initData();
    };
  })

  .controller('MyOrderCtrl', function ($scope, CommonService, UserService) { //我的订单
    $scope.hasmore = false;
    $scope.orders = [];
    var param = {page: 1, pageSize: 10, userId: UserService.getUserId()}, timer = null;
    $scope.searchOrders = function (type) {
      param.type = type;
      if (UserService.getUserId()) {
        CommonService.showLoadding();
        CommonService.get('/orders/getwxrechargeOrders', param).success(function (res) {
          $scope.orders = res.data;
          if (res.next_page > 0) {
            $scope.hasmore = true;
          }
          CommonService.hideLoading();
        }).error(function (res) {
          CommonService.hideLoading();
          CommonService.toast('服务器异常,请稍后再试');
        });
      }
    };

    $scope.loadMore = function () {
      param.page = param.page + 1;
      timer = $timeout(function () {
        if (!$scope.hasmore) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return;
        }

        CommonService.get('/orders/getwxrechargeOrders', param).success(function (res) {
          $scope.hasmore = res.next_page > 0;
          $scope.orders = $scope.orders.concat(res.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (res) {
          CommonService.toast('服务器异常,请稍后再试');
        });
      }, 1000);
    };

    $scope.moreDataCanBeLoaded = function () {
      return $scope.hasmore;
    };
  })

  .controller('RechargeRecordCtrl', function ($scope, $timeout, CommonService, UserService) { //充值记录
    $scope.hasmore = false;
    $scope.orders = [];
    var param = {page: 1, pageSize: 10, userId: UserService.getUserId()}, timer = null;
    $scope.searchRechargeRecord = function (type) {
      param.type = type;
      if (UserService.getUserId()) {
        CommonService.showLoadding();
        CommonService.get('/orders/getwxrechargeOrders', param).success(function (res) {
          $scope.orders = res.data;
          if (res.next_page > 0) {
            $scope.hasmore = true;
          }
          CommonService.hideLoading();
        }).error(function (res) {
          CommonService.hideLoading();
          CommonService.toast('服务器异常,请稍后再试');
        });
      }
    };

    $scope.loadMore = function () {
      param.page = param.page + 1;
      timer = $timeout(function () {
        if (!$scope.hasmore) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return;
        }

        CommonService.get('/orders/getwxrechargeOrders', param).success(function (res) {
          $scope.hasmore = res.next_page > 0;
          $scope.orders = $scope.orders.concat(res.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function (res) {
          CommonService.toast('服务器异常,请稍后再试');
        });
      }, 1000);
    };

    $scope.moreDataCanBeLoaded = function () {
      return $scope.hasmore;
    };
  })

  .controller('MyRecommendMemberCtrl', function ($scope, CommonService, UserService) {//我推荐的会员
    $scope.recommendMembers = [];

    $scope.initMyRecommendMemberData = function () {
      CommonService.showLoadding();
      CommonService.get('/userFollow/findAllUserFollow', {'user.id': UserService.getUserId()}).success(function (res) {
        $scope.recommendMembers = res;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据失败');
      });
    }
  })

  .controller('SuggestMyMemberCtrl', function ($scope, CommonService, UserService) {//推荐我的会员
    $scope.suggestMyMembers = [];

    $scope.initSuggestMyMemberData = function () {
      CommonService.showLoadding();
      CommonService.get('/userFollow/findUserFollowsById', {'userFollowed.id': UserService.getUserId()}).success(function (res) {
        $scope.suggestMyMembers = res;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据失败');
      })
    }
  })

  .controller('MyMessageCtrl', function ($scope, CommonService, UserService) { //我的消息
    $scope.userMessages = [];

    $scope.initUserMessage = function () {
      CommonService.showLoadding();
      CommonService.get('/userMsg/findAllUserMsg', {'user.id': UserService.getUserId()}).success(function (res) {
        $scope.userMessages = res;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据失败');
      });
    }
  })

  .controller('MyDianZanCtrl', function ($scope, $state, CommonService, UserService) { //我的点赞
    $scope.dianZans = [];

    $scope.initDianZan = function () {
      CommonService.showLoadding();
      CommonService.get('/userWish/findAllUserWish', {userId: UserService.getUserId()}).success(function (res) {
        $scope.dianZans = res;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据失败');
      });
    };

    $scope.toPath = function (resource, resourceId) {
      if (resource == 'blog') {
        $state.go('bbsDetail', {bbsId: resourceId});
      }
      if (resource == 'product') {
        $state.go('productDetail', {productId: resourceId});
      }
    }
  })

  .controller('MyMessageContentCtrl', function ($scope, $stateParams) {
    $scope.messageContent = $stateParams.messageContent;
  })

  .controller('FarmReserveCtrl', function ($scope, CommonService, UserService) { //预约农产采摘
    $scope.reserves = [];

    $scope.initReserveData = function () {
      CommonService.showLoadding();
      CommonService.get('/appointment/findAllAppointment', {'applyUser.id': UserService.getUserId()}).success(function (res) {
        $scope.reserves = res;
        CommonService.hideLoading();
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('获取数据失败');
      });
    };

    $scope.deleteReserve = function (index, id) {
      CommonService.showLoadding();
      CommonService.post('/appointment/del', {idStr: id}).success(function (res) {
        if (res.success == 'true') {
          CommonService.hideLoading();
          $scope.reserves.splice(index, 1);
          CommonService.toast('删除成功');
        }
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('删除失败');
      });
    };

    $scope.$on('$stateChangeSuccess', $scope.initReserveData);
  })

  .controller('AddReserveCtrl', function ($scope, $state, CommonService, UserService, ionicDatePicker) {//新增预约
    $scope.reserveData = {};

    $scope.addReserve = function (reserveForm, reserve) {
      CommonService.showLoadding();
      $scope.reserveData = reserve;
      $scope.reserveData.userId = UserService.getUserId();

      CommonService.post('/appointment/saveAppointment', $scope.reserveData).success(function (res) {
        if (res.success == 'true') {
          CommonService.hideLoading();
          CommonService.toast('成功提交预约,我们会尽快处理');
          $state.go('farmReserve');
        }
      }).error(function () {
        CommonService.hideLoading();
        CommonService.toast('操作失败');
      });
    }
  });

myModule.directive('ngFocus', function () {
  var FOCUS_CLASS = 'ng-focused';
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

myModule.directive('ngSwitch', function ($rootScope) {
  return{
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {
      element.bind('click', function () {
        if (!element.hasClass('active') || !element.hasClass('current') || !element.hasClass('cur')) {
          element[0].className = 'sortPrice active current col cur';
          var nextElement = element[0].nextElementSibling;
          var previousElement = element[0].previousElementSibling;
          while (nextElement) {
            if (nextElement.className.indexOf('current') >= 0 || nextElement.className.indexOf('active') >= 0 || nextElement.className.indexOf('cur') >= 0) {
              nextElement.className = 'col';
            } else {
              nextElement = nextElement.nextElementSibling;
            }
          }

          while (previousElement) {
            if (previousElement.className.indexOf('current') >= 0 || previousElement.className.indexOf('active') >= 0 || previousElement.className.indexOf('cur') >= 0) {
              previousElement.className = 'col';
            } else {
              previousElement = previousElement.previousElementSibling;
            }
          }
        }
      });
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
