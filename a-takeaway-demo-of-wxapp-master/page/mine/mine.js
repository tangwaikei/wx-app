var app = getApp();
var server = require('../../utils/server');
Page({
	data: {},
	onLoad: function () {
		var that = this
		//调用应用实例的方法获取全局数据
		app.getUserInfo(function(userInfo){
		//更新数据
		that.setData({
			userInfo: userInfo
		});
		that.update();
		console.log(userInfo)
		});
	},
	onShow: function () {
		this.setData({
			userInfo: app.globalData.userInfo
		});
		console.log(this.data.userInfo);
	}
});

