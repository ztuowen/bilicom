#bili-comment Bilibili 直播弹幕助手

* 下载和开发文档: [API Documentation](http://bili.micblo.com/)
* 快速配置工具: [Config](http://bili.micblo.com/#config/tool)

`Bilibili 直播弹幕助手` 是一个帮助播主快速查看直播弹幕的工具。

有几个功能：

1. 同步连接bilibili弹幕服务器
2. 可以储存弹幕信息

##安装与使用

###安装

> 需要安装: Node.js (开发环境 : v0.10.31)

> 需要 `npm install --registry=http://r.cnpmjs.org` 初始化必要的 `node_modules`

###使用

####配置

第一次使用需要配置助手。

* 快速配置工具: [Config](http://bili.micblo.com/#config/tool)

将生成的 `config.js` 覆盖助手根目录下的同名文件。

####使用

使用记事本，将以下代码复制并粘贴到记事本，保存为 `run.cmd` (注意:格式必须为 `.cmd` , `.txt`不行)。

```
node bili-comment.js
pause
```

以后只需要双击运行 `run.cmd` 就可以了。
