/** 必要的node.js库**/
var net = require('net');
var events = require('events'),
    util = require('util');
//init

function Client(base) {
    var self = this;
    events.EventEmitter.call(this);
    this.base = base;
    this.state = 0; //0 未连接 1 待命 2 数据接收未完成
    this.timer;
    this.client = new net.Socket();
    this.client.setEncoding('binary');
    this.client.on('data', function(data) {
        var result, bdata = new Buffer(data, "binary");
        if(bdata.length>=1){
            if(self.state == 1) { //可以开始接收数据了
                var parser_length=bdata.readUInt32BE(0);

                this.buffer_data = new Buffer(0);
                this.buffer_length=parser_length;
            }
            this.buffer_data=Buffer.concat([this.buffer_data,bdata]);
            if(this.buffer_length >= this.buffer_data.length){ //接收完毕
                self.state = 1;
                if(this.buffer_length == this.buffer_data.length){
                    self.deliverData(this.buffer_data);
                }else{
                    self.emit('unknown_bag', this.buffer_data);
                }
                return;
            }
            //未接收完毕的继续
        }
    });
    this.client.on('error', function(error) {
        self.state = 1;
        clearTimeout(this.timer);
        self.timer=null;
        console.log('server_error'+error);
        self.emit('server_error', error);
    });
    this.client.on('close', function() {
        self.state = 0;
        clearTimeout(self.timer);
        self.timer=null;
        console.log('close');
        self.emit('close');
    });
}
util.inherits(Client, events.EventEmitter);

/**
 * Connect to Chat Server
 * @param chatid
 * @param userid
 * @param pwd
 */
Client.prototype.connect = function(chatid, userid) {
    var self = this;
    if (this.state != 0) return;
    this.client.connect(self.base.port, self.base.host, function(err) {
        if (err)
            console.log(err);
        if(!userid) userid=Math.floor(1e14+Math.random()*2e14);
        var packetModel = {roomid: chatid, uid:userid};
        var data=pack_data(7,JSON.stringify(packetModel));
        self.send(data);
        self.state = 1;
    });
};
/**
 * Directly Send Message to Chat Server
 * @param data
 * @returns {boolean}
 */
Client.prototype.send = function(data) {
    if(this.client.write(data)){
        this.state = 1;
        return true;
    }else{
        return false;
    }
};
/**
 * Disconnect
 */
Client.prototype.disconnect = function() {
    this.client.destory();
};
/**
 *
 * @param data
 * @returns {*}
 */
Client.prototype.deliverData = function (data){
    var self = this;
    if(data.length < 2) return this.emit('error', '意外的数据包');

    var index = data.readUInt32BE(8);

    switch(index){
        case 3:
            this.emit('login_success', data.readUInt32BE(16));
            break;
        case 8:
            if(!this.timer){
                this.timer=setInterval(function() {
                    var data = pack_data(2,"");
                    self.send(data);
                }, 2*1000);
            }
            break;
        case 5:
            var jsonData = data.slice(16);
            this.emit('newCommentString', jsonData.toString('utf8'));
            break;
        case 6:
            var jsonData = data.slice(16);
            this.emit('newScrollMessage', jsonData.toString('utf8'));
            break;
        case 17:
            break;
    }

};

function pack_data(action, payload) {
    return pack_data_more(16,1,action,1,payload);
}

function pack_data_more(magic, ver, action, param, body) {
    var bufferdata = new Buffer(16+body.length);
    bufferdata.writeUInt32BE(16+body.length, 0);
    bufferdata.writeUInt16BE(magic, 4);
    bufferdata.writeUInt16BE(ver, 6);
    bufferdata.writeUInt32BE(action, 8);
    bufferdata.writeUInt32BE(param, 12);
    bufferdata.write(body, 16);
    return bufferdata;
}

exports.Client = Client;

//cli = new Client({host: 'livecmt-2.bilibili.com', port: 788});
//cli.connect(53714);

//(function trap(){
//    setTimeout(trap,3000);
//})();
