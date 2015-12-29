var fs = require('fs');
var colors = require('colors');
var libnotify = require('libnotify');

var CommentClient = require('./commentclient.js').Client;
var Bili_live = require('./bili-live.js');
var config = require('./config.js').config;
var roomconfig = require('./config.js').liveroom;
var child_process = require('child_process');

var nowclient, fileWriteStream;

//配置弹幕保存
var wOption = {
    flags: 'a',
    encoding: null,
    mode: '0666'
};

//请勿移除这个 log thanks
console.log('☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆\n\n欢迎使用 Bili直播弹幕助手 !\n本助手意在帮助播主快速查看直播弹幕\n关于助手的配置信息请看config.js(使用记事本即可修改配置)\n如果您想快速配置,请访问 http://bili.micblo.com/#config/tool 快速生成\n如果存在Bug或者要提一些建议,欢迎百度私信@payne工作室\n想知道更多用法? 请上服务站点:http://bili.micblo.com\n\n☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆')

if(isblank(roomconfig.url) && isblank(roomconfig.roomid)) return console.log("未配置直播室信息.\n请看config.js\n\n如果您想快速配置,请访问 " + "http://bili.micblo.com/#config/tool".bold.cyan +" 快速生成");

console.log("==========配置信息==========");
console.log("是否显示弹幕发射时间\t: ",config.showTime?"√":"×");
console.log("是否显示弹幕发送者\t: ",config.showUserName?"√":"×");
console.log("是否显示直播间人数\t: ",config.showWatcherNum?"√":"×");
console.log("是否显示欢迎信息\t: ",config.showWelcome?"√":"×");
console.log("是否断线重连      \t: ",config.reconnect?"√":"×");
console.log("是否保存弹幕数据\t: ",config.save?"√":"×");
console.log("是否启动播放器\t: ",config.mpv?"√":"×");
console.log("============================");

if (process.argv.length>2)
    roomconfig.roomid=process.argv[2];

var liveid = roomconfig.roomid ? roomconfig.roomid : parseLiveUrl(roomconfig.url);

Bili_live.getLiveUrls(liveid, function(err,url){
    if (err==null) { 
        console.log(url);
        child_process.execFile('mpv',[url],{},null);
    }
});

/**
 * Init Chat Client
 */
(function(chat_id){
    console.log(("=========直播间信息=========\nchat_id : " + chat_id.toString() + "\n============================").cyan);

    nowclient=connectCommentServer(chat_id);
    if(config.save) {
        var targetPath='./comments';
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }
        fileWriteStream=fs.createWriteStream(targetPath+'/'+chat_id+'_'+new Date().getTime()+'.source',wOption);
        var chat_room_info = {chat_id: chat_id};
        fileWriteStream.write(new Buffer(JSON.stringify(chat_room_info)));
        fileWriteStream.write(new Buffer([0x00,0x00]));
    }
}(liveid));

/**
 * 连接弹幕服务器
 * @param cid
 * @returns {*|Client}
 */
