# bilicom Bilibili 直播弹幕助手

***DISCLAIMER this is a fork of the [original project](https://coding.net/u/payne/p/bili-comment/git) by payne***

`Bilibili 直播弹幕助手` 是一个帮助Linux播主快速查看直播弹幕的工具。

有几个功能：

1. 同步连接bilibili弹幕服务器
2. 发送弹幕
3. 保存弹幕
3. 观看B站直播视频流
4. 弹幕通过aosd在屏幕上显示

## 安装与使用

### 安装

1. 安装所需的软件: nodejs, mpv, [libaosd(aosd_cat)](https://github.com/mkoskar/libaosd-xinerama)
2. 安装本弹幕助手: `sudo npm install -g bilicom`

### 使用

安装完成后运行`bilicom <直播间id>`

命令行参数：

* `-c`或`--cookie` <string> : 设置cookie
* `-C`或`--cookie-file` <filename> : 设置cookie文件名(默认`cookie`)
* `-l`或`--log` : 保存弹幕
* `-d`或`--dir` <dirname> : 设置弹幕保存目录

快捷键|	效果
-----|	---------------
q	|	退出程序 
m	|	打开播放器看直播
p	|	调整弹幕提示位置
+/-	|	增加减小提示字体
t	|	是否显示弹幕时间
u	|	是否显示弹幕发送者
w	|	是否显示欢迎信息
n	|	是否显示弹幕提示
回车|   *发送弹幕*
D	|	（发送测试弹幕）

### 发送弹幕

1. 首先需要导出登录cookie
    1. 在chrome中登录B站后
    2. 打开开发者工具
    3. 输入`document.cookie`
    4. 拷贝返回的字符串（含引号）
2. 使用`bilicom <直播间号> -c <字符串>`运行程序
3. 输入cookie保存密码
4. 回车键进入弹幕发送模式
5. 回车发送弹幕（空弹幕不会发送）
6. 之后可以直接使用`bilicom <直播间号>`运行程序发弹幕
7. **如果修改了cookie-file名字需要使用-C <filename>指定文件**

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

