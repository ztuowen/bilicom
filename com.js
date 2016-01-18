//var jsencrypt = require('./jsencrypt/bin/jsencrypt');

var ursa = require('ursa');
var fs = require('fs');
var readline = require('readline');
var tough = require('tough-cookie');

var baseurl = 'https://account.bilibili.com';

var comsend = function (){
    var request = require('request').defaults({jar: true});
    var cookiejar = request.jar();
    var rnd=Math.round((new Date).getTime()/1000);
    var loggedin =false;
    return {
        login: function (uname,passwd,callback){
            var captcha;
            var fts;
            getCaptcha();
            function getCaptcha(){
                request({url:baseurl+"/captcha",
                    jar:cookiejar,
                    headers: {
                        Referer: 'https://account.bilibili.com/ajax/miniLogin/minilogin'
                    }},getLoginKey).pipe(fs.createWriteStream('/tmp/captcha.png'));
            }
            function getLoginKey(err,response,body) {
                const rl = readline.createInterface({
                      input: process.stdin,
                        output: process.stdout
                });
                if (!uname)
                    rl.question('username? ', (answer) => {
                        uname = answer;
                        readPasswd();
                    });
                else
                    readPasswd();
                function readPasswd() {
                    if (!passwd)
                        rl.question('passwd? ', (answer) => {
                            passwd = answer;
                            readCaptcha();
                        });
                    else
                        readCaptcha();
                }
                function readCaptcha() {
                    rl.question('Type the captcha? ', (answer) => {
                        captcha = answer;
                        rl.close();
                        
                        request({method:'GET',
                            url:baseurl+"/login?act=getkey&_="+(new Date).getTime(),
                            gzip: true,
                            jar:cookiejar,
                            headers: {
                                Referer: 'https://account.bilibili.com/ajax/miniLogin/minilogin'
                            }
                        },encodeLoginInfo);
                    });
                }
            }
            function encodeLoginInfo(err,response,body){
                if (err==null)
                {
                    body=JSON.parse(body);
                    var crt = ursa.createPublicKey(body.key);
                    var enpasswd = crt.encrypt(body.hash+passwd,'utf8','base64',ursa.RSA_PKCS1_PADDING);
                    var form = {userid:uname,pwd:enpasswd,captcha:captcha,keep:1};
                    request.post({
                            url:baseurl+"/ajax/miniLogin/login",
                            gzip: true,
                            jar: cookiejar,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
                                Host: 'account.bilibili.com',
                                Origin: 'https://account.bilibili.com',
                                Referer: 'https://account.bilibili.com/ajax/miniLogin/minilogin'
                            },
                        },checkLoginRet).form(form);
                }
            }
            function checkLoginRet(err,response,body) {
                body = JSON.parse(body);
                if (!body.status && body.message.code==-105)
                {
                    console.log("login failed, fuck the captcha");
                    getCaptcha(); 
                }   
                else
                {
                    loggedin =true;
                    callback();
                }
            }
        },
        send:send     
    };
    function send(roomid,msg){
            var form={color:16777215,
                fontsize:25,
                mode:1,
                msg:msg,
                rnd:rnd,
                roomid:roomid};
            request.post({url:'http://live.bilibili.com/msg/send',
                jar:cookiejar,
                headers:{
                    Host: 'live.bilibili.com',
                    Origin: 'http://live.bilibili.com',
                    Referer: 'http://live.bilibili.com/',
                }}).form(form);
        }
}

var a = comsend();
a.login(null,null,function(){a.send(53714,"good");});
