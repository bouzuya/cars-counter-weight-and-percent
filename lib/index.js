'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fetch = require('./fetch');

var _fetch2 = _interopRequireDefault(_fetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (callback) {
    (0, _fetch2.default)().then(function (tweets) {
        var p = /^\s*(\d+\.\d)\s+(\d+)$/;
        var t = tweets.filter(function (i) {
            return i.text.match(p) !== null;
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