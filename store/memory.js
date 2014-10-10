module.exports = function(app, config) {
    return new Model(app, config);
}

var _       = require('lodash');
var Promise = require('bluebird');
var Moment  = require('moment');


Model = function(app, config) {
    this.app    = app;
    this.config = config;
    this.data   = {};
    this.loaded = false;

    return this;
};

Model.prototype.load = function(newData) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.data   = newData;
        self.loaded = true;
        return resolve(self.data);
    });
}

Model.prototype.getData = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        return resolve(self.data);
    });
}

Model.prototype.isLoaded = function() {
    return this.loaded;
}

Model.prototype.getPosts = function(tag, author) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var posts = self.data.posts;

        if (tag) {
            posts = _.filter(posts, function(a) { return _.contains(a.metas.tags, tag); });
        }

        if (author) {
            posts = _.filter(posts, function(a) {
                return (a.metas.publish_by.toLowerCase() == author.email.toLowerCase()) ||
                       (a.metas.publish_by.toLowerCase() == author.slug.toLowerCase());
            });
        }

        var sortData = function(p) {
            return -(Moment(p.metas.publish_at).unix());
        }

        posts = _.sortBy(posts, sortData);
        console.log("POST ARE : ");
        console.log(posts);

        return resolve(posts);
    });
}

Model.prototype.getNbPosts = function() {
    return new Promise.resolve(this.loaded ? this.data.posts.length : 0);
}

Model.prototype.getPost = function(slug) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (!slug || typeof slug !== 'string') {
            reject("Invalid slug supplied");
        } else {
            slug = slug.toLowerCase();
            var post = _.find(self.data.posts, function(p) { return p.metas.slug == slug });
            return post ? resolve(post) : reject("Post not found");
        }
    });
}

Model.prototype.getTags = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        return resolve(self.data.tags);
    })
}

Model.prototype.getNbTags = function() {
    return new Promise.resolve(this.loaded ? this.data.tags.length : 0);
}

Model.prototype.getAuthors = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        return resolve(self.data.users);
    })
}

Model.prototype.getAuthor = function(slug) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (!slug || typeof slug !== 'string') {
            reject("Invalid slug supplied");
        } else {
            slug = slug.toLowerCase();
            var u = _.find(self.data.users, function(u) {
                return _.contains(slug, '@') ? (u.email.toLowerCase() == slug) : (u.slug.toLowerCase() == slug);
            });
            return u ? resolve(u) : reject("Author not found");;
        }
    });
}

Model.prototype.getNbAuthors = function() {
    return new Promise.resolve(this.loaded ? this.data.users.length : 0);
}

