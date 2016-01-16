exports.comsend = function (){
    var cookie = "";
    var request = require('request').defaults({jar: true});
    var rnd;
    var rid;
    return {
        init: function(ck,roomid){
            cookie = ck;
            rid = roomid;
            rnd=Math.round((new Date).getTime()/1000);
        },
        send: function(msg){
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
            }}).form(form);
        }
    }
};
