// libnotify - Copyright Mitko Kostov <mitko.kostov@gmail.com> (MIT Licensed)
// fork of visionmedia's node-growl modified to work with libnotify on linux

/**
 * Module dependencies.
 */

var child_process = require('child_process');

/**
 * Send libnotify notification _msg_ with _options_.
 *
 * Options:
 *
 *  - title   Notification title
 *  - time    Set the expiration time
 *  - image
 *    - path to an image sets -i ( you can also use stock icons )
 *
 * Examples:
 *
 *   growl.notify('New email')
 *   growl.notify('5 new emails', { title: 'Thunderbird' })
 *   growl.notify('Email sent', function(){
 *     // ... notification sent
 *   })
 *
 * @param {string} msg
 * @param {object} options
 * @param {function} callback
 * @api public
 */

var screen=[],l=0;
var timeout=4000;
var size=16;
var position={topleft:['0',1],
    topmid:['1',1],
    topright:['2',1],
    botleft:['6',-1],
    botmid:['7',-1],
    botright:['8',-1]
};

exports.notify = function(msg,loc) {
    var date = new Date();
    var time= date.getTime();
    var loc = loc || 'topleft'

    var pos = getempty();
    screen[pos]=time;
    callnotify(msg,{time:timeout,
        offset:Math.round(pos*size*1.5*position[loc][1])+1,
        fontsize:size,
        color:'white',
        position:position[loc][0]
    });
    function getempty(){
        for (var i=0;i<l;++i)
            if (screen[i]<time-timeout)
                return i;
        screen.push(0);
        l+=1;
        return l-1;
    }
}

clear = function(){
    screen = [];
    l=0;
}

callnotify = function(msg, options) {
    var args = [],
      options = options || {};
    var EOF = new Buffer(1); EOF[0] = -1;
    if (options.time) args.push('-u', options.time);
    if (options.offset) args.push('-y', options.offset);
    if (options.align) args.push('-A', options.align);
    if (options.position) args.push('-p', options.position);
    if (options.color) args.push('-R',options.color);
    if (options.fontsize) args.push('-n', 'Sans '+options.fontsize);
    else args.push('-n', 'Sans 20');
    args.push('-b','255','-B','black','-x','0');
    var osd = child_process.spawn('aosd_cat',args,{detached:true});
    osd.stdin.write(msg);
    osd.stdin.end();
}
