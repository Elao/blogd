module.exports = function (app, config) {
    return new Sourcer(app, config);
}

var _       = require('lodash'),
    Promise = require('bluebird'),
    Clone   = require("nodegit").Repo.clone;

Sourcer = function(app, config) {
    this.app    = app;
    this.config = config;

    return this;
}

Sourcer.prototype.load = function(folder) {
    var self = this;
    return new Promise(function(resolve, reject) {
        Clone(self.config.source.repository, folder, null, function(err, repo) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    })
}
