var request = require('request');
var xmlreader = require('xmlreader');

var lang={
    a1: ' is empty',
    b1: 'failed to connect to server'
    };

exports.getRoomID = function(liveid,callback){
    
    var options = {
        url: 'http://live.bilibili.com/'+liveid,
        gzip: true
    };
    function rcallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var tmp,roomid;
            tmp = body.match(/ROOMID \= (.*?)\;/);
            if(tmp&&tmp.length>=2) roomid = tmp[1];
            return callback(roomid);
        }else
            callback(liveid);
    }
    request(options, rcallback);
};

exports.getLiveInfo = function(liveid,callback){
    if(!liveid) return callback("liveid"+lang.a1);

    var options = {
        url: 'http://live.bilibili.com/ajax/schedule/'+liveid,
        gzip: true
    };

    function rcallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            return callback(null, info);
        }else{
            return callback(lang.b1);
        }
    }
    request(options, rcallback);
};

exports.getPlayerInfo = function(cid,cookies,callback){
    if(!cid) return callback("cid"+lang.a1);

    var options = {
        url: 'http://interface.bilibili.com/player?id=cid:'+cid,
        header:{
            Cookie:cookies?cookies:""
        },
        gzip: true
    };

    function rcallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            xmlreader.read('<data>'+body+'</data>', function (err, res){
                if(err) return callback(err);
                return callback(null,res.data);
            });
        }else{
            return callback(lang.b1);
        }
    }
    request(options, rcallback);
};

exports.getLiveUrls = function(liveid,callback){
    if(!liveid) return callback("liveid"+lang.a1);

    var options = {
        url: 'http://live.bilibili.com/api/playurl?cid='+liveid,
        gzip: true
    };

    function rcallback(error, response, body) { 
        if (!error && response.statusCode ==200) {
            xmlreader.read(body, function (err,res) {
                if (err) return callback(err);
                return callback(null,res.video.durl.b1url.text());
            });
        } else {
            return callback(lang.b1);
        }
    }
    request(options,rcallback);
}
