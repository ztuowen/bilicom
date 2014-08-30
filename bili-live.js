var request = require('request');
var xmlreader = require('xmlreader');

var lang={
    a1: ' is empty',
    b1: 'failed to connect to server'
    };

exports.getLivePageInfo = function(liveid,callback){
    if(!liveid) return callback("liveid"+lang.a1);

    var options = {
        url: 'http://live.bilibili.com/live/'+liveid+'.html',
        gzip: true
    };
    function rcallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var tmp,sch_id,meta_id,state;
            tmp = body.match(/sch_id \= (.*?)\;/);
            if(tmp&&tmp.length>=2) sch_id = tmp[1];
            tmp = body.match(/meta_id \= (.*?)\;/);
            if(tmp&&tmp.length>=2) meta_id = tmp[1];
            tmp = body.match(/state\: \'(.*?)\'/);
            if(tmp&&tmp.length>=2) state = tmp[1];
            return callback(null,{
                sch_id:sch_id,
                meta_id:meta_id,
                state:state
            });
        }else{
            return callback(lang.b1);
        }
    }
    request(options, rcallback);
};

exports.getLiveInfo = function(liveid,callback){
    if(!liveid) return callback("liveid"+lang.a1);

    var options = {
        url: 'http://live.bilibili.com/sch_list/'+liveid+'.json',
        gzip: true
    };

    function rcallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            return callback(null,info);
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