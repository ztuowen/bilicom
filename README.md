#bili-comment Bilibili 直播弹幕助手

***DISCLAIMER this is a fork of the [original project](https://coding.net/u/payne/p/bili-comment/git) by payne***


* 下载和开发文档: [API Documentation](http://bili.micblo.com/)
* 快速配置工具: [Config](http://bili.micblo.com/#config/tool)

`Bilibili 直播弹幕助手` 是一个帮助播主快速查看直播弹幕的工具。

有几个功能：

1. 同步连接bilibili弹幕服务器
2. 可以储存弹幕信息

##安装与使用

###安装

> 需要安装: Node.js (开发环境 : v0.10.31)，mpv

> 需要 `npm install --registry=http://r.cnpmjs.org` 以及

> `npm install libnotify` 初始化必要的 `node_modules`

###使用

***由于一些新加的功能，目前只能在linux下使用***

####配置

第一次使用需要配置助手。

详细配置方法请参考`config-example.js`。

####使用

安装完成后在本目录下运行 `node bili-comment.js`
