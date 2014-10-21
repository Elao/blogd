module.exports = function (app, config) {
    return new Sourcer(app, config);
}

var _       = require('lodash'),
    Promise = require('bluebird'),
    ncp     = require('ncp').ncp;

ncp.limit = 16;

Sourcer = function(app, config) {
    this.app    = app;
    this.config = config;

    return this;
}

Sourcer.prototype.load = function(folder) {
    var self = this;

    return new Promise(function(resolve, reject) {
        ncp(self.config.source.path, folder, function (err) {
            return err ? reject(err) : resolve();
        });
    });
}
