# bilicom Bilibili 直播弹幕助手

***DISCLAIMER this is a fork of the [original project](https://coding.net/u/payne/p/bili-comment/git) by payne***

`Bilibili 直播弹幕助手` 是一个帮助播主快速查看直播弹幕以及摆脱Flash观看B站直播的软件。

有几个功能：

* 同步连接B站弹幕服务器
* 断线重连
* 弹幕通过aosd在屏幕上显示
* 保存弹幕
* 发送弹幕(使用cookie或者登录)
* 保存密码加密后的cookie-file，不用重复登录/使用cookie
* 观看B站直播视频流

## 安装与使用

### 安装

1. 安装所需的软件: nodejs, mpv, [libaosd(aosd_cat)](https://github.com/mkoskar/libaosd-xinerama)
  * mpv - 观看直播视频
  * libaosd - 屏幕上显示弹幕
2. 安装本弹幕助手: `sudo npm install -g bilicom`

[***如何安装libaosd***](https://github.com/ztuowen/bilicom/issues/2)

### 使用

安装完成后运行`bilicom <直播间id>`

命令行参数：

* `-c`或`--cookie` \<string\> : 设置cookie
* `-C`或`--cookie-file` \<filename\> : 设置cookie文件名
* `-l`或`--log` : 保存弹幕
* `-d`或`--dir` \<dirname\> : 设置弹幕保存目录
* `-L`或`--login` : 登录B站
* `-p`或`--picexec` \<program name\> : 查看验证码的程序（\<program name\> \<filename\>可以看图片的那种）

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

***使用Cookie发弹幕***

1. 首先需要导出登录cookie
    1. 在chrome中登录B站后
    2. 打开开发者工具
    3. 输入`document.cookie`
    4. 拷贝返回的字符串（含引号）
2. 使用`bilicom <直播间号> -c <字符串>`运行程序
4. 回车键进入弹幕发送模式
5. 回车发送弹幕（空弹幕不会发送）

***B站登录发弹幕***

1. 使用`bilicom <直播间号> -L`运行程序
2. 输入用户名和密码
3. 验证码有的时候可以不用输（少年，赌一把吧～）
4. 登录成功？发弹幕吧

***Cookie file***

1. **`-C <filename>`指定文件，即可保存cookie(会询问加密密码)**
2. 使用时需指定`-C <filename>` 指定cookie-file
3. 解密后就可以发弹幕了

## 没图说个XX

### 弹幕机界面

![image](https://cloud.githubusercontent.com/assets/6838440/12380470/09ffb494-bd31-11e5-8d4d-78a9624799aa.png)

### 多个弹幕的叠加效果

![image](https://cloud.githubusercontent.com/assets/6838440/12380496/7a9eaaca-bd31-11e5-96e8-85a128e11a93.png)

### 使用弹幕机观看直播

![image](https://cloud.githubusercontent.com/assets/6838440/12380533/50ecedc6-bd32-11e5-8982-a329838650b6.png)
