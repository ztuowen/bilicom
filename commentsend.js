/**
 * Using cookie to send comments to Bilibili
 **/

var crypto = require('crypto-js');
var fs = require('fs');
var read = require('read');
var NodeRSA = require('node-rsa');
var child_process = require("child_process");
var os = require("os");

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
                read({prompt:'设置cookie保存文件的密码? ',silent:true,replace:'*',terminal:true}, function (err,passwd) {
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
            
            read({prompt:'请输入cookie保存文件的密码? ',silent:true,replace:'*',terminal:true}, function (err,passwd) {
                fs.readFile(fname,function (err,data) {
                    var dec = crypto.AES.decrypt(data.toString(),passwd);
                    cookie = dec.toString(crypto.enc.Utf8);
                    callback();
                });
            });

        },
        // Send messages to bilibili comments server
        send: function(msg,errcbk){
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
            }},function(err,response,data)
            {
                if (err)
                    errcbk("网络连接出错");
                else
                {
                    data = JSON.parse(data);
                    if (data.code)
                        errcbk(data.msg);
                }
            }).form(form);
        }
    }
};

var baseurl = 'https://passport.bilibili.com';
const captname = os.tmpdir()+"/captcha.png";

exports.login = function (){
    var request = require('request').defaults({jar: true});
    var cookiejar = request.jar();
    var rnd=Math.round((new Date).getTime()/1000);
    var loggedin =false;
    return {
        login: function (uname,passwd,callback,picexec){
            var captcha;
            var fts;
            var picexec = picexec || "gpicview";
            getCaptcha();
            function getCaptcha(){
                request({url:baseurl+"/captcha",
                    jar:cookiejar,
                    headers: {
                        Referer: 'https://passport.bilibili.com/ajax/miniLogin/minilogin'
                    }},getLoginKey).pipe(fs.createWriteStream(captname));
            }
            function getLoginKey(err,response,body) {
                if (!uname)
                    read({prompt:'用户名? ',terminal:true}, function (err,answer) {
                        uname = answer;
                        readPasswd();
                    });
                else
                    readPasswd();
                function readPasswd() {
                    if (!passwd)
                        read({prompt:'密码? ',silent:true,replace:'*',terminal:true},function (err,answer) {
                            passwd = answer;
                            readCaptcha();
                        });
                    else
                        readCaptcha();
                }
                function readCaptcha() {
                    var captview = child_process.spawn(picexec,[captname]);

                    captview.on('error',function(){
                        console.log("使用"+picexec+"打开验证码失败，请手动打开"+captname+"查看");
                    });
                    read({prompt:'验证码? ',terminal:true},function (err,answer) {
                        try{
                            captview.kill();
                        }catch(e){}
                        fs.unlink(captname);

                        captcha = answer;
                        
                        request({method:'GET',
                            url:baseurl+"/login?act=getkey&_="+(new Date).getTime(),
                            gzip: true,
                            jar:cookiejar,
                            headers: {
                                Referer: 'https://passport.bilibili.com/ajax/miniLogin/minilogin'
                            }
                        },encodeLoginInfo);
                    });
                }
            }
            function encodeLoginInfo(err,response,body){
                if (err==null)
                {
                    body=JSON.parse(body);
                    var key = new NodeRSA(body.key);
                    key.setOptions({encryptionScheme:'pkcs1'});
                    var enpasswd = key.encrypt(body.hash+passwd,'base64','utf8');
                    var form = {userid:uname,pwd:enpasswd,captcha:captcha,keep:1};
                    request.post({
                            url:baseurl+"/ajax/miniLogin/login",
                            gzip: true,
                            jar: cookiejar,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
                                Host: 'passport.bilibili.com',
                                Origin: 'https://passport.bilibili.com',
                                Referer: 'https://passport.bilibili.com/ajax/miniLogin/minilogin'
                            },
                        },checkLoginRet).form(form);
                }
            }
            function checkLoginRet(err,response,body) {
                body = JSON.parse(body);
                if (!body.status)
                {
                    console.log("登录失败!");
                    if (body.message.code==-105)
                        console.log("要输验证码咯～");
                    getCaptcha(); 
                }   
                else
                {
                    loggedin =true;
                    callback(cookiejar.getCookieString('http://www.bilibili.com'));
                }
            }
        },
    };
}
