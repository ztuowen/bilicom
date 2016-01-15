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
var size=20;

exports.notify = function(msg) {
    var date = new Date();
    var time= date.getTime();

    var pos = getempty();
    screen[pos]=time;
    callnotify(msg,{time:timeout,
        offset:Math.round(pos*size*1.5)+1,
        fontsize:size,
        color:'white',
        position:'0'
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
    args.push('-b','255','-B','black');
    var osd = child_process.spawn('aosd_cat',args,{detached:true});
    osd.stdin.write(msg);
    osd.stdin.end();
}
