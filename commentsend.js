var crypto = require('crypto-js');
var readline = require('readline');
var fs = require('fs');

exports.comsend = function (){
    var cookie = "";
    var request = require('request').defaults({jar: true});
    var rnd;
    var rid;
    return {
        initUnenc: function(fname,ck,roomid,callback){
            cookie = ck;
            rid = roomid;
            if (fname)
            {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.question('Passwd for the Cookie store? ', (passwd) => {
                    rl.close();
                    var enc=crypto.AES.encrypt(ck,passwd).toString();
                    fs.writeFile(fname,enc);
                });
            }
            callback();
        },
        init: function(fname,roomid,callback){
            rid = roomid;
            rnd=Math.round((new Date).getTime()/1000);
            
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Passwd for the Cookie store? ', (passwd) => {
                rl.close();
                fs.readFile(fname,(err,data) =>{
                    var dec = crypto.AES.decrypt(data.toString(),passwd);
                    cookie = dec.toString(crypto.enc.Utf8);
                    callback();
                });
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
            }}).form(form);
        }
    }
};
