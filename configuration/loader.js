var fs   = require('fs');
var _    = require('lodash');
var path = require('path');

var cfg    = __dirname + '/../config.js';
var loaded = false;
var defaultConfig = {
    host:           '127.0.0.1',
    port:           5555,
    store:          'memory',
    debug:          false,
    outputFolder:   __dirname + "/../content",
    backupFile:     __dirname + "/../current.json",
    assetsToCopy:   [{
        from: __dirname + "/../content/posts/images/",
        to:   __dirname + "/../public/images",
        url:  "/images"
    }],
    security: {
        rules: {
            guest: {},
            admin: {}
        },
        basic: {
            realm:    'BlogD Private Api',
            user:     'admin',
            password: 'private'
        }
    }
}


if (fs.existsSync(cfg)) {
    console.info("Loading config from " + path.resolve(cfg));
    loaded = true;
    module.exports = _.defaults(require('../config.js'), defaultConfig);
} else {
    var cnt = 0;
    var p1f = path.resolve(__dirname + '/../package.json');
    var p2f = path.resolve(__dirname + '/../../../package.json');

    if (fs.existsSync(p1f)) {
        var pkg = require(p1f);
        if (_.has(pkg, 'blogd')) {
            console.info("Loading config from " + p1f);
            module.exports = _.defaults(pkg.blogd, defaultConfig);
            loaded = true;
        }
    }

    if (!loaded && fs.existsSync(p2f)) {
        var pkg = require(p2f);
        if (_.has(pkg, 'blogd')) {
            console.info("Loading config from " + p2f);
            module.exports = _.defaults(pkg.blogd, defaultConfig);
            loaded = true;
        }
    }
}

if (!loaded) {
    throw new Error("No configuration found (no config.js file, and no \"blogd\" config key in package.json");
}
