var cookie_header = "fts=1452910999; pgv_pvi=7109999616; pgv_si=s376598528; sid=c6ocdx3j; DedeUserID=7759800; DedeUserID__ckMd5=219eacb7777f1dea; SESSDATA=64aadab2%2C1455514723%2Cde209ca2; LIVE_LOGIN_DATA=7e1b61ecbfce7132a9494db04a5281342654bb60; LIVE_LOGIN_DATA__ckMd5=fa76ffc8cd3363af; user_face=http%3A%2F%2Fi0.hdslb.com%2Faccount%2Fface%2F7759800%2F37aa37ad%2Fmyface.png; _cnt_dyn=null; _cnt_pm=0; _cnt_notify=30; uTZ=420; NotFirst=1; CNZZDATA2724999=cnzz_eid%3D383645281-1452910997-%26ntime%3D1452926799; LIVE_BUVID=13d25106285e72eb427b485822f6fb4b; LIVE_BUVID__ckMd5=effe853762e7ec9f; attentionData=%7B%22code%22%3A0%2C%22msg%22%3A%22%22%2C%22data%22%3A%7B%22count%22%3A2%2C%22hb%22%3A%22702114_1998535%22%2C%22open%22%3A1%2C%22has_new%22%3A0%7D%7D";

var comsend = function (){
    var cookie = "";
    var request = require('request').defaults({jar: true});
    var rnd;
    var rid;
    return {
        init: function(ck,roomid){
            cookie = ck;
            rid = roomid;
            request({url:'http://live.bilibili.com/'+rid,
            'Cookie':cookie},function (err,response,body){
                rnd=new Date(response.headers.date).getTime()/1000;
                console.log(rnd);
            });
        },
        send: function(msg){
            while (!rnd);
            var form={color:16777215,
            fontsize:25,
            mode:1,
            msg:msg,
            rnd:rnd,
            roomid:rid};
            request.post({url:'http://live.bilibili.com/msg/send',
            headers:{
                cookie:cookie,
                Host: 'live.bilibili.com',
                Origin: 'http://live.bilibili.com',
                Referer: 'http://live.bilibili.com/',
            }},function (err,res,body){
                console.log(res);
            }).form(form);
        }
    }
};

var a = comsend();
a.init(cookie_header,5269);
setTimeout(function() {
    a.send("23333");
}, 3000);
