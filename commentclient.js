/** 必要的node.js库**/
var net = require('net');
var events = require('events'),
    util = require('util');
//init

function Client(base) {
    var self = this;
    events.EventEmitter.call(this);
    this.base = base;
    if(!this.base) this.base={host:"chat.bilibili.com",port:88};
    this.state = 0; //0 未连接 1 待命 2 数据接收未完成
    this.buffer_data; //缓冲区的数据
    this.buffer_length; //缓冲区的总大小
    this.timer;
    this.client = new net.Socket();
    this.client.setEncoding('binary');
    this.client.on('data', function(data) {
        var result,bdata=new Buffer(data,"binary");
        if(bdata.length>=1){
            if(self.state == 1) { //可以开始接收数据了
                var parser_index=bdata.readUInt16BE(0);
                var parser_length=getBDataLength(parser_index);

                if(parser_length==-1){
                    //未知状况
                    /**self.state == 2;
                    this.buffer_data=bdata;
                    this.buffer_length=parser_length;**/
                    return;
                }else if(parser_length==0){
                    parser_length=bdata.readUInt16BE(2);
                }
                this.buffer_data=new Buffer(0);
                this.buffer_length=parser_length;
            }
            this.buffer_data=Buffer.concat([this.buffer_data,bdata]);
            if(this.buffer_length>=this.buffer_data.length){ //接收完毕
                self.state = 1;
                if(this.buffer_length==this.buffer_data.length){
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
        var self = this;
        self.state = 1;
        //self.client.destory();
        clearTimeout(self.timer);
        self.timer=null;
        self.emit('server_error', error);
    });
    this.client.on('close', function() {
        var self = this;
        self.state = 1;
        clearTimeout(self.timer);
        self.timer=null;
        self.emit('close');
    });
}
util.inherits(Client, events.EventEmitter);
Client.prototype.connect = function(chatid,userid,pwd) { //连接到服务端
    var self = this;
    if (this.state != 0) return;
    this.client.connect(self.base.port, self.base.host, function() {
        var length;
        if(pwd && userid) { //length
            length=20;
        }else{
            length=12;
        }
        var data=new Buffer(length);
        data.writeUInt16BE(0x101,0);
        data.writeUInt16BE(length,2);
        if(!userid) userid=0;
        data.writeUInt32BE(chatid,4);
        data.writeUInt32BE(userid,8);
        if(pwd) data.write(pwd);
        self.send(data);
        self.state = 1;
    });
}
Client.prototype.send = function(data) {
    if(this.client.write(data)){
        this.state = 1;
        return true;
    }else{
        return false;
    }
}
Client.prototype.sendUnPacked = function(name, para) {
    var data = pack_data(name, para);
    if(this.client.write(data)){
        this.state = 1;
        return true;
    }else{
        return false;
    }
}
Client.prototype.disconnect = function() {
    this.client.destory();
}
Client.prototype.deliverData = function (data){
    var self = this;
    if(data.length<2) return this.emit('error', '意外的数据包');
    var index=data.readUInt16BE(0);
    switch(index){
        case 1:
            if(!this.timer){
                this.timer=setInterval(function(){
                    if(self.state==1){
                        var data=new Buffer(4);
                        data.writeUInt16BE(258,0);
                        data.writeUInt16BE(4,2);
                        self.send(data);
                    }
                }, 10*1000);
            }
            this.emit('login_success', data.readUInt32BE(2));
            break;
        case 2:
            if(data.length<=4) return this.emit('error', '接收异常的弹幕');
            var jsonlength=data.readUInt16BE(2);
            var jsondata=data.slice(4);
            if(data.length!=jsonlength) this.emit('error', '意外的新弹幕信息');
            this.emit('newCommentString', jsondata.toString('utf8'));
            break;
        case 6:
            if(data.length<=4) return this.emit('error', '接收异常的滚动信息');
            var jsonlength=data.readUInt16BE(2);
            var jsondata=data.slice(4);
            if(data.length!=jsonlength) this.emit('error', '意外的滚动信息');
            this.emit('newScrollMessage', jsondata.toString('utf8'));
            break;
        case 17:
            this.emit('error', 'Server Updated');
            break;
    }

}
function getBDataLength(index){
    var length;
    switch(index){
        case 0:
            length=0;
            break;
        case 1:
            length=6;
            break;
        case 2:
            length=0;
            break;
        case 3:
            length=0;
            break;
        case 4:
            length=0;
            break;
        case 5:
            length=0;
            break;
        case 6:
            length=0;
            break;
        case 7:
            length=0;
            break;
        case 8:
            length=4;
            break;
        case 16:
            length=3;
            break;
        case 17:
            length=2;
            break;
        default:
            length=-1;
            break;
    }
    return length;
}


function pack_data(index, payload) {
    var bufferdata = new Buffer(4+payload.length);
    bufferdata.writeUInt16BE(index,0);
    bufferdata.writeUInt16BE(4+payload.length,2);
    bufferdata.write(payload, 4);
    return bufferdata;
}
exports.Client = Client;