var fs   = require('fs');
var _    = require('lodash');
var path = require('path');

var cfg    = __dirname + '/../config.js';
var loaded = false;


if (fs.existsSync(cfg)) {
    console.info("Loading config from " + path.resolve(cfg));
    loaded = true;
    module.exports = require('../config.js');
} else {
    var cnt = 0;
    var p1f = path.resolve(__dirname + '/../package.json');
    var p2f = path.resolve(__dirname + '/../../../package.json');

    if (fs.existsSync(p1f)) {
        var pkg = require(p1f);
        if (_.has(pkg, 'blogd')) {
            console.info("Loading config from " + p1f);
            module.exports = pkg.blogd;
            loaded = true;
        }
    } else if (fs.existsSync(p2f)) {
        var pkg = require(p2f);
        if (_.has(pkg, 'blogd')) {
            console.info("Loading config from " + p2f);
            module.exports = pkg.blogd;
            loaded = true;
        }
    }
}

if (!loaded) {
    throw new Error("No configuration found (no config.js file, and no \"blogd\" config key in package.json");
}
