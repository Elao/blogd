module.exports = function(app, config) {
    return new Model(app, config);
}

var _       = require('lodash');
var Promise = require('bluebird');
var fs      = require('fs');

Model = function(app, config) {
    this.app    = app;
    this.config = config;
    this.store  = require('../store/' + config.store)(app, config);
    return this;
};

Model.prototype.restore = function(data) {
    var self = this;
    return self.store.load(data);
}

Model.prototype.load = function(data) {
    var self = this;
    return this.store.load(data).then(function() {
        return self.store.getData().then(function(data) {
            return new Promise(function(resolve, reject) {
                fs.writeFile(self.config.backupFile, JSON.stringify(data), function(err) {
                    if(err) {
                        return reject(err);
                    } else {
                        return resolve(self.getStatus());
                    }
                })
            });
        });
    });
}

Model.prototype.getStatus = function() {
    var self = this;
    return Promise.props({
                source:         self.config.source,
                data_loaded:    self.loaded,
                nb_posts:       self.getNbPosts(),
                nb_authors:     self.getNbAuthors(),
                nb_tags:        self.getNbTags(),
                last_update:    self.getLastRefresh()
            });
}

Model.prototype.getLastRefresh = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        try {
            fs.stat(self.config.backupFile, function(err, stat) {
                if (err) {
                    resolve('N/A');
                } else {
                    resolve(stat.mtime);
                }
            });
        } catch(e) {
            reject(e);
        };
    });
}

Model.prototype.getData = function() {
    return this.store.getData();
}

Model.prototype.getPosts = function(tag, author) {
    return this.store.getPosts(tag, author);
}

Model.prototype.getNbPosts = function() {
    return this.store.getNbPosts();
}

Model.prototype.getPost = function(slug) {
    var self = this;
    return self.store.getPost(slug)
           .then(function(post) {
                return self.store.getAuthor(post.metas.publish_by)
                           .then(function(author) {
                                post.author = author;
                                return post;
                            });
        });
}

Model.prototype.getTags = function() {
    return this.store.getTags();
}

Model.prototype.getNbTags = function() {
    return this.store.getNbTags();
}

Model.prototype.getAuthors = function() {
    return this.store.getAuthors();
}

Model.prototype.getAuthor = function(slug) {
    return this.store.getAuthor(slug);
}

Model.prototype.getNbAuthors = function() {
    return this.store.getNbAuthors();
}

Model.prototype.getData = function() {
    return this.store.getData();
}
