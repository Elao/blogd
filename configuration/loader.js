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
    console.info("Config: " + path.resolve(cfg));
    module.exports = _.defaults(require('../config.js'), defaultConfig);
} else {
    var cnt = 0;
    var paths = [
        path.resolve(process.cwd() + '/package.json'),
        path.resolve(__dirname + '/../package.json'),
        path.resolve(__dirname + '/../../../package.json')
    ];
    var configFile = false;
    var pkg        = false;
    var found      = false;
    for (var i = 0; i < paths.length; i++) {
        var p = paths[i];
        if (fs.existsSync(p)) {
            pkg = require(p);
            if (_.has(pkg, 'blogd') && _.isObject(pkg.blogd)) {
                configFile = p;
                found = true;
                break;    
            }
        }
    }
    if (found) {
        console.info("Config: "+configFile);
        module.exports = _.defaults(pkg.blogd, defaultConfig);
    } else {
        console.error("Error: Configuration not found no config.js file, and no 'blogd' config key in package.json");
        process.exit(1);
    }
}