function connectCommentServer(cid){
    var server= new CommentClient();

    server.on('server_error', function(error) {
        console.log(("服务器发生错误:" + error).red);
    });
    server.on('close', function() {
        console.log("连接已中断".red);
        if(config.reconnect) nowclient=nowclient.connect(cid);
    });
    server.on('error', function(error) {
        console.log(("发生错误:" + error).red);
    });
    server.on('login_success', function(num) {
        if(config.showWatcherNum) console.log(("[系统] 在线人数 " + num.toString()).bold.yellow);
        if(fileWriteStream){
            fileWriteStream.write(new Buffer(JSON.stringify({action:"watcherNum",num:num})));
            fileWriteStream.write(new Buffer([0x00]));
        }
    });
    server.on('newCommentString', function(data) {
        //server bili-live: playtime(stime) mode fontsize color timestamp(date) rnd pool bili-userID bili-danmuID message
        //xml: stime mode fontsize color date pool? bili-userID bili-danmuID

        data = JSON.parse(data);

        //data = eval("(" + data + ")");
        //普通视频 length==2 ; live length==3
        if(!data && !data.roomid) {
            console.log(JSON.stringify(data,null,2));
            return console.log("[弹幕] ".bold.green + "异常数据".red);
        }

        if(!data.info)
        {
            switch (data.cmd) {
                case "SEND_GIFT":
                    data=data.data;
                    var text='';
                    var date = data.timestamp;
                    date = DateFormat(date, 'hh:mm:ss');//yyyy-MM-dd
                    if(config.showTime) text += ('[' + date + '] ').toString().yellow;
                    var username = selectColorText(data.uname,data.uid).bold;
                    text += username + " " + colors.yellow(data.action).bold + " " + colors.red(data.giftName + "x" + data.num).bold;
                    console.log("[系统] ".bold.yellow + text);
                    if (config.notify)
                    {
                        text = "[系统] " + data.uname + " " + data.action + " " + data.giftName + "x" + data.num;
                        libnotify.notify(text);
                        libnotify.notify(text);
                    }
                    break;
                case "WELCOME":
                    if (config.showWelcome){
                        data=data.data;
                        var text='';
                        var username = selectColorText(data.uname,data.uid).bold;
                        text += colors.yellow("欢迎老爷") + " " + colors.red(data.uname) + " " + colors.yellow("进入直播间");
                        console.log("[系统] ".bold.yellow + text);
                        if (config.notify)
                        {
                            text = "[系统] " + "欢迎老爷" + data.uname + "进入直播间";
                            libnotify.notify(text);
                        }
                    }
                    break;
                default:
                    console.log(JSON.stringify(data,null,2));
                    console.log("[弹幕] ".bold.green + "空弹幕".red);
            }
            return;
        }

        data = data.info;//ignore other arguments

        //获取时间
        var date = data[0][4];
        var msg = data[1];
        date = DateFormat(date, 'hh:mm:ss');//yyyy-MM-dd

        //获取发布者名称
        var username = '';
        if(data.length == 6){
            username = selectColorText(data[2][1],data[2][0]).bold + " ";
        }
        if(data[3].length>0) {
            username = colors.blue("(" + data[3][1] + ")") + username;
        }

        var text='';
        if(config.showTime) text += ('[' + date + '] ').toString().yellow;
        if(config.showUserName) text += username;

        text += replaceES(msg).bold;
        text = "[弹幕] ".bold.green + text;
        console.log(text);
        if (config.notify)
        {
            text='';
            username = '';
            if(data.length == 6){
                username = data[2][1] + " ";
            }
            if(data[3].length>0) {
                username = "(" + data[3][1] + ")" + username;
            }
            if(config.showUserName) text += username;
            text += msg;
            text = "[弹幕] " + text;

            libnotify.notify(text);
        }

        //save Danmu Info
        if(fileWriteStream){
            fileWriteStream.write(new Buffer(JSON.stringify(data)));
            fileWriteStream.write(new Buffer([0x00]));
        }
    });
    server.on('newScrollMessage', function(data) {
        //json {text:"",highlight:?,bgcolor:?,flash:?,tooltip:?}
        console.log("新滚动信息:" + eval("("+data+")").text);
    });

    server.on('unknown_bag', function(data) {
        console.log(("异常数据:" + data).toString().red);
    });
    server.connect(cid);
    return server;

    function randomColorText(text){
        var _colors = ['yellow', 'red', 'green', 'cyan', 'magenta'];
        return colors[_colors[Math.ceil(Math.random() * _colors.length - 1)]](text);
    }
    
    function selectColorText(text,id){
        var _colors = ['yellow', 'red', 'green', 'cyan', 'magenta'];
        return colors[_colors[id % _colors.length]](text);
    }
}

/*
 UTIL
 */
function parseLiveUrl(url){
    var liveid = (url + "/").match(/live.bilibili.com\/(.*?)\//);
    return liveid[1];
}

function isblank(text){
    return(!text || text=='');
}
function replaceES(text){
    return html_decode(text);
}
function html_decode(str)
{
    var s;
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br>/g, "\n");
    return s;
}
function DateFormat(time,fmt) {
    time=new Date(time * 1000);
    var o = {
        "M+": time.getMonth() + 1, //月份
        "d+": time.getDate(), //日
        "h+": time.getHours(), //小时
        "m+": time.getMinutes(), //分
        "s+": time.getSeconds(), //秒
        "q+": Math.floor((time.getMonth() + 3) / 3), //季度
        "S": time.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
