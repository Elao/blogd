module.exports = function (app, config) {
    return new Sourcer(app, config);
}

var _       = require('lodash'),
    Promise = require('bluebird'),
    request = require('request'),
    fs      = require('fs'),
    AdmZip  = require('adm-zip');

Sourcer = function(app, config) {
    this.app    = app;
    this.config = config;

    return this;
}

Sourcer.prototype.load = function(folder) {
    var self = this;
    var url  = self.config.source.url;

    return new Promise(function(resolve, reject) {
        request(url, {encoding: null}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error || new Error("Failed to download " + url + " : " + response.statusCode));
            }
        });
    }).then(function(content) {
        return self.unzip(content, folder);
    });
}

Sourcer.prototype.unzip = function(buffer, folder) {
    var self = this;
    return new Promise(function(resolve, reject) {
        try {
            var zip      = new AdmZip(buffer);
            var entries  = {};
            _.each(zip.getEntries(), function(entry) {
                var level = _.filter(entry.entryName.split('/'), function(p){return p.trim() != ''}).length;
                if (!entries[level]) {
                    entries[level] = [];
                }
                entries[level].push(entry);
            });

            if (entries["1"].length == 1 && entries["1"][0].isDirectory) {
                zip.extractEntryTo(entries["1"][0], folder, false, true);
            } else {
                zip.extractAllTo(folder, true);
            }
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}
