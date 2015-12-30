#bili-comment Bilibili 直播弹幕助手

***DISCLAIMER this is a fork of the [original project](https://coding.net/u/payne/p/bili-comment/git) by payne***

`Bilibili 直播弹幕助手` 是一个帮助Linux播主快速查看直播弹幕的工具。

有几个功能：

1. 同步连接bilibili弹幕服务器
2. 观看B站直播视频流
3. 弹幕以notification形式弹出

##安装与使用

###安装

1. 安装所需的软件: nodejs, mpv
2. 安装本弹幕助手
> `sudo npm install -g bilibili-comment`

###使用

***由于一些新加的功能，目前只能在linux下使用***

安装完成后运行`bilicom <直播间id>`

## 已知问题

###弹幕弹出后失去focus

在相应的窗口管理器中设定，不让notification自动获得focus

如，在awesome中，可以在rules下增加

> `{ rule = { class = "Xfce4-notifyd"},`
> `properties = {focus=false} },`
