var fs = require('fs');

var CommentServer = require('./commentserver.js').Server;
var Bili_live = require('./bili-live.js');
var config = require('./config.js').config;
var roomconfig = require('./config.js').liveroom;

var nowserver,fileWriteStream;

var wOption = {
    flags: 'a',
    encoding: null,
    mode: 0666
}

//请勿移除这个 log thanks
console.log('☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆\n\n欢迎使用 Bili直播弹幕助手 !\n本助手意在帮助播主快速查看直播弹幕\n关于助手的配置信息请看config.js(使用记事本即可修改配置)\n如果您想快速配置,请访问 http://bili.micblo.com/#config_builder 快速生成\n如果存在Bug或者要提一些建议,欢迎百度私信@payne工作室\n想知道更多用法? 请上服务站点:http://bili.micblo.com\n\n☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆')

if(isblank(roomconfig.url)&&isblank(roomconfig.roomid)) return console.log("未配置直播室信息.\n请看config.js\n\n如果您想快速配置,请访问 http://bili.micblo.com/#config_builder 快速生成");

console.log("==========配置信息==========");
console.log("是否显示弹幕发射时间\t: ",config.showTime?"√":"×");
console.log("是否显示弹幕发送者\t: ",config.showUserName?"√":"×");
console.log("是否显示直播间人数\t: ",config.showWatcherNum?"√":"×");
console.log("是否断线重连      \t: ",config.reconnect?"√":"×");
console.log("是否保存弹幕数据\t: ",config.save?"√":"×");
console.log("============================");

var liveid = roomconfig.roomid?roomconfig.roomid:parseLiveUrl(roomconfig.url);

Bili_live.getLivePageInfo(liveid,function(err,info){
    if(err) return console.log(err);
    if(info.state=='LIVE'){
        Bili_live.getLiveInfo(liveid,function(err,info){
            if(info.code==0){
                for(var key in info.list){
                    //status: PREPARE LIVE END
                    if(info.list[key].sch_id){
                        console.log("=========直播间信息=========");
                        console.log("节目名称 : "+info.list[key].title);
                        console.log("开始时间 : "+info.list[key].start_at);
                        console.log("aid : "+info.list[key].aid);
                        console.log("cid : "+info.list[key].cid);
                        console.log("============================");
                        if(info.list[key].cid){
                            nowserver=connectCommentServer(info.list[key].cid);
                            if(config.save) {
                                var targetPath='./comments';
                                if (!fs.existsSync(targetPath)) {
                                    fs.mkdirSync(targetPath);
                                }
                                fileWriteStream=fs.createWriteStream(targetPath+'/'+info.list[key].cid+'_'+new Date().getTime()+'.source',wOption);
                                info.list[key].timestamp=new Date().getTime();
                                fileWriteStream.write(new Buffer(JSON.stringify(info.list[key])));
                                fileWriteStream.write(new Buffer([0x00,0x00]));
                            }
                            return;
                        }else{
                            return console.log("无弹幕房间可以进入");
                        }
                    }
                }
                console.log("无正在直播的节目\n\n如果存在直播节目,请重开再试.");
            }else{
                console.log("无法获取直播间信息\n\n请重开再试");
            }
        })
    }else{
        console.log("无正在直播的节目\n\n如果存在直播节目,请重开再试.");
    }
});

function connectCommentServer(cid){
    var server= new CommentServer();
    //console.log("目标房间 cid="+cid);
    server.on('server_error', function(error) {
        console.log("服务器发生错误:"+error);
    })
    server.on('close', function() {
        console.log("连接已中断");
        if(config.reconnect) nowserver=nowserver.connect(cid);
    })
    server.on('error', function(error) {
        console.log("发生错误:"+error);
    })
    server.on('login_success', function(num) {
        if(config.showWatcherNum) console.log("#在线人数: "+num);
        if(fileWriteStream){
            fileWriteStream.write(new Buffer(JSON.stringify({action:"watcherNum",num:num})));
            fileWriteStream.write(new Buffer([0x00]));
        }
    })
    server.on('newCommentString', function(data) {
        //server bili-live: playtime(stime) mode fontsize color timestamp(date) rnd pool bili-userID bili-danmuID message
        //xml: stime mode fontsize color date pool? bili-userID bili-danmuID
        //data=JSON.parse(data);//存在 ' 的BUG
        data=eval("("+data+")");
        //普通视频 length==2 ; live length==3
        if(data.length!=2 && data.length!=3) return ;//console.log("新弹幕[未格式化]:"+data);//当作异常数据
        data[0]=data[0].split(',');
        var date=data[0][4];
        var msg=data[1];
        date=DateFormat(date,'hh:mm:ss');//yyyy-MM-dd
        var username='';
        if(data.length==3){
            username=data[2][1]+" : ";
        }
        var text='';
        if(config.showTime) text+='['+date+'] ';
        if(config.showUserName) text+=username;
        text+=replaceES(msg);
        console.log(text);
        //save
        if(fileWriteStream){
            fileWriteStream.write(new Buffer(JSON.stringify(data)));
            fileWriteStream.write(new Buffer([0x00]));
        }
    })
    server.on('newScrollMessage', function(data) {
        //json {text:"",highlight:?,bgcolor:?,flash:?,tooltip:?}
        console.log("新滚动信息:"+eval("("+data+")").text);
    })
    server.on('unknown_bag', function(data) {
        console.log("异常数据:"+data);
    })
    server.connect(cid);
    return server;
}

function parseLiveUrl(url){
    var liveid = url.match(/live.bilibili.com\/live\/(.*?)\.html/);
    return liveid[1];
}

function isblank(text){
    return(!text || text=='');
}
function replaceES(text){
    text=text.replace(/\&lt\;/g,"<");
    text=text.replace(/\&gt\;/g,">");
    text=text.replace(/\&amp\;/g,"&");
    return text;
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
