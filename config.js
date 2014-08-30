/**
 * 配置 Bili直播弹幕助手
 * @type {{showTime: boolean, showWatcherNum: boolean, showUserName: boolean, reconnect: boolean, save: boolean}}
 * showTime [弹幕]是否显示时间?  true 是 / false 否
 * showWatcherNum [服务器]是否显示在线人数?  true 是 / false 否
 * showUserName [弹幕]是否显示发布者?(仅限live有效)  true 是 / false 否
 * reconnect [服务器]是否断线重连?  true 是 / false 否
 * save [弹幕]是否保存弹幕源数据?  true 是 / false 否 【弹幕源数据保存至 程序根目录下的 comments 文件夹,命名格式 cid_timestamp.source】
 */
exports.config={
    "showTime":false,
    "showWatcherNum":false,
    "showUserName":true,
    "reconnect":true,
    "save":false
};

/**
 * 配置 直播室 ,用于访问弹幕服务器
 * @type {{url: string, roomid: string}}
 * url / roomid 二选一 (优先是url)
 * url 直播室网址 例如: url:'http://live.bilibili.com/live/1029.html' (切记 一定要用 英文逗号圈住地址)
 * roomid 直播室id 例如 roomid:'1029' 或者 roomid:1029
 * 以上参数留空可以用 '' 或者 null
 */
exports.liveroom={
    url:'',
    roomid:null
};
