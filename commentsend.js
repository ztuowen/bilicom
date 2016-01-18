/**
 * Using cookie to send comments to Bilibili
 **/

var crypto = require('crypto-js');
var readline = require('readline');
var fs = require('fs');

// TODO needs a better way of defining a class than using closure
exports.comsend = function (){
    var cookie = "";
    var request = require('request').defaults({jar: true});
    var rnd;
    var rid;
    return {
        // Init with non-encrypted cookie
        // Will encrypt&store cookie to cookie-file if fname is given
        initUnenc: function(fname,ck,roomid,callback){
            rnd=Math.round((new Date).getTime()/1000);
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
                    callback();
                });
            }
            else
                callback();
        },
        // Init with a cookie file
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
        // Send messages to bilibili comments server
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
