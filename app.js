var app = function(){
    var fs = require('fs');
    var logStream;
    var colors = require('colors');
    var libnotify = require('./libaosd.js');
    var pkginfo = require('./package.json');

    var CommentClient = require('./commentclient.js').Client;
    var Bili_live = require('./bili-live.js');
    var liveid;
    var config={
        "showTime":['t',false,'发射时间'],
        "showUserName":['u',true,'弹幕发送者'],
        "showWelcome":['w',true,'欢迎信息'],
        "notify":['n',false,'弹幕提示'],
    };
    var notify=true;
    var child_process = require('child_process');
    var comsend=null;

    var blessed = require('blessed');
    var screen,cmtBox,liveid,viewNum;
    var intervals=[];
    var postag=['topleft','topmid','topright','botleft','botmid','botright'];
    var curpos=0;
    var notconf={loc:postag[curpos],
        size:16
    };
    var cwd;
    var footer;
    var inbox;

    var nowclient;
    // The theme definition is taken from htop
    // TODO need to adapt it to this program
    var theme = {
        "name": "Becca",
        "author": "James Hall",
        "description": "In memory of Becca #663399. This is as close as we can get to that color in xterm",
        "title": {
            "fg": "#800080"
        },
        "chart": {
            "fg": "#800080",
            "border": {
                "type": "line",
                "fg": "#800080"
            }
        },
        "table": {
            "fg": "white",
            "items": {
                "selected": {
                    "bg": "#800080",
                    "fg": "bg"
                },
                "item": {
                    "fg": "fg",
                    "bg": "bg"
                }
            },
            "border": {
                "type": "line",
                "fg": "#800080"
            }
        },
        "footer": {
            "fg": "fg"
        }
    };

    function drawHeader(liveid){
        var headerText, headerTextNoTags;
        headerText = ' {bold}Bilicom{/bold}{white-fg} '+ pkginfo.version + ' for ' + liveid + ' ';
        headerTextNoTags = ' Bilicom '+ pkginfo.version + ' for ' + liveid + ' ';

        var header = blessed.text({
            top: 'top',
            left: 'left',
            width: headerTextNoTags.length,
            height: '1',
            fg: theme.title.fg,
            content: headerText,
            tags: true
        });

        viewNum = blessed.text({
            top: 'top',
            right: 0,
            width: 15,
            height: '1',
            align: 'right',
            content: '',
            tags: true
        });
        screen.append(header);
        screen.append(viewNum);
    }
    function drawFooter(){
        inbox = blessed.textarea({
            bottom: 1,
            height: 1,
            left: '0%',
            width: '100%',
            inputOnFocus: true,
            style: {          
                fg: '#787878',
                bg: '#454545',  

                focus: {        
                    fg: '#f6f6f6',
                    bg: '#353535' 
                }
            }
        })
        footer = blessed.text({
            bottom: '0',
            left: '0%',
            width: '100%',
            align: 'right',
            tags:true,
            content: '',
            fg: theme.footer.fg
        });
        inbox.key('enter',function(ch,key){
            var message = this.getValue().replace(/(\r\n|\n|\r)/gm,"");
            this.clearValue();
            if (comsend && message.length > 0)
                comsend.send(message);
            screen.rewindFocus();
            screen.render();
        });
        updateFooter();
        screen.append(footer);
        screen.append(inbox);
    }

    function updateFooter(){
        var text = '';
        for (var c in config) {
            var command = config[c];
            if (command[1])
                text += '  {white-bg}{black-fg}' + command[0] + '{/black-fg}{/white-bg}' + scrmul(command[2]);
            else
                text += '  {white-fg}{black-bg}' + command[0] + '{/black-bg}{/white-fg}' + scrmul(command[2]);
        }
        footer.setContent('  {white-fg}{black-bg}q{/black-bg}{/white-fg}'+scrmul('退出')
                +'  {white-fg}{black-bg}m{/black-bg}{/white-fg}'+scrmul('播放器')
                +'  {white-fg}{black-bg}p{/black-bg}{/white-fg}'+scrmul(notconf.loc)
                +'  {white-fg}{black-bg}+/-{/black-bg}{/white-fg}'+scrmul(notconf.size)+text);
        function scrmul(str){
            if (screen.width>90)
                return ' '+str;
            return '';
        }
    }

    return {
        init: function() {
            // parse cmdline
            var argv = require('yargs')
                .usage('usage: $0 [liveid] <options>')
                .demand(1)
                .boolean('L','login')
                .describe('L','Bilibili login')
                .alias('c', 'cookie')
                .describe('c', 'use cookie string')
                .alias('C', 'cookie-file')
                .describe('C', 'use cookie file(load/store,encrypted)')
                .alias('p', 'picexec')
                .describe('p', 'picture viewer(default:gpicview)')
                .boolean('l','log')
                .describe('l','enable logging')
                .alias('d','dir')
                .describe('d', 'log file dir,default to current dir')
                .help('help')
                .argv;
            liveid=argv._[0];
            Bili_live.getRoomID(liveid,afterRID);
            function afterRID(rid)
            {
                liveid=rid;
                if (argv.d)
                    cwd=argv.d;
                else
                    cwd=process.cwd();
                var wOption = {
                    flags: 'a',
                    encoding: null,
                    mode: '0666'
                };

                if (argv.l)
                {
                    logStream = fs.createWriteStream(cwd+'/'+liveid+'_'+new Date().getTime()+'.source',wOption);
                    var liveinfo = {liveid: liveid};
                    logStream.write(new Buffer(JSON.stringify(liveinfo)));
                    logStream.write(new Buffer([0x00,0x00]));
                }
                var fname = null;
                if (argv.L) {
                    require('./commentsend.js').login().login(null,null,afterLogin,argv.p);
                }
                else
                    afterLogin(argv.c);
            }
            function afterLogin(cookie)
            {
                if (argv.C) fname = argv.C;
                if (cookie)
                {
                        comsend=require('./commentsend.js').comsend();
                        comsend.initUnenc(fname,cookie,liveid,initBlessed);
                }
                else {
                    var st;
                    try{
                        st=fs.statSync(fname);
                        if (st.isFile())
                        {
                            comsend=require('./commentsend.js').comsend();
                            comsend.init(fname,liveid,initBlessed);
                        }
                        else
                            initBlessed();
                    } catch (e) {
                        initBlessed();
                    }
                }
            }
        }
    }
    function initBlessed()
    {
        // Clear all stdin listeners
        process.stdin.removeAllListeners('keypress');
        if (!process.version.match(/^v0/))
            process.stdin.removeAllListeners('data');
    
        // Create a screen object
        screen = blessed.screen({
            terminal: 'xterm-256color',
            fullUnicode:true
        });

        //Checking key strokes
        screen.on('keypress', function(ch, key){
            switch (ch){
                case 'q':
                    process.exit(0);
                    break;
                case 'm':
                    runmpv();
                    break;
                case 'n':
                    if (notify)
                        config.notify[1] = !config.notify[1];
                    break;
                case 't':
                    config.showTime[1] = !config.showTime[1];
                    break;
                case 'u':
                    config.showUserName[1] = !config.showUserName[1];
                    break;
                case 'w':
                    config.showWelcome[1]= !config.showWelcome[1];
                    break;
                case 'p':
                    notconf.loc=postag[curpos=(curpos+1)%6];
                    break;
                case 'D':
                    libnotify.notify("[测试] 这只是一个测试",notconf);
                    break;
                case '+':
                    if (notconf.size<30)
                        ++notconf.size;
                    break;
                case '-':
                    if (notconf.size>10)
                        --notconf.size;
                    break;
                default:
            }
            updateFooter();
        });
        screen.key('enter',function(ch,key){
            if (comsend)
                inbox.focus();
            else
            {
                inbox.content="如要发送弹幕，请参考'bilicom --help'";
                screen.render();
            }
        });

        drawHeader(liveid);
        drawFooter();

        cmtBox = blessed.box({
            top: 1,
            left: 'left',
            width: '100%',
            height: screen.height-3,
            keys: true,
            mouse: true,
            scrollable: true,
            fg: theme.table.fg
        });
        screen.append(cmtBox);

        screen.render();

        var setupCharts = function() {
            cmtBox.height = screen.height-3;
            updateFooter();
        };

        screen.on('resize', setupCharts);
        intervals.push(setInterval(draw, 100));

        function draw()
        {
            screen.render();
        }
        /**
         * Init Chat Client
         */
        (function(chat_id){
            cmtBox.insertLine(0,("=========直播间信息=========\nchat_id : " + chat_id.toString() + "\n============================").cyan);

            nowclient=connectCommentServer(chat_id);
        }(liveid));
        libnotify.callnotify("",{help:true},function(){
            cmtBox.insertLine(0,"[系统] ".red.bold+"aosd_cat没有找到，请验证libaosd安装是否成功".bold);
            notify =false;
        });
        /**
         * Open media player
         */
        function runmpv(){
            Bili_live.getLiveUrls(liveid, function(err,url){
                if (err==null) {
                    var child = child_process.spawn('mpv',['-v'],{detached:true,stdio: [ 'ignore', 'ignore', 'ignore' ]});
                    child.on('error',function(err){
                        cmtBox.insertLine(0,"[系统] ".red.bold+"mpv没有找到，请验证mpv安装是否成功".bold);
                    });
                    child.on('close',function(code){
                        if (code)
                            return;
                        cmtBox.insertLine(0,"[系统] ".bold.red+"正在启动播放器".bold);
                        var child = child_process.spawn('mpv',[url],{detached:true, stdio: [ 'ignore', 'ignore', 'ignore' ]});
                        child.unref();
                    });
                }
            });
        }
    };

    /**
     * 连接弹幕服务器
     * @param cid
     * @returns {*|Client}
     */
    function connectCommentServer(cid){
        var server= new CommentClient();

        server.on('server_error', function(err) {
            if (err.code)
                cmtBox.insertLine(0,"[系统] ".red.bold+("与服务器链接中断: "+err.code).bold);
            else
                cmtBox.insertLine(0,"[系统] ".bold.red + ("服务器发生错误: " + err).bold);
        });
        server.on('close', function() {
            cmtBox.insertLine(0,"[系统] ".bold.red + "5s后重新建立链接".bold);
            setTimeout(function(){
                nowclient.connect(liveid);
            }, 5000);
        });
        server.on('error', function(error) {
            cmtBox.insertLine(0,"[系统] ".bold.red + ("发生错误:" + error).bold);
        });
        server.on('login_success', function(num) {
            viewNum.setContent("在线人数 " + num.toString());
            if(logStream){
                logStream.write(new Buffer(JSON.stringify({action:"watcherNum",num:num})));
                logStream.write(new Buffer([0x00]));
            }
        });
        server.on('newCommentString', function(data) {
            data = JSON.parse(data);
            //save Danmu Info
            if(logStream){
                logStream.write(new Buffer(JSON.stringify(data)));
                logStream.write(new Buffer([0x00]));
            }

            if(!data && !data.roomid) {
                cmtBox.insertLine(0,JSON.stringify(data,null,2));
                return cmtBox.insertLine(0,"[弹幕] ".bold.green + "异常数据".red);
            }

            switch (data.cmd) {
                case "SEND_GIFT":
                    data=data.data;
                    var text='';
                    var date = data.timestamp;
                    date = DateFormat(date, 'hh:mm:ss');//yyyy-MM-dd
                    if(config.showTime[1]) text += ('[' + date + '] ').toString().yellow;
                    var username = selectColorText(data.uname,data.uid).bold;
                    text += username + " " + colors.yellow(data.action).bold + " " + colors.red(data.giftName + "x" + data.num).bold;
                    cmtBox.insertLine(0,"[投喂] ".bold.yellow + text);
                    if (config.notify[1])
                    {
                        text = "[投喂] " + data.uname + " " + data.action + " " + data.giftName + "x" + data.num;
                        libnotify.notify(text,notconf);
                    }
                    break;
                case "WELCOME":
                    if (config.showWelcome[1]){
                        data=data.data;
                        var text='';
                        var username = selectColorText(data.uname,data.uid).bold;
                        text += colors.yellow("欢迎") + " " + colors.red(data.uname) + " " + colors.yellow("进入直播间");
                        cmtBox.insertLine(0,"[欢迎] ".bold.yellow + text);
                        if (config.notify[1])
                        {
                            text = "[欢迎] " + "老爷" + data.uname + "进入直播间";
                            libnotify.notify(text,notconf);
                        }
                    }
                    break;
                case "DANMU_MSG":
                    data = data.info;//ignore other arguments

                    //获取时间
                    var date = data[0][4];
                    var msg = data[1];
                    date = DateFormat(date, 'hh:mm:ss');//yyyy-MM-dd

                    //获取发布者名称
                    var username = '';
                    if(data.length == 6){
                        username = selectColorText(data[2][1],data[2][0]).bold + " ";
                    }
                    if(data[3].length>0) {
                        username = colors.blue("(" + data[3][1] + ")") + username;
                    }

                    var text='';
                    if(config.showTime[1]) text += ('[' + date + '] ').toString().yellow;
                    if(config.showUserName[1]) text += username;
                    text += replaceES(msg).bold;
                    text = "[弹幕] ".bold.green + text;
                    cmtBox.insertLine(0,text);

                    if (config.notify[1])
                    {
                        text='';
                        username = '';
                        if(data.length == 6){
                            username = data[2][1] + " ";
                        }
                        if(data[3].length>0) {
                            username = "(" + data[3][1] + ")" + username;
                        }
                        if(config.showUserName[1]) text += username;
                        text += msg;
                        text = "[弹幕] " + text;

                        libnotify.notify(text,notconf);
                    }
                    break;
                default:
                    cmtBox.insertLine(0,JSON.stringify(data,null,2));
                    cmtBox.insertLine(0,"[弹幕] ".bold.green + "空弹幕".red);
            }

        });
        server.on('newScrollMessage', function(data) {
            //json {text:"",highlight:?,bgcolor:?,flash:?,tooltip:?}
            cmtBox.insertLine(0,"新滚动信息:" + eval("("+data+")").text);
        });

        server.on('unknown_bag', function(data) {
            cmtBox.insertLine(0,("异常数据:" + data).toString().red);
        });
        server.connect(cid);
        return server;

        function selectColorText(text,id){
            var _colors = ['yellow', 'red', 'green', 'cyan', 'magenta'];
            return colors[_colors[id % _colors.length]](text);
        }
    }

    /*
     UTIL
     */
    function parseLiveUrl(url){
        var liveid = (url + "/").match(/live.bilibili.com\/(.*?)\//);
        return liveid[1];
    }

    function isblank(text){
        return(!text || text=='');
    }
    function replaceES(text){
        return html_decode(text);
    }
    function html_decode(str)
    {
        var s;
        if (str.length == 0) return "";
        s = str.replace(/&gt;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    }
    function DateFormat(time,fmt) {
        time=new Date(time * 1000);
        var o = {
            "M+": time.getMonth() + 1, //月份
            "d+": time.getDate(), //日
            "h+": time.getHours(), //小时
            "m+": time.getMinutes(), //分
            "s+": time.getSeconds(), //秒
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度
            "S": time.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

}();

app.init();
