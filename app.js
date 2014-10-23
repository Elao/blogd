#!/usr/bin/env node

var express     = require('express'),
    bodyParser  = require('body-parser'),
    _           = require('lodash'),
    util        = require('util'),
    RF          = require('rest-framework'),
    Promise     = require('bluebird'),
    fs          = require('fs');


var app = exports = module.exports = express();

app.utils = RF.Utils;

app.enable('trust proxy');
app.disable('x-powered-by');
app.enable('strict routing');


// Config
app.config = require('./configuration/loader');

if (!app.config.source) {
    console.log("Error config: 'source' parameter is missing");
    process.exit(1);
}

// Logger
app.logger = require('./logger/logger.js')(app, app.config);

// Model
app.db = require('./model/model')(app, app.config);

// Extractor
app.extractor = require('./services/extractor')(app, app.config);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

_.each(app.config.assetsToCopy, function(assetToCopy) {
    if (assetToCopy.url) {
        app.use(assetToCopy.url, express.static(assetToCopy.to));    
    }
});

function listening() {
    app.logger.debug("Listening on "+app.config.host+":"+app.config.port);
    app.listen(app.config.port, app.config.host);
}

function loadFreshContent() {
    app.logger.debug("Loading fresh content");
    return app.extractor.refreshData()
    .then(function(refreshResult) {
        if (refreshResult.status) {
            return app.db.load(refreshResult.data);
        } else {
            _.map(refreshResult.errors, function(e) { app.logger.error("Error : " + e)});
            _.map(refreshResult.warnings, function(w) { app.logger.info("Warning : " + w)});
            throw new Error("Error checking the data");
        }
    });
}

fs.readFile(app.config.backupFile, function(err, data) {
    if (err) { // File doesnt exists or is unreadable
        app.logger.error("Backup file "+app.config.backupFile+" not found or unreadable");
        loadFreshContent()
        .then(listening)
        .catch(function(e){
            app.logger.error("Error loading fresh content : ", e);
        })
    } else {
        try {
            var data = JSON.parse(data);
            app.db.restore(data).then(function(){
                app.logger.debug("Db load from backup : " + app.config.backupFile);    
                listening();
            })
        }catch(e) {
            app.logger.error("Error parsing backup file " + app.config.backupFile + " : "+e.message);
            loadFreshContent()
            .then(listening)
            .catch(function(e){
                app.logger.error("Error loading fresh content : ", e);
            })
        }
    }
});

var Routing = RF.Routing(app, RF.Security(null, app.config.security), {pathControllers: __dirname + '/controllers'});
var ApiController = Routing.loadController('api', app.config);

Routing.loadRoute('GET',    '/posts',         'admin',       'api/posts')
       .loadRoute('GET',    '/posts/:tag',    'admin',       'api/posts')
       .loadRoute('GET',    '/post/:slug',    'admin',       'api/post')
       .loadRoute('GET',    '/tags',          'admin',       'api/tags')
       .loadRoute('GET',    '/authors',       'admin',       'api/authors')
       .loadRoute('GET',    '/status',        'admin',       'api/status')
       .loadRoute('GET',    '/refresh',       'admin',       'api/refresh')
       .loadRoute('GET',    '/authors/:slug', 'admin',       'api/author')
       .loadRoute('GET',    '/authors/:slug/posts', 'admin', 'api/authorPosts');


