/**
 * A simple notification library using aosd_cat
 **/

var child_process = require('child_process');

// Timeout of notification to be 4s
var timeout=4000;

// Each position has its own queue in case of conflict
var position={topleft:['0',1,0,[]],
    topmid:['1',1,0,[]],
    topright:['2',1,0,[]],
    botleft:['6',-1,0,[]],
    botmid:['7',-1,0,[]],
    botright:['8',-1,0,[]]
};

// Wraper for raw aosd_cat
// Input: msg & options@{size,loc}
exports.notify = function(msg,options) {
    var date = new Date();
    var time= date.getTime();
    var options=options || {};
    options.size = options.size || 16;
    options.loc = options.loc || 'topleft';

    var pos = getempty(options.loc);
    position[options.loc][3][pos]=time;
    callnotify(msg,{time:timeout,
        offset:Math.round(pos*(options.size+1)*1.7*position[options.loc][1])+'',
        fontsize:options.size,
        color:'white',
        position:position[options.loc][0]
    });

    // Find the first empty place
    function getempty(loc){
        for (var i=0;i<position[loc][2];++i)
            if (position[loc][3][i]<time-timeout)
                return i;
        position[loc][3].push(0);
        position[loc][2]+=1;
        return position[loc][2]-1;
    }
}

// Raw aosd_cat options
// Input: msg & options
callnotify = function(msg, options) {
    var args = [],
      options = options || {};
    var EOF = new Buffer(1); EOF[0] = -1;
    options.font = options.font || "Source han sans";
    options.fontsize = options.fontsize || 16;
    if (options.time) args.push('-u', options.time);
    if (options.offset) args.push('-y', options.offset);
    if (options.align) args.push('-A', options.align);
    if (options.position) args.push('-p', options.position);
    if (options.color) args.push('-R',options.color);
    args.push('-n', options.font+' '+options.fontsize);
    args.push('-b','255','-B','black','-x','0');
    var osd = child_process.spawn('aosd_cat',args,{detached:true});
    osd.stdin.write(msg);
    osd.stdin.end();
}
