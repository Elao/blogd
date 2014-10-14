var express     = require('express'),
    _           = require('lodash'),
    util        = require('util'),
    Amabla      = require('amabla-core'),
    Promise     = require('bluebird'),
    fs          = require('fs');


var app = exports = module.exports = express();

app.utils = require('amabla-core').Utils;

app.configure(function() {
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.enable('strict routing');

    // Config
    app.config = require('./configuration/loader');

    // Model
    app.db = require('./model/model')(this, app.config);

    // Extractor
    app.extractor = require('./services/extractor')(this, app.config);

    app.use(express.json());
    app.use(express.urlencoded());

    app.use('/images', express.static(__dirname + '/public/images'));

    fs.readFile(app.config.backupFile, function(err, data) {
        var loaded = false;
        if (err) { // File doesnt exists or is unreadable
            console.log("Backup file "+app.config.backupFile+" not found or unreadable");
        } else {
            try {
                var data = JSON.parse(data);
                app.db.restore(data);
                loaded = true;
                console.log("Db load from backup : " + app.config.backupFile);
                app.db.getData().then(function(data) {

                })
            }catch(e) {
                console.log("Error parsing backup file " + app.config.backupFile + " : "+e.message);
            }
        }
        if (!loaded) {
            console.log("Getting fresh content");
            app.extractor.refreshData()
            .then(function(refreshResult) {
                if (refreshResult.status) {
                    return app.db.load(refreshResult.data);
                } else {
                    _.map(refreshResult.errors, function(e) { console.log("Error : " + e)});
                    _.map(refreshResult.warnings, function(w) { console.log("Warning : " + w)});
                }
            })
        }
    });

    var Routing = Amabla.Routing(app, Amabla.Security(null, app.config.security));
    var ApiController = Routing.loadController('api', app.config);


    Routing.loadRoute('GET',    '/posts',         'admin',   'api/posts')
           .loadRoute('GET',    '/posts/:slug',   'admin',   'api/post')
           .loadRoute('GET',    '/tags',          'admin',   'api/tags')
           .loadRoute('GET',    '/authors',       'admin',   'api/authors')
           .loadRoute('GET',    '/status',        'admin',   'api/status')
           .loadRoute('GET',    '/refresh',       'admin',   'api/refresh')
           .loadRoute('GET',    '/authors/:slug', 'admin',   'api/author')
           .loadRoute('GET',    '/authors/:slug/posts', 'admin', 'api/authorPosts');

    app.listen(app.config.port);
});
