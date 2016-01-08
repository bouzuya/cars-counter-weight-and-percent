'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _twitter = require('twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getUserTimeline = function getUserTimeline(twitter, options) {
    return new Promise(function (resolve, reject) {
        var params = {
            user_id: options.userId,
            count: 200,
            include_rts: false,
            exclude_replies: true
        };
        if (options.maxId) params.max_id = options.maxId;
        twitter.get('statuses/user_timeline', params, function (error, timeline) {
            if (error) {
                reject(error);
            } else {
                resolve(timeline);
            }
        });
    });
};
var getUserTimelineRecursive = function getUserTimelineRecursive(twitter, userId, until, result, maxId) {
    return getUserTimeline(twitter, { userId: userId, maxId: maxId }).then(function (tweets) {
        var d = function d(s) {
            return (0, _moment2.default)(Date.parse(s));
        };
        var since = (0, _moment2.default)(until).startOf('day');
        var m = tweets.filter(function (i) {
            return d(i.created_at).isBetween(since, until);
        });
        var r = result.concat(m);
        if (tweets.length === 0 || tweets.some(function (i) {
            return d(i.created_at).isAfter(until);
        })) return r;
        var newMaxId = tweets[tweets.length - 1].id;
        return getUserTimelineRecursive(twitter, userId, until, r, newMaxId);
    });
};
var fetch = function fetch() {
    var twitter = new _twitter2.default({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
    var userId = '125962981'; // bouzuya
    var until = (0, _moment2.default)().subtract(1, 'day').endOf('day');
    return getUserTimelineRecursive(twitter, userId, until, []);
};

exports.default = function (callback) {
    fetch().then(function (tweets) {
        var p = /^\s*(\d+\.\d)\s+(\d+)$/;
        var t = tweets.filter(function (i) {
            return i.text.match(p);
        });
        if (t.length === 0) return {};
        var m = t[0].text.match(/^\s*(\d+\.\d)\s+(\d+)$/);
        return {
            weight: parseFloat(m[1]),
            percent: parseInt(m[2])
        };
    }).then(function (counts) {
        return callback(null, counts);
    }, callback);
};