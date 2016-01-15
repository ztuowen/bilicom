# bilicom Bilibili 直播弹幕助手

***DISCLAIMER this is a fork of the [original project](https://coding.net/u/payne/p/bili-comment/git) by payne***

`Bilibili 直播弹幕助手` 是一个帮助Linux播主快速查看直播弹幕的工具。

有几个功能：

1. 同步连接bilibili弹幕服务器
2. 观看B站直播视频流
3. 弹幕通过aosd在屏幕上显示

## 安装与使用

### 安装

1. 安装所需的软件: nodejs, mpv, [libaosd(aosd_cat)](https://github.com/mkoskar/libaosd-xinerama)
2. 安装本弹幕助手: `sudo npm install -g bilicom`

### 使用

安装完成后运行`bilicom <直播间id>`

***由于一些新加的功能，目前以下功能只能在linux下使用***

* 屏幕上弹幕提示 - aosd
* 观看直播间视频 - mpv

## 没图说个XX

### 发送弹幕时屏幕提示

![image](https://cloud.githubusercontent.com/assets/6838440/12362086/d81ec82e-bb7e-11e5-8e36-f61dbe1b057b.png)

### 多个弹幕的叠加效果&弹幕机界面截图

![image](https://cloud.githubusercontent.com/assets/6838440/12362141/0bb6d866-bb7f-11e5-9ceb-f0ec07d99280.png)

### 使用弹幕机观看直播

![image](https://cloud.githubusercontent.com/assets/6838440/12362229/68640c64-bb7f-11e5-8c8c-54f6d0085a7a.png)

