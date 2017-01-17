var app = getApp();
var server = require('../../utils/server.js');
Page({
	data: {
		cart: {
			count: 0,
			total: 0
		},
		cartList : [],
		localList: [],
		showCartDetail: false,
		defaultImg: 'http://global.zuzuche.com/assets/images/common/zzc-logo.png',
	},
	onLoad: function (options) {
		var shopId = options.id;
		var shop = server.selectedShopDetail(shopId) // throw Exception
		this.setData({
			shopId: shopId,
			shop: shop
		})
		var res = wx.getStorageSync('orderList');
		if(res)
		{
			this.setData({
				cart: {
					count: res.count,
					total: res.total
				}
			});
			if(!server.isEmptyObject(res.cartList))
			{
				this.setData({
					cartList:res.cartList,
					localList: server.filterEmptyObject(res.cartList)
				})
			}
		}
		if(typeof this.data.cartList[this.data.shopId] == 'undefined' || server.isEmptyObject(this.data.cartList[this.data.shopId]))
		{
			var cartList = this.data.cartList;
			cartList[this.data.shopId] = [];
			this.setData({
				cartList: cartList
			})
		}
		console.log(this.data.localList, this.data.cartList)
	},
	onShow: function () {
		this.setData({
			classifySeleted: 1
		});
	},
	checkOrderSame: function(name){
		var list = this.data.cartList[this.data.shopId];
		for(var index in list){
			if(list[index].name === name){
				return index;
			}
		}
		return false;
	},
	tapAddCart: function (e) {
		var price = parseFloat(e.target.dataset.price);
		var name  = e.target.dataset.name;
		var img   = e.target.dataset.pic;
		var list  = this.data.cartList;
		var sortedList = [];
		var index;
		if(index = this.checkOrderSame(name)){
			sortedList = list[this.data.shopId][index];
			var num = list[this.data.shopId][index].num;
			list[this.data.shopId][index].num = num + 1;
		}
		else{
			var order = {
				"price" : price,
				"num" : 1,
				"name": name,
				'img':  img,
				"shopId": this.data.shopId,
				"shopName": this.data.shop.restaurant_name,
				"pay": 0,
			}
			list[this.data.shopId].push(order);
			sortedList = order;
		}
		this.setData({
			cartList: list,
			localList: server.filterEmptyObject(list)
		});
		this.addCount( sortedList);
	},
	tapReduceCart: function (e) {
		var name = e.target.dataset.name;
		var price = parseFloat(e.target.dataset.price);
		var list  = this.data.cartList;
		var index, sortedList = [];
		if(index = this.checkOrderSame(name)){
			var num = list[this.data.shopId][index].num
			if(num > 1){
				sortedList = list[this.data.shopId][index];
				list[this.data.shopId][index].num = num - 1;			
			}
			else{
				sortedList = list[this.data.shopId][index]
				list[this.data.shopId].splice(index, 1);
			}	
		}
		this.setData({
			cartList: list,
			localList: server.filterEmptyObject(list)
		});
		this.deduceCount(sortedList);
	},
	addCount: function (list) {
		var count = this.data.cart.count + 1,
			total = this.data.cart.total + list.price;
		total = Math.round(parseFloat(total));		
		this.saveCart(count, total);
	},
	deduceCount: function(list){
		var count = this.data.cart.count - 1,
			total = this.data.cart.total - list.price;
		total = Math.round(parseFloat(total));
		this.saveCart(count, total);
	},
	saveCart: function(count, total){
		total = Math.round(parseFloat(total));
		if(typeof total == null)
			total = 0;		
		this.setData({
			cart: {
				count: count,
				total: total
			}
		});
		wx.setStorage({
			key: 'orderList',
			data: {
				cartList: this.data.cartList,
				count: this.data.cart.count,
				total: this.data.cart.total,
			}
		})
	},
	follow: function () {
		this.setData({
			followed: !this.data.followed
		});
	},
	onGoodsScroll: function (e) {
		if (e.detail.scrollTop > 10 && !this.data.scrollDown) {
			this.setData({
				scrollDown: true
			});
		} else if (e.detail.scrollTop < 10 && this.data.scrollDown) {
			this.setData({
				scrollDown: false
			});
		}

		var scale = e.detail.scrollWidth / 570,
			scrollTop = e.detail.scrollTop / scale,
			h = 0,
			classifySeleted,
			len = this.data.shop.menu.length;
		this.data.shop.menu.forEach(function (classify, i) {
			var _h = 70 + classify.menu.length * (46 * 3 + 20 * 2);
			if (scrollTop >= h - 100 / scale) {
				classifySeleted = classify.id;
			}
			h += _h;
		});
		this.setData({
			classifySeleted: classifySeleted
		});
	},
	tapClassify: function (e) {
		var id = e.target.dataset.id;
		console.log(id);
		this.setData({
			classifyViewed: id
		});
		console.log(this.data.classifyViewed)
		var self = this;
		setTimeout(function () {
			self.setData({
				classifySeleted: id
			});
		}, 100);
	},
	showCartDetail: function () {
		this.setData({
			showCartDetail: !this.data.showCartDetail
		});
	},
	hideCartDetail: function () {
		this.setData({
			showCartDetail: false
		});
	},
	submit: function (e) {
		var total = this.data.cart.total
		wx.navigateTo({
		  url: '/page/order/order?pay=1&total=' + total
		})
	}
});

